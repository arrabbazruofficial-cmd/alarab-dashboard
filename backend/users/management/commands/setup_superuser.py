import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Automatically create a superuser based on environment variables'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

        if not email or not password:
            self.stdout.write(self.style.WARNING(
                'Superuser email or password not found in environment variables. '
                'Skipping superuser creation.'
            ))
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.SUCCESS(
                f'Superuser {email} already exists.'
            ))
        else:
            User.objects.create_superuser(
                email=email,
                password=password,
                role='SUPER_ADMIN'
            )
            self.stdout.write(self.style.SUCCESS(
                f'Successfully created superuser: {email}'
            ))
