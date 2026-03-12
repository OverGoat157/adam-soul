from django.contrib import admin
from .models import Category, Product, ProductImage, ProductSize, SyncLog


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'collection', 'slug', 'is_active', 'sort_order']
    list_filter = ['collection', 'is_active']
    list_editable = ['collection']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['article', 'name', 'category', 'price', 'total_stock', 'is_hidden']
    list_filter = ['category', 'is_hidden']
    search_fields = ['name', 'article']


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'image_url', 'sort_order']


@admin.register(SyncLog)
class SyncLogAdmin(admin.ModelAdmin):
    list_display = ['started_at', 'status', 'products_synced', 'categories_synced']
