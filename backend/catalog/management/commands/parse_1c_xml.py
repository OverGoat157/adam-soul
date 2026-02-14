import os
import xml.etree.ElementTree as ET

from django.conf import settings
from django.core.management.base import BaseCommand

from catalog.commerceml_parser import (
    sync_categories_from_tree,
    sync_offers_from_tree,
    sync_products_from_tree,
)

EXCHANGE_DIR = os.path.join(settings.MEDIA_ROOT, '1c_exchange_tmp')


class Command(BaseCommand):
    help = 'Manually parse 1C XML files from media/1c_exchange_tmp/'

    def handle(self, *args, **options):
        import_path = os.path.join(EXCHANGE_DIR, 'import.xml')
        offers_path = os.path.join(EXCHANGE_DIR, 'offers.xml')

        media_url_prefix = f"{settings.MEDIA_URL}1c_images/"

        if os.path.exists(import_path):
            self.stdout.write(f'Parsing import.xml ({os.path.getsize(import_path)} bytes)...')
            tree = ET.parse(import_path)
            root = tree.getroot()
            cat_count = sync_categories_from_tree(root)
            prod_count = sync_products_from_tree(root, image_url_prefix=media_url_prefix)
            self.stdout.write(self.style.SUCCESS(
                f'import.xml: {cat_count} categories, {prod_count} products'
            ))
        else:
            self.stdout.write(self.style.WARNING('import.xml not found'))

        if os.path.exists(offers_path):
            size_mb = os.path.getsize(offers_path) / 1024 / 1024
            self.stdout.write(f'Parsing offers.xml ({size_mb:.1f} MB) — this may take a few minutes...')
            tree = ET.parse(offers_path)
            root = tree.getroot()
            sync_offers_from_tree(root)
            self.stdout.write(self.style.SUCCESS('offers.xml: prices and stock updated'))
        else:
            self.stdout.write(self.style.WARNING('offers.xml not found'))
