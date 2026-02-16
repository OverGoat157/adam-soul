# backend/catalog/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny
from .models import Category, Product, ProductImage, SyncLog
from .serializers import CategorySerializer, ProductSerializer, ProductImageSerializer, SyncLogSerializer
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
        search = self.request.query_params.get('search', None)
        include_out_of_stock = self.request.query_params.get('include_out_of_stock', 'false').lower() == 'true'
        only_out_of_stock = self.request.query_params.get('only_out_of_stock', 'false').lower() == 'true'

        if category and category != 'all':
            queryset = queryset.filter(category__slug=category)

        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(article__icontains=search)
            )

        if only_out_of_stock:
            queryset = queryset.filter(total_stock=0)
        elif not include_out_of_stock:
            queryset = queryset.filter(total_stock__gt=0)

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
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def manual_sync(self, request):
        """Re-parse XML files already uploaded by 1C (runs in background)."""
        import threading
        from django.core.management import call_command
        from django.utils import timezone

        # Check if sync is already running
        running = SyncLog.objects.filter(status='running').first()
        if running:
            return Response({
                'status': 'already_running',
                'message': 'Синхронизация уже выполняется',
            })

        log = SyncLog.objects.create(status='running', current_step='Запуск синхронизации...', progress=0)

        def run_sync(log_id):
            import django
            django.db.connection.close()
            try:
                call_command('parse_1c_xml', log_id=log_id)
                SyncLog.objects.filter(id=log_id).update(
                    status='success',
                    finished_at=timezone.now(),
                    progress=100,
                    current_step='Синхронизация завершена',
                )
                logger.info("Manual sync completed successfully")
            except Exception as e:
                logger.error(f"Ошибка синхронизации: {str(e)}")
                SyncLog.objects.filter(id=log_id).update(
                    status='error',
                    error_message=str(e),
                    finished_at=timezone.now(),
                    current_step=f'Ошибка: {str(e)[:200]}',
                )

        thread = threading.Thread(target=run_sync, args=(log.id,), daemon=True)
        thread.start()

        return Response({
            'status': 'success',
            'message': 'Синхронизация запущена',
            'log_id': log.id,
        })

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def status(self, request):
        """Текущий статус синхронизации — последний лог."""
        log = SyncLog.objects.first()
        if not log:
            return Response({'status': 'idle'})
        return Response(SyncLogSerializer(log).data)
