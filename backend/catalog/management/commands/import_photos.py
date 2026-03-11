"""
Management command для импорта локальных фотографий в базу данных.

Сопоставляет оптимизированные фотки из media/products/{article_dir}/
с товарами по артикулу и создаёт записи ProductImage.

Запуск:
    python manage.py import_photos                  # показать что будет сделано (dry-run)
    python manage.py import_photos --apply           # применить
    python manage.py import_photos --apply --clear   # очистить старые фотки перед импортом

Маппинг артикул → директория:
    Артикул "101/10" → директория "101_10"
    Артикул "DY243/Lamia" → директория "DY243_Lamia"
"""

import os
import json
import re
from pathlib import Path

from django.core.management.base import BaseCommand
from django.conf import settings

from catalog.models import Product, ProductImage


def article_to_dirname(article: str) -> str:
    """Преобразовать артикул в имя директории (как в process_photos.py)."""
    safe = article.replace('/', '_').replace('\\', '_').replace(' ', '_')
    safe = re.sub(r'_+', '_', safe).strip('_')
    return safe


class Command(BaseCommand):
    help = 'Импорт фотографий из media/products/ в БД по артикулам товаров'

    def add_arguments(self, parser):
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Применить изменения (без этого флага — только показать план)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Удалить существующие не-1С фотографии перед импортом',
        )
        parser.add_argument(
            '--report',
            type=str,
            default='',
            help='Путь к photos_report.json (опционально, для перекрёстной проверки)',
        )

    def handle(self, *args, **options):
        apply = options['apply']
        clear = options['clear']
        report_path = options['report']

        products_dir = Path(settings.MEDIA_ROOT) / 'products'
        if not products_dir.exists():
            self.stderr.write(f'Директория {products_dir} не найдена')
            return

        # Получаем все доступные директории с фотками
        photo_dirs = {
            d: sorted(
                [f for f in os.listdir(products_dir / d) if f.lower().endswith(('.jpg', '.jpeg', '.png'))],
                key=lambda x: int(re.match(r'(\d+)', x).group(1)) if re.match(r'(\d+)', x) else 0
            )
            for d in os.listdir(products_dir)
            if (products_dir / d).is_dir()
        }

        self.stdout.write(f'Найдено {len(photo_dirs)} директорий с фотками')

        # Получаем все товары
        products = Product.objects.all()
        self.stdout.write(f'Товаров в БД: {products.count()}')

        # Строим маппинг: dirname → product
        matched = 0
        not_matched_dirs = []
        not_matched_products = []

        for product in products:
            dirname = article_to_dirname(product.article)
            if dirname in photo_dirs:
                files = photo_dirs[dirname]
                matched += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f'  ✓ {product.article} ({product.name}) → {dirname}/ ({len(files)} фото)'
                    )
                )

                if apply:
                    if clear:
                        deleted = ProductImage.objects.filter(
                            product=product, is_from_1c=False
                        ).delete()[0]
                        if deleted:
                            self.stdout.write(f'    Удалено {deleted} старых фото')

                    for idx, filename in enumerate(files):
                        # URL относительно media/ на сервере
                        image_url = f'/media/products/{dirname}/{filename}'

                        img, created = ProductImage.objects.get_or_create(
                            product=product,
                            image_url=image_url,
                            defaults={
                                'is_from_1c': False,
                                'sort_order': idx,
                            }
                        )
                        if created:
                            self.stdout.write(f'    + {filename} (sort: {idx})')
                        else:
                            self.stdout.write(f'    = {filename} (уже есть)')

                    # Устанавливаем main_image на первое фото если нет
                    if files and not product.main_image:
                        first_file = files[0]
                        product.main_image = f'/products/{dirname}/{first_file}'
                        product.save(update_fields=['main_image'])
                        self.stdout.write(f'    → main_image = {first_file}')
            else:
                not_matched_products.append(product.article)

        # Директории без товаров
        matched_dirs = set()
        for product in products:
            matched_dirs.add(article_to_dirname(product.article))

        for dirname in photo_dirs:
            if dirname not in matched_dirs:
                not_matched_dirs.append(dirname)

        self.stdout.write(f'\n=== Итоги ===')
        self.stdout.write(f'Сопоставлено: {matched} товаров')
        if not_matched_products:
            self.stdout.write(
                self.style.WARNING(
                    f'Товары без фоток ({len(not_matched_products)}): {", ".join(not_matched_products[:20])}'
                )
            )
        if not_matched_dirs:
            self.stdout.write(
                self.style.WARNING(
                    f'Фотки без товаров ({len(not_matched_dirs)}): {", ".join(not_matched_dirs[:20])}'
                )
            )

        if not apply:
            self.stdout.write(
                self.style.NOTICE('\nЭто был dry-run. Для применения используй: python manage.py import_photos --apply')
            )
