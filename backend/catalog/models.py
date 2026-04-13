# backend/catalog/models.py
from decimal import Decimal
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Category(models.Model):
    """Категории номенклатуры из 1С"""
    COLLECTION_CHOICES = [
        ('classic', 'Classic'),
        ('casual', 'Casual'),
    ]

    id_1c = models.CharField(max_length=255, unique=True, verbose_name="ID в 1С")
    name = models.CharField(max_length=255, verbose_name="Название")
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)
    collection = models.CharField(max_length=20, choices=COLLECTION_CHOICES, default='classic', verbose_name="Коллекция")
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """Товары из 1С"""
    id_1c = models.CharField(max_length=255, unique=True, verbose_name="ID в 1С")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=500, verbose_name="Название")
    article = models.CharField(max_length=100, verbose_name="Артикул")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), verbose_name="Цена")
    description = models.TextField(blank=True, verbose_name="Описание")
    main_image = models.URLField(max_length=1000, blank=True)
    total_stock = models.IntegerField(default=0, verbose_name="Общий остаток")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    is_hidden = models.BooleanField(default=False, verbose_name="Скрыт администратором")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    synced_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.article} - {self.name}"


class ProductImage(models.Model):
    """Дополнительные изображения товара"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField(max_length=1000, blank=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="Файл изображения")
    is_from_1c = models.BooleanField(default=True, verbose_name="Из 1С")
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['sort_order']

    def delete(self, *args, **kwargs):
        if self.image:
            self.image.delete(save=False)
        super().delete(*args, **kwargs)


class ProductSize(models.Model):
    """Размеры и остатки товаров"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sizes')
    size = models.CharField(max_length=50, verbose_name="Размер")
    stock = models.IntegerField(default=0, verbose_name="Остаток")
    
    class Meta:
        unique_together = ['product', 'size']
        ordering = ['size']


class Favorite(models.Model):
    """Избранные товары пользователя"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']
        ordering = ['-created_at']


class SyncLog(models.Model):
    """Логи синхронизации с 1С"""
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('running', 'Выполняется'),
        ('success', 'Успешно'),
        ('error', 'Ошибка'),
    ])
    products_synced = models.IntegerField(default=0)
    categories_synced = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    progress = models.IntegerField(default=0)          # 0–100
    current_step = models.CharField(max_length=255, blank=True)
    
    class Meta:
        ordering = ['-started_at']
