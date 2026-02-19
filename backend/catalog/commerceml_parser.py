# backend/catalog/commerceml_parser.py
import xml.etree.ElementTree as ET
import requests
from django.utils.text import slugify
from .models import Category, Product, ProductImage, ProductSize, SyncLog
from django.utils import timezone
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

def _detect_ns(root):
    """Detect namespace from root element tag (e.g. urn:1C.ru:commerceml_21)."""
    tag = root.tag
    if tag.startswith('{'):
        return tag[1:tag.index('}')]
    return ''


def _make_tag(ns, name):
    """Return namespaced tag string, or plain name if no namespace."""
    if ns:
        return f'{{{ns}}}{name}'
    return name


# ============================================================
# Standalone parsing functions (used by both pull and push)
# ============================================================

def sync_categories_from_tree(root):
    """
    Sync categories from a parsed XML ElementTree root.
    Returns count of categories synced.
    """
    ns = _detect_ns(root)
    logger.info(f"XML namespace: '{ns}'")

    def t(name):
        return _make_tag(ns, name)

    count = 0
    groups = root.findall(f'.//{t("Группа")}')
    logger.info(f"Найдено {len(groups)} категорий")

    for group in groups:
        try:
            id_elem = group.find(t('Ид'))
            name_elem = group.find(t('Наименование'))
            if id_elem is None or name_elem is None:
                continue
            id_1c = id_elem.text
            name = name_elem.text

            parent_id = None
            parent_elem = group.find(f'{t("Группы")}/{t("Ид")}')
            if parent_elem is not None:
                try:
                    parent = Category.objects.get(id_1c=parent_elem.text)
                    parent_id = parent.id
                except Category.DoesNotExist:
                    pass

            category, created = Category.objects.update_or_create(
                id_1c=id_1c,
                defaults={
                    'name': name,
                    'slug': slugify(name, allow_unicode=True),
                    'parent_id': parent_id,
                    'is_active': True,
                }
            )
            count += 1
            logger.debug(f"{'Создана' if created else 'Обновлена'} категория: {name}")
        except Exception as e:
            logger.error(f"Ошибка обработки категории: {str(e)}")
            continue

    return count


def sync_products_from_tree(root, image_url_prefix=''):
    """
    Sync products from a parsed XML ElementTree root.

    image_url_prefix: URL prefix for resolving relative image paths.
      - For push mode (1C uploads files): e.g., 'https://site.com/media/1c_images/'
      - For pull mode (fetching from 1C): e.g., 'http://1c-server/base/catalog/'

    Returns count of products synced.
    """
    ns = _detect_ns(root)

    def t(name):
        return _make_tag(ns, name)

    count = 0
    products = root.findall(f'.//{t("Товар")}')
    logger.info(f"Найдено {len(products)} товаров")

    for prod in products:
        try:
            id_elem = prod.find(t('Ид'))
            name_elem = prod.find(t('Наименование'))
            if id_elem is None or name_elem is None:
                continue
            id_1c = id_elem.text
            name = name_elem.text

            article_elem = prod.find(t('Артикул'))
            article = article_elem.text if article_elem is not None else id_1c[:10]

            category_id_elem = prod.find(f'{t("Группы")}/{t("Ид")}')
            if category_id_elem is None:
                logger.warning(f"Товар {name} без категории, пропускаем")
                continue

            try:
                category = Category.objects.get(id_1c=category_id_elem.text)
            except Category.DoesNotExist:
                logger.warning(f"Категория не найдена для товара {name}")
                continue

            description_elem = prod.find(t('Описание'))
            description = (description_elem.text or '') if description_elem is not None else ''

            product, created = Product.objects.update_or_create(
                id_1c=id_1c,
                defaults={
                    'category': category,
                    'name': name,
                    'article': article,
                    'description': description,
                    'synced_at': timezone.now(),
                    'is_active': True,
                }
            )

            # Images
            images = prod.findall(t('Картинка'))
            if images:
                ProductImage.objects.filter(product=product, is_from_1c=True).delete()

                for idx, img in enumerate(images):
                    image_path = img.text
                    if not image_path:
                        continue
                    if image_path.startswith('http'):
                        image_url = image_path
                    else:
                        image_url = f"{image_url_prefix}{image_path}"

                    if idx == 0:
                        product.main_image = image_url
                        product.save()

                    ProductImage.objects.create(
                        product=product,
                        image_url=image_url,
                        is_from_1c=True,
                        sort_order=idx
                    )

            # Characteristics (sizes)
            characteristics = prod.findall(
                f'{t("ХарактеристикиТовара")}/{t("ХарактеристикаТовара")}'
            )
            for char in characteristics:
                name_elem = char.find(t('Наименование'))
                value_elem = char.find(t('Значение'))
                if name_elem is not None and value_elem is not None:
                    if name_elem.text and name_elem.text.lower() in ['размер', 'size']:
                        ProductSize.objects.get_or_create(
                            product=product,
                            size=value_elem.text
                        )

            count += 1
            logger.debug(f"{'Создан' if created else 'Обновлен'} товар: {name}")
        except Exception as e:
            logger.error(f"Ошибка обработки товара: {str(e)}")
            continue

    return count


def sync_offers_from_tree(root):
    """
    Sync prices and stock from a parsed XML ElementTree root.
    Accumulates total_stock per product from all its offers.
    """
    ns = _detect_ns(root)

    def t(name):
        return _make_tag(ns, name)

    offers = root.findall(f'.//{t("Предложение")}')
    logger.info(f"Найдено {len(offers)} предложений")

    # Accumulate total stock per product across all offers
    product_total_stocks = {}  # product_id_1c -> sum of all offer stocks

    for offer in offers:
        try:
            id_elem = offer.find(t('Ид'))
            if id_elem is None:
                continue

            offer_id = id_elem.text
            product_id = offer_id.split('#')[0]

            try:
                product = Product.objects.get(id_1c=product_id)
            except Product.DoesNotExist:
                continue

            # Price (take from any offer — they all have the same price)
            price_elem = offer.find(
                f'{t("Цены")}/{t("Цена")}/{t("ЦенаЗаЕдиницу")}'
            )
            if price_elem is not None:
                try:
                    product.price = Decimal(price_elem.text)
                except Exception:
                    pass

            # Stock
            stock = 0
            stock_elem = offer.find(t('Количество'))
            if stock_elem is not None:
                try:
                    stock = int(float(stock_elem.text))
                except Exception:
                    pass

            # Accumulate total stock for this product
            if product_id not in product_total_stocks:
                product_total_stocks[product_id] = 0
            product_total_stocks[product_id] += stock

            # Try to update size-specific stock if this is a variant offer
            if '#' in offer_id:
                size_value = None

                # Try ХарактеристикиТовара in the offer
                char_elems = offer.findall(
                    f'{t("ХарактеристикиТовара")}/{t("ХарактеристикаТовара")}'
                )
                for char in char_elems:
                    char_name = char.find(t('Наименование'))
                    char_value = char.find(t('Значение'))
                    if char_name is not None and char_value is not None:
                        if char_name.text and char_name.text.lower() in ['размер', 'size']:
                            size_value = char_value.text
                            break

                # Fallback: try to extract size from offer name
                if not size_value:
                    name_elem = offer.find(t('Наименование'))
                    if name_elem is not None and name_elem.text:
                        offer_name = name_elem.text
                        for marker in ['Размер:', 'Размер ', 'Size:', 'Size ']:
                            if marker in offer_name:
                                size_value = offer_name.split(marker)[-1].strip().rstrip(')')
                                break
                        # Fallback: extract from trailing parentheses
                        # e.g. "Футболка арт. 241\12 B (5XL(60))" → "5XL(60)"
                        if not size_value and offer_name.endswith(')'):
                            depth = 0
                            for i in range(len(offer_name) - 1, -1, -1):
                                if offer_name[i] == ')':
                                    depth += 1
                                elif offer_name[i] == '(':
                                    depth -= 1
                                    if depth == 0:
                                        size_value = offer_name[i+1:-1].strip()
                                        break

                if size_value:
                    size_obj, _ = ProductSize.objects.get_or_create(
                        product=product, size=size_value
                    )
                    size_obj.stock = stock
                    size_obj.save()

            product.save()
        except Exception as e:
            logger.error(f"Ошибка обработки предложения: {str(e)}")
            continue

    # Bulk update total_stock for all products from accumulated values
    updated = 0
    for prod_id_1c, total in product_total_stocks.items():
        Product.objects.filter(id_1c=prod_id_1c).update(total_stock=total)
        updated += 1
    logger.info(f"total_stock обновлён для {updated} товаров")


def _update_log(log_id, progress, step):
    """Update SyncLog progress and current_step without loading the full object."""
    if log_id is None:
        return
    try:
        from .models import SyncLog
        SyncLog.objects.filter(id=log_id).update(progress=progress, current_step=step)
    except Exception:
        pass


def sync_offers_from_file(file_path, log_id=None):
    """
    Memory-efficient streaming parser for large offers.xml files.
    Uses iterparse to process one <Предложение> at a time without loading
    the entire XML tree into memory.
    """
    _update_log(log_id, 5, 'Определение формата файла...')
    # Detect namespace from the root element
    ns = ''
    for event, elem in ET.iterparse(file_path, events=('start',)):
        tag = elem.tag
        if tag.startswith('{'):
            ns = tag[1:tag.index('}')]
        elem.clear()
        break

    def t(name):
        return _make_tag(ns, name)

    offer_tag = t('Предложение')
    id_tag = t('Ид')
    price_path = f'{t("Цены")}/{t("Цена")}/{t("ЦенаЗаЕдиницу")}'
    stock_tag = t('Количество')
    name_tag = t('Наименование')
    chars_path = f'{t("ХарактеристикиТовара")}/{t("ХарактеристикаТовара")}'
    char_name_tag = t('Наименование')
    char_value_tag = t('Значение')

    product_total_stocks = {}
    product_prices = {}
    size_updates = []  # (product_id_1c, size_value, stock)
    offer_count = 0

    _update_log(log_id, 10, 'Парсинг предложений (цены, остатки, размеры)...')

    for event, elem in ET.iterparse(file_path, events=('end',)):
        if elem.tag != offer_tag:
            continue

        offer_count += 1
        try:
            id_elem = elem.find(id_tag)
            if id_elem is None:
                elem.clear()
                continue

            offer_id = id_elem.text
            product_id = offer_id.split('#')[0]

            # Price
            price_elem = elem.find(price_path)
            if price_elem is not None and product_id not in product_prices:
                try:
                    product_prices[product_id] = Decimal(price_elem.text)
                except Exception:
                    pass

            # Stock
            stock = 0
            stock_elem = elem.find(stock_tag)
            if stock_elem is not None:
                try:
                    stock = int(float(stock_elem.text))
                except Exception:
                    pass

            if product_id not in product_total_stocks:
                product_total_stocks[product_id] = 0
            product_total_stocks[product_id] += stock

            # Size-specific stock
            if '#' in offer_id:
                size_value = None

                char_elems = elem.findall(chars_path)
                for char in char_elems:
                    cn = char.find(char_name_tag)
                    cv = char.find(char_value_tag)
                    if cn is not None and cv is not None:
                        if cn.text and cn.text.lower() in ['размер', 'size']:
                            size_value = cv.text
                            break

                if not size_value:
                    name_elem = elem.find(name_tag)
                    if name_elem is not None and name_elem.text:
                        offer_name = name_elem.text
                        # Try "Размер:" / "Size:" markers first
                        for marker in ['Размер:', 'Размер ', 'Size:', 'Size ']:
                            if marker in offer_name:
                                size_value = offer_name.split(marker)[-1].strip().rstrip(')')
                                break
                        # Fallback: extract size from trailing parentheses
                        # e.g. "Футболка арт. 241\12 B (5XL(60))" → "5XL(60)"
                        if not size_value and offer_name.endswith(')'):
                            # Find the matching opening paren
                            depth = 0
                            for i in range(len(offer_name) - 1, -1, -1):
                                if offer_name[i] == ')':
                                    depth += 1
                                elif offer_name[i] == '(':
                                    depth -= 1
                                    if depth == 0:
                                        size_value = offer_name[i+1:-1].strip()
                                        break

                if size_value:
                    size_updates.append((product_id, size_value, stock))

        except Exception as e:
            logger.error(f"Ошибка обработки предложения: {str(e)}")

        elem.clear()

        # Обновляем прогресс каждые 5000 предложений (10%→75%)
        if log_id and offer_count % 5000 == 0 and offer_count > 0:
            progress = min(10 + (offer_count // 1000), 75)
            _update_log(log_id, progress, f'Обработано {offer_count} предложений...')

    logger.info(f"Найдено {offer_count} предложений (streaming)")

    # Fetch all products involved in one query, build id_1c → (pk, obj) map
    all_ids_1c = set(product_prices.keys()) | set(product_total_stocks.keys()) | {r[0] for r in size_updates}
    products_qs = Product.objects.filter(id_1c__in=all_ids_1c).only('id', 'id_1c', 'price', 'total_stock')
    product_map = {p.id_1c: p for p in products_qs}

    # Bulk update prices + total_stock in a single pass (2 queries total)
    _update_log(log_id, 78, f'Найдено {offer_count} предложений. Обновление цен и остатков...')
    to_update = []
    for prod_id_1c, p in product_map.items():
        changed = False
        if prod_id_1c in product_prices:
            p.price = product_prices[prod_id_1c]
            changed = True
        if prod_id_1c in product_total_stocks:
            p.total_stock = product_total_stocks[prod_id_1c]
            changed = True
        if changed:
            to_update.append(p)
    if to_update:
        Product.objects.bulk_update(to_update, ['price', 'total_stock'])
    logger.info(f"Цены и остатки обновлены для {len(to_update)} товаров")

    # Bulk update size-specific stock (3 queries total regardless of size count)
    total_sizes = len(size_updates)
    _update_log(log_id, 90, f'Обновление размеров ({total_sizes} записей)...')

    # Deduplicate: last value wins per (product_pk, size)
    size_map = {}  # (product_pk, size_value) -> stock
    for prod_id_1c, size_value, stock in size_updates:
        p = product_map.get(prod_id_1c)
        if p:
            size_map[(p.id, size_value)] = stock

    if size_map:
        affected_pks = list({pk for pk, _ in size_map.keys()})
        ProductSize.objects.filter(product_id__in=affected_pks).delete()
        ProductSize.objects.bulk_create([
            ProductSize(product_id=pk, size=size_value, stock=stock)
            for (pk, size_value), stock in size_map.items()
        ])

    logger.info(f"Размеры обновлены: {len(size_map)} записей")


# ============================================================
# Original pull-based class (preserved for backward compat)
# ============================================================

class CommerceMLParser:
    def __init__(self, url_1c, username, password):
        self.url_1c = url_1c
        self.auth = (username, password)
        self.session = requests.Session()
        self.session.auth = self.auth

    def sync_all(self):
        """Полная синхронизация (pull from 1C)"""
        log = SyncLog.objects.create(status='running')
        try:
            logger.info("Начало синхронизации с 1С")
            import_data = self.get_import_data()
            offers_data = self.get_offers_data()

            image_prefix = f"{self.url_1c}/catalog/"
            categories_count = sync_categories_from_tree(import_data)
            log.categories_synced = categories_count

            products_count = sync_products_from_tree(import_data, image_url_prefix=image_prefix)
            log.products_synced = products_count

            sync_offers_from_tree(offers_data)

            log.status = 'success'
            log.finished_at = timezone.now()
            log.save()
            logger.info(f"Синхронизация завершена: {products_count} товаров, {categories_count} категорий")
            return True
        except Exception as e:
            logger.error(f"Ошибка синхронизации: {str(e)}")
            log.status = 'error'
            log.error_message = str(e)
            log.finished_at = timezone.now()
            log.save()
            return False

    def get_import_data(self):
        """Получить данные каталога (import.xml)"""
        response = self.session.get(
            f"{self.url_1c}/catalog/import/import.xml",
            timeout=30
        )
        response.raise_for_status()
        return ET.fromstring(response.content)

    def get_offers_data(self):
        """Получить данные о ценах и остатках (offers.xml)"""
        response = self.session.get(
            f"{self.url_1c}/catalog/import/offers.xml",
            timeout=30
        )
        response.raise_for_status()
        return ET.fromstring(response.content)
