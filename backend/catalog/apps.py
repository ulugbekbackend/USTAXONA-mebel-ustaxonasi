from django.apps import AppConfig


class CatalogConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "catalog"
    verbose_name = "Katalog"

    def ready(self):
        """Media-modellarga umumiy tozalash signallarini ulaymiz (core/signals.py)."""
        from core.signals import connect_media_cleanup_signals

        from catalog.models import Category, Product, ProductImage

        connect_media_cleanup_signals(Product, field_name="image")
        connect_media_cleanup_signals(ProductImage, field_name="image")
        connect_media_cleanup_signals(Category, field_name="image")
