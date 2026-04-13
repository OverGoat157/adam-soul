from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0004_category_collection_favorite'),
    ]

    operations = [
        migrations.AlterField(
            model_name='productimage',
            name='image_url',
            field=models.URLField(blank=True, max_length=1000),
        ),
        migrations.AddField(
            model_name='productimage',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='products/', verbose_name='Файл изображения'),
        ),
    ]
