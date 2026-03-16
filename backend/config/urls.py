# backend/config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from catalog.views import CategoryViewSet, ProductViewSet, SyncViewSet, CustomAuthToken, SiteUserViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'sync', SyncViewSet, basename='sync')
router.register(r'users', SiteUserViewSet, basename='user')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/token', CustomAuthToken.as_view()),
    path('1c_exchange/', include('catalog.exchange_urls')),
]

# Serve media files (images uploaded by 1C)
# On Railway there's no separate file server, so Django serves them directly
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
