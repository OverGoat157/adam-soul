from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Fix absolute image URLs (http://VPS/media/...) to relative (/media/...)'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Fix ProductImage.image_url
            cursor.execute("""
                UPDATE catalog_productimage
                SET image_url = REGEXP_REPLACE(image_url, '^https?://[^/]+', '')
                WHERE image_url ~ '^https?://'
            """)
            img_rows = cursor.rowcount

            # Fix Product.main_image
            cursor.execute("""
                UPDATE catalog_product
                SET main_image = REGEXP_REPLACE(main_image, '^https?://[^/]+', '')
                WHERE main_image ~ '^https?://'
            """)
            prod_rows = cursor.rowcount

        self.stdout.write(self.style.SUCCESS(
            f'Fixed {img_rows} ProductImage URLs and {prod_rows} Product.main_image URLs'
        ))
