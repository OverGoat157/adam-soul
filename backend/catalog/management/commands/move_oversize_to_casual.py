"""
Переносит все товары с 'oversize' в названии в коллекцию casual.

Если категория товара ещё classic, а в ней есть и oversize и не-oversize товары,
то создаётся отдельная casual-копия категории и oversize-товары перемещаются в неё.
Если ВСЕ товары категории — oversize, просто меняем коллекцию категории на casual.
"""

from django.core.management.base import BaseCommand
from catalog.models import Category, Product


class Command(BaseCommand):
    help = 'Move Oversize products to casual collection'

    def handle(self, *args, **options):
        oversize_products = Product.objects.filter(
            name__icontains='oversize',
            category__collection='classic',
        ).select_related('category')

        if not oversize_products.exists():
            self.stdout.write(self.style.WARNING('No classic-collection oversize products found.'))
            return

        # Group by category
        categories = {}
        for p in oversize_products:
            categories.setdefault(p.category_id, []).append(p)

        for cat_id, products in categories.items():
            cat = Category.objects.get(pk=cat_id)
            total_in_cat = Product.objects.filter(category=cat).count()
            oversize_count = len(products)

            if oversize_count == total_in_cat:
                # All products are oversize — switch whole category to casual
                cat.collection = 'casual'
                cat.save()
                self.stdout.write(self.style.SUCCESS(
                    f'Category "{cat.name}" ({total_in_cat} products) → casual'
                ))
            else:
                # Mixed category — create casual copy and move oversize products
                new_slug = f'{cat.slug}-casual'
                casual_cat, created = Category.objects.get_or_create(
                    slug=new_slug,
                    defaults={
                        'id_1c': f'{cat.id_1c}_casual',
                        'name': f'{cat.name} (Casual)',
                        'collection': 'casual',
                        'sort_order': cat.sort_order,
                        'is_active': True,
                    },
                )
                if not created:
                    casual_cat.collection = 'casual'
                    casual_cat.save()

                for p in products:
                    p.category = casual_cat
                    p.save(update_fields=['category'])

                self.stdout.write(self.style.SUCCESS(
                    f'Moved {oversize_count} oversize products from "{cat.name}" → "{casual_cat.name}"'
                ))

        self.stdout.write(self.style.SUCCESS('Done.'))
