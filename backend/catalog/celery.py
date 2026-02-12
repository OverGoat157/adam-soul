# backend/config/celery.py
from celery import Celery
from celery.schedules import crontab

app = Celery('adamsoul')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'sync-1c-every-15-minutes': {
        'task': 'catalog.tasks.sync_1c_data',
        'schedule': crontab(minute='*/15'),  # Каждые 15 минут
    },
}
