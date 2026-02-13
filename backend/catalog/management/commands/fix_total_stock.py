from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Recalculate total_stock for all products from their ProductSize stocks'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE catalog_product
                SET total_stock = COALESCE((
                    SELECT SUM(stock)
                    FROM catalog_productsize
                    WHERE catalog_productsize.product_id = catalog_product.id
                ), 0)
            """)
            rows = cursor.rowcount
        self.stdout.write(self.style.SUCCESS(f'Updated total_stock for {rows} products'))
