# backend/catalog/exchange_urls.py
from django.urls import path
from .exchange_views import exchange_1c

urlpatterns = [
    path('', exchange_1c, name='1c_exchange'),
]
