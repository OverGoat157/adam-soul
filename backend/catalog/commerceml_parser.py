# backend/catalog/commerceml_parser.py
import xml.etree.ElementTree as ET
import requests
from django.utils.text import slugify
from .models import Category, Product, ProductImage, ProductSize, SyncLog
from django.utils import timezone
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class CommerceMLParser:
    def __init__(self, url_1c, username, password):
        self.url_1c = url_1c
        self.auth = (username, password)
        self.namespace = {'': 'urn:1C.ru:commerceml_2'}
        self.session = requests.Session()
        self.session.auth = self.auth
    
    def sync_all(self):
        """Полная синхронизация"""
        log = SyncLog.objects.create(status='running')
        
        try:
            logger.info("Начало синхронизации с 1С")
            
            # 1. Получение данных из 1С
            import_data = self.get_import_data()
            offers_data = self.get_offers_data()
            
            # 2. Синхронизация категорий
            categories_count = self.sync_categories(import_data)
            log.categories_synced = categories_count
            
            # 3. Синхронизация товаров
            products_count = self.sync_products(import_data)
            log.products_synced = products_count
            
            # 4. Синхронизация остатков и цен
            self.sync_offers(offers_data)
            
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
        try:
            response = self.session.get(
                f"{self.url_1c}/catalog/import/import.xml",
                timeout=30
            )
            response.raise_for_status()
            return ET.fromstring(response.content)
        except Exception as e:
            logger.error(f"Ошибка получения import.xml: {str(e)}")
            raise
    
    def get_offers_data(self):
        """Получить данные о ценах и остатках (offers.xml)"""
        try:
            response = self.session.get(
                f"{self.url_1c}/catalog/import/offers.xml",
                timeout=30
            )
            response.raise_for_status()
            return ET.fromstring(response.content)
        except Exception as e:
            logger.error(f"Ошибка получения offers.xml: {str(e)}")
            raise
    
    def sync_categories(self, tree):
        """Синхронизация категорий"""
        count = 0
        groups = tree.findall('.//{urn:1C.ru:commerceml_2}Группа')
        
        logger.info(f"Найдено {len(groups)} категорий")
        
        for group in groups:
            try:
                id_1c = group.find('{urn:1C.ru:commerceml_2}Ид').text
                name = group.find('{urn:1C.ru:commerceml_2}Наименование').text
                
                # Родительская категория
                parent_id = None
                parent_elem = group.find('{urn:1C.ru:commerceml_2}Группы/{urn:1C.ru:commerceml_2}Ид')
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
    
    def sync_products(self, tree):
        """Синхронизация товаров"""
        count = 0
        products = tree.findall('.//{urn:1C.ru:commerceml_2}Товар')
        
        logger.info(f"Найдено {len(products)} товаров")
        
        for prod in products:
            try:
                id_1c = prod.find('{urn:1C.ru:commerceml_2}Ид').text
                name = prod.find('{urn:1C.ru:commerceml_2}Наименование').text
                
                # Артикул
                article_elem = prod.find('{urn:1C.ru:commerceml_2}Артикул')
                article = article_elem.text if article_elem is not None else id_1c[:10]
                
                # Категория
                category_id_elem = prod.find('{urn:1C.ru:commerceml_2}Группы/{urn:1C.ru:commerceml_2}Ид')
                if category_id_elem is None:
                    logger.warning(f"Товар {name} без категории, пропускаем")
                    continue
                
                try:
                    category = Category.objects.get(id_1c=category_id_elem.text)
                except Category.DoesNotExist:
                    logger.warning(f"Категория не найдена для товара {name}")
                    continue
                
                # Описание
                description_elem = prod.find('{urn:1C.ru:commerceml_2}Описание')
                description = description_elem.text if description_elem is not None else ''
                
                # Создание/обновление товара
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
                
                # Изображения из 1С
                images = prod.findall('{urn:1C.ru:commerceml_2}Картинка')
                if images:
                    # Удаляем старые изображения из 1С
                    ProductImage.objects.filter(product=product, is_from_1c=True).delete()
                    
                    for idx, img in enumerate(images):
                        image_url = img.text
                        # Преобразуем относительный путь в абсолютный
                        if not image_url.startswith('http'):
                            image_url = f"{self.url_1c}/catalog/{image_url}"
                        
                        if idx == 0:
                            product.main_image = image_url
                            product.save()
                        
                        ProductImage.objects.create(
                            product=product,
                            image_url=image_url,
                            is_from_1c=True,
                            sort_order=idx
                        )
                
                # Характеристики (размеры)
                characteristics = prod.findall('{urn:1C.ru:commerceml_2}ХарактеристикиТовара/{urn:1C.ru:commerceml_2}ХарактеристикаТовара')
                for char in characteristics:
                    name_elem = char.find('{urn:1C.ru:commerceml_2}Наименование')
                    value_elem = char.find('{urn:1C.ru:commerceml_2}Значение')
                    
                    if name_elem is not None and value_elem is not None:
                        if name_elem.text.lower() in ['размер', 'size']:
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
    
    def sync_offers(self, tree):
        """Синхронизация цен и остатков"""
        offers = tree.findall('.//{urn:1C.ru:commerceml_2}Предложение')
        
        logger.info(f"Найдено {len(offers)} предложений")
        
        for offer in offers:
            try:
                id_elem = offer.find('{urn:1C.ru:commerceml_2}Ид')
                if id_elem is None:
                    continue
                
                offer_id = id_elem.text
                
                # ID может быть "товар_id#характеристика_id" или просто "товар_id"
                product_id = offer_id.split('#')[0]
                
                try:
                    product = Product.objects.get(id_1c=product_id)
                except Product.DoesNotExist:
                    continue
                
                # Цена
                price_elem = offer.find('{urn:1C.ru:commerceml_2}Цены/{urn:1C.ru:commerceml_2}Цена/{urn:1C.ru:commerceml_2}ЦенаЗаЕдиницу')
                if price_elem is not None:
                    try:
                        product.price = Decimal(price_elem.text)
                    except:
                        pass
                
                # Остаток
                stock_elem = offer.find('{urn:1C.ru:commerceml_2}Количество')
                if stock_elem is not None:
                    try:
                        stock = int(float(stock_elem.text))
                        
                        # Если есть характеристика (размер)
                        if '#' in offer_id:
                            char_id = offer_id.split('#')[1]
                            # Попробуем найти размер по ID или создать
                            size_obj = ProductSize.objects.filter(
                                product=product
                            ).first()
                            
                            if size_obj:
                                size_obj.stock = stock
                                size_obj.save()
                        else:
                            product.total_stock = stock
                        
                    except:
                        pass
                
                product.save()
                
            except Exception as e:
                logger.error(f"Ошибка обработки предложения: {str(e)}")
                continue
