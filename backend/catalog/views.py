# backend/catalog/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny, IsAuthenticated
from .models import Category, Product, ProductImage, SyncLog, Favorite
from .serializers import CategorySerializer, ProductSerializer, ProductImageSerializer, SyncLogSerializer
import logging

logger = logging.getLogger(__name__)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """API для категорий"""
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Category.objects.filter(is_active=True)
        collection = self.request.query_params.get('collection')
        if collection:
            queryset = queryset.filter(collection=collection)
        return queryset


class ProductViewSet(viewsets.ModelViewSet):
    """API для товаров"""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)

        # Показывать скрытые только админам
        if not (self.request.user and self.request.user.is_staff):
            queryset = queryset.filter(is_hidden=False)

        collection = self.request.query_params.get('collection', None)
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        include_out_of_stock = self.request.query_params.get('include_out_of_stock', 'false').lower() == 'true'

        if collection:
            queryset = queryset.filter(category__collection=collection)
        only_out_of_stock = self.request.query_params.get('only_out_of_stock', 'false').lower() == 'true'

        if category and category != 'all':
            queryset = queryset.filter(category__slug=category)

        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(article__icontains=search)
            )

        # Админы видят все товары без фильтрации по остаткам
        if self.request.user and self.request.user.is_staff:
            if only_out_of_stock:
                queryset = queryset.filter(total_stock=0)
        else:
            if only_out_of_stock:
                queryset = queryset.filter(total_stock=0)
            elif not include_out_of_stock:
                queryset = queryset.filter(total_stock__gt=0)

        return queryset.select_related('category').prefetch_related('images', 'sizes')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        grouped_param = request.query_params.get('grouped', 'false').lower() == 'true'

        if not grouped_param:
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

        from collections import defaultdict

        def get_product_role(name):
            lower = name.lower()
            if 'пиджак' in lower:
                return 'jacket'
            if 'брюки' in lower or 'брюк' in lower:
                return 'pants'
            return None

        def get_variant_key(name, article):
            """Возвращает суффикс после артикула в названии (например 'BS' или '')."""
            idx = name.lower().find(article.lower())
            if idx != -1:
                return name[idx + len(article):].strip()
            return ''

        def make_images(product_list):
            all_images, seen = [], set()
            for p in product_list:
                for img in p.images.all():
                    if img.image_url and img.image_url not in seen:
                        all_images.append({
                            'id': img.id,
                            'image_url': img.image_url,
                            'is_from_1c': img.is_from_1c,
                            'sort_order': img.sort_order,
                        })
                        seen.add(img.image_url)
            return all_images

        def normalize_size(size_str):
            """Извлекает базовый размер: '48\\176-182' → '48', '50,182' → '50', '48-194' → '48'."""
            for sep in ['\\', ',', '/']:
                if sep in size_str:
                    return size_str.split(sep)[0].strip()
            # '48-194' → '48': дефис между размером (2 цифры) и ростом (3 цифры)
            if '-' in size_str:
                parts = size_str.split('-', 1)
                left = parts[0].strip()
                right = parts[1].strip()
                if left.isdigit() and right.isdigit() and len(left) <= 2 and len(right) >= 3:
                    return left
            return size_str.strip()

        def build_normalized_size_map(product):
            """Карта {базовый_размер: суммарный_остаток} с агрегацией по вариантам роста."""
            normalized = defaultdict(int)
            for s in product.sizes.all():
                if s.stock > 0:
                    base = normalize_size(s.size)
                    normalized[base] += s.stock
            return dict(normalized)

        def merge_pair(base_product, pair_products):
            """Создаёт объединённую карточку: пересечение нормализованных размеров + объединение фото."""
            size_maps = [build_normalized_size_map(p) for p in pair_products]

            common = set(size_maps[0].keys())
            for sm in size_maps[1:]:
                common &= set(sm.keys())

            if not common:
                return None  # нет пересечения — не мёржим

            base = ProductSerializer(base_product).data
            base['sizes'] = [
                {'size': size, 'stock': min(sm.get(size, 0) for sm in size_maps)}
                for size in sorted(common, key=lambda x: int(x) if x.isdigit() else x)
            ]
            base['total_stock'] = sum(s['stock'] for s in base['sizes'])
            base['price'] = str(max(p.price for p in pair_products))
            imgs = make_images(pair_products)
            if imgs:
                base['images'] = imgs
                if not base.get('main_image'):
                    base['main_image'] = imgs[0]['image_url']
            return base

        # Группировка по артикулу
        by_article = defaultdict(list)
        for product in queryset:
            by_article[product.article].append(product)

        result = []
        for article, products in by_article.items():
            if len(products) == 1:
                result.append(ProductSerializer(products[0]).data)
                continue

            jackets = [p for p in products if get_product_role(p.name) == 'jacket']
            pants = [p for p in products if get_product_role(p.name) == 'pants']
            others = [p for p in products if get_product_role(p.name) is None]

            if jackets and pants:
                # Попарное объединение: пиджак BS + брюки BS, пиджак + брюки, и т.д.
                jacket_by_variant = {get_variant_key(p.name, article): p for p in jackets}
                pants_by_variant = {get_variant_key(p.name, article): p for p in pants}
                all_variants = set(jacket_by_variant) | set(pants_by_variant)

                for variant in sorted(all_variants):
                    j = jacket_by_variant.get(variant)
                    pa = pants_by_variant.get(variant)

                    if j and pa:
                        merged = merge_pair(j, [j, pa])
                        if merged:
                            result.append(merged)
                        else:
                            result.append(ProductSerializer(j).data)
                            result.append(ProductSerializer(pa).data)
                    elif j:
                        result.append(ProductSerializer(j).data)
                    elif pa:
                        result.append(ProductSerializer(pa).data)

                for p in others:
                    result.append(ProductSerializer(p).data)
            else:
                # Не пиджак+брюки — стандартное пересечение всех товаров группы
                size_maps = [
                    {s.size: s.stock for s in p.sizes.all() if s.stock > 0}
                    for p in products
                ]
                common = set(size_maps[0].keys())
                for sm in size_maps[1:]:
                    common &= set(sm.keys())

                if common:
                    base = ProductSerializer(products[0]).data
                    base['sizes'] = [
                        {'size': size, 'stock': min(sm.get(size, 0) for sm in size_maps)}
                        for size in sorted(common)
                    ]
                    base['total_stock'] = sum(s['stock'] for s in base['sizes'])
                    base['price'] = str(max(p.price for p in products))
                    imgs = make_images(products)
                    if imgs:
                        base['images'] = imgs
                        if not base.get('main_image'):
                            base['main_image'] = imgs[0]['image_url']
                    result.append(base)
                else:
                    for p in products:
                        result.append(ProductSerializer(p).data)

        return Response(result)
    
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

    @action(detail=True, methods=['delete'], url_path='delete_product', permission_classes=[IsAdminUser])
    def delete_product(self, request, pk=None):
        """Полностью удалить товар"""
        product = self.get_object()
        product.delete()
        return Response({'status': 'deleted'})

    @action(detail=True, methods=['patch'], url_path='update_image', permission_classes=[IsAdminUser])
    def update_image(self, request, pk=None):
        """Обновить URL изображения"""
        image_id = request.data.get('image_id')
        new_url = request.data.get('image_url')
        if not image_id or not new_url:
            return Response({'error': 'image_id and image_url required'}, status=400)
        try:
            image = ProductImage.objects.get(id=image_id, product_id=pk)
            image.image_url = new_url
            image.save()
            return Response({'status': 'success'})
        except ProductImage.DoesNotExist:
            return Response({'error': 'Image not found'}, status=404)


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

        # Mark stale 'running' logs (older than 10 min) as error — they crashed silently
        from django.utils import timezone as tz
        import datetime
        stale_cutoff = tz.now() - datetime.timedelta(minutes=10)
        SyncLog.objects.filter(status='running', started_at__lt=stale_cutoff).update(
            status='error',
            error_message='Синхронизация прервана (превышено время ожидания)',
            finished_at=tz.now(),
        )

        # Check if sync is already running (recently started)
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
        log = SyncLog.objects.order_by('-started_at').first()
        if not log:
            return Response({'status': 'idle'})
        return Response(SyncLogSerializer(log).data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def cancel_sync(self, request):
        """Отменить текущую синхронизацию (помечает как cancelled)."""
        from django.utils import timezone
        updated = SyncLog.objects.filter(status='running').update(
            status='cancelled',
            finished_at=timezone.now(),
            current_step='Отменено пользователем',
        )
        if updated:
            return Response({'status': 'cancelled'})
        return Response({'status': 'not_running'})


# ──────────────────────────────────────────────
# Кастомный auth token — возвращает is_staff
# ──────────────────────────────────────────────
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'is_staff': user.is_staff,
            'username': user.username,
        })


# ──────────────────────────────────────────────
# Управление пользователями каталога
# ──────────────────────────────────────────────
import random
import string
from django.contrib.auth.models import User
from rest_framework import viewsets as drf_viewsets

class SiteUserViewSet(drf_viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    def list(self, request):
        users = User.objects.filter(is_staff=False, is_active=True).order_by('username')
        return Response([{'id': u.id, 'username': u.username} for u in users])

    def create(self, request):
        def rand_str(n, chars):
            return ''.join(random.choices(chars, k=n))

        username = request.data.get('username') or rand_str(8, string.ascii_lowercase)
        password = request.data.get('password') or (
            rand_str(4, string.ascii_uppercase) +
            rand_str(4, string.ascii_lowercase) +
            rand_str(2, string.digits)
        )

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Пользователь уже существует'}, status=400)

        user = User.objects.create_user(username=username, password=password)
        Token.objects.get_or_create(user=user)
        return Response({'id': user.id, 'username': username, 'password': password})

    def partial_update(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk, is_staff=False)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        new_username = request.data.get('username')
        new_password = request.data.get('password')

        if new_username and new_username != user.username:
            if User.objects.filter(username=new_username).exists():
                return Response({'error': 'Имя уже занято'}, status=400)
            user.username = new_username

        if new_password:
            user.set_password(new_password)

        user.save()
        return Response({'id': user.id, 'username': user.username})

    def destroy(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk, is_staff=False)
            user.delete()
            return Response({'status': 'deleted'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


# ──────────────────────────────────────────────
# Избранное — персональное для каждого юзера
# ──────────────────────────────────────────────
class FavoriteViewSet(drf_viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        ids = list(
            Favorite.objects.filter(user=request.user)
            .values_list('product_id', flat=True)
        )
        return Response(ids)

    def create(self, request):
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)
        Favorite.objects.get_or_create(user=request.user, product=product)
        return Response({'status': 'added'})

    def destroy(self, request, pk=None):
        Favorite.objects.filter(user=request.user, product_id=pk).delete()
        return Response({'status': 'removed'})
