# backend/catalog/serializers.py
from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductSize, SyncLog

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'collection']


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ['size', 'stock']


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'is_from_1c', 'sort_order']

    def get_image_url(self, obj):
        if obj.image:
            from django.conf import settings
            request = self.context.get('request')
            url = obj.image.url
            if request:
                return request.build_absolute_uri(url)
            if settings.SITE_URL:
                return f"{settings.SITE_URL.rstrip('/')}{url}"
            return url
        return obj.image_url


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    sizes = ProductSizeSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'id_1c', 'name', 'article', 'price', 'description',
            'main_image', 'total_stock', 'category_name', 'sizes', 'images',
            'is_hidden', 'synced_at'
        ]


class SyncLogSerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = SyncLog
        fields = '__all__'
    
    def get_duration(self, obj):
        if obj.finished_at:
            delta = obj.finished_at - obj.started_at
            return delta.total_seconds()
        return None
