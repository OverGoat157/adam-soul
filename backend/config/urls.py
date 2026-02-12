# backend/config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from catalog.views import CategoryViewSet, ProductViewSet, SyncViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'sync', SyncViewSet, basename='sync')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
