from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0002_alter_product_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='synclog',
            name='progress',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='synclog',
            name='current_step',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
