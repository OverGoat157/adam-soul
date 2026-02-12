# backend/catalog/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from .models import Category, Product, ProductImage, SyncLog
from .serializers import CategorySerializer, ProductSerializer, ProductImageSerializer, SyncLogSerializer
from .commerceml_parser import CommerceMLParser
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """API для категорий"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ProductViewSet(viewsets.ModelViewSet):
    """API для товаров"""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        
        # Показывать скрытые только админам
        if not (self.request.user and self.request.user.is_staff):
            queryset = queryset.filter(is_hidden=False)
        
        category = self.request.query_params.get('category', None)
        
        if category and category != 'all':
            queryset = queryset.filter(category__slug=category)
        
        return queryset.select_related('category').prefetch_related('images', 'sizes')
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def add_image(self, request, pk=None):
        """Добавить дополнительное изображение"""
        product = self.get_object()
        image_url = request.data.get('image_url')
        
        if not image_url:
            return Response({'error': 'image_url required'}, status=400)
        
        max_order = ProductImage.objects.filter(product=product).count()
        
        ProductImage.objects.create(
            product=product,
            image_url=image_url,
            is_from_1c=False,
            sort_order=max_order
        )
        
        return Response({'status': 'success'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reorder_images(self, request, pk=None):
        """Изменить порядок изображений"""
        product = self.get_object()
        image_ids = request.data.get('image_ids', [])
        
        for idx, image_id in enumerate(image_ids):
            ProductImage.objects.filter(id=image_id, product=product).update(sort_order=idx)
        
        return Response({'status': 'success'})
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAdminUser])
    def delete_image(self, request, pk=None):
        """Удалить изображение"""
        image_id = request.data.get('image_id')
        
        try:
            image = ProductImage.objects.get(id=image_id, product_id=pk)
            image.delete()
            return Response({'status': 'success'})
        except ProductImage.DoesNotExist:
            return Response({'error': 'Image not found'}, status=404)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def toggle_visibility(self, request, pk=None):
        """Скрыть/показать товар"""
        product = self.get_object()
        product.is_hidden = not product.is_hidden
        product.save()
        
        return Response({'is_hidden': product.is_hidden})


class SyncViewSet(viewsets.ReadOnlyModelViewSet):
    """Логи синхронизации и ручной запуск"""
    queryset = SyncLog.objects.all()
    serializer_class = SyncLogSerializer
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['post'])
    def manual_sync(self, request):
        """Ручной запуск синхронизации"""
        try:
            parser = CommerceMLParser(
                url_1c=settings.COMMERCE_ML_URL,
                username=settings.COMMERCE_ML_USER,
                password=settings.COMMERCE_ML_PASSWORD
            )
            
            success = parser.sync_all()
            latest_log = SyncLog.objects.latest('started_at')
            
            return Response({
                'status': 'success' if success else 'error',
                'log': SyncLogSerializer(latest_log).data
            })
        except Exception as e:
            logger.error(f"Ошибка запуска синхронизации: {str(e)}")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=500)
