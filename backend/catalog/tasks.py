# backend/catalog/tasks.py
from celery import shared_task
from .commerceml_parser import CommerceMLParser
from django.conf import settings

@shared_task
def sync_1c_data():
    """Автоматическая синхронизация каждые 15 минут"""
    parser = CommerceMLParser(
        url_1c=settings.COMMERCE_ML_URL,
        username=settings.COMMERCE_ML_USER,
        password=settings.COMMERCE_ML_PASSWORD
    )
    parser.sync_all()
