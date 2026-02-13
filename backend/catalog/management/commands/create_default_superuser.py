import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create superuser from environment variables if not exists'

    def handle(self, *args, **kwargs):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', '1c_exchange')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '1c@internal.local')

        if not password:
            self.stdout.write('DJANGO_SUPERUSER_PASSWORD not set, skipping')
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(f'Superuser "{username}" already exists, skipping')
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" created'))
