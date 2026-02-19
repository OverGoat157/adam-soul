from django.core.management.base import BaseCommand
from catalog.models import Product


class Command(BaseCommand):
    help = 'Unhide all active products that were auto-hidden by the article merge'

    def handle(self, *args, **options):
        count = Product.objects.filter(is_active=True, is_hidden=True).update(is_hidden=False)
        self.stdout.write(self.style.SUCCESS(f'Unhidden {count} products'))
