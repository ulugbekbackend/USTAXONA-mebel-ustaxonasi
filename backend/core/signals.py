"""
Media fayllarni avtomatik tozalash — UMUMIY, qayta ishlatiladigan signal funksiyalari.

Har bir ImageField/FileField'ga ega modelda bu logikani qayta yozmaslik uchun
modelning apps.py -> ready() ichida shu funksiyani chaqirish kifoya:

    from core.signals import connect_media_cleanup_signals
    connect_media_cleanup_signals(ProductImage, field_name="image")

Ulanadigan ikkita signal:
  1. post_delete — obyekt o'chirilganda unga bog'liq fayl ham diskdan o'chiriladi.
  2. pre_save    — obyekt yangilanayotganda eski fayl yangi fayldan farq qilsa,
                   eski (endi ishlatilmaydigan) fayl diskdan o'chiriladi.
"""
import logging

from django.core.files.storage import default_storage
from django.db.models.signals import post_delete, pre_save

logger = logging.getLogger(__name__)


def _safe_delete(path: str) -> None:
    """Faylni diskdan xavfsiz o'chirish (xatoda logga yoziladi, crash bo'lmaydi)."""
    if not path:
        return
    try:
        if default_storage.exists(path):
            default_storage.delete(path)
            logger.info("Media fayl tozalandi: %s", path)
    except FileNotFoundError:
        pass
    except Exception as exc:  # noqa: BLE001
        logger.warning("Faylni o'chirishda xato (%s): %s", path, exc)


def _current_file_name(instance, field_name: str):
    field_file = getattr(instance, field_name, None)
    return field_file.name if field_file else None


def connect_media_cleanup_signals(model, field_name: str = "image") -> None:
    """
    Berilgan model uchun media-tozalash signallarini ulaydi.
    dispatch_uid orqali signalning ikki marta ulanishi oldini olamiz.
    """

    def pre_save_cleanup(sender, instance, **kwargs):
        if not instance.pk:
            return  # yangi obyekt — eski fayl yo'q
        try:
            old_instance = sender.objects.get(pk=instance.pk)
        except sender.DoesNotExist:
            return
        old_name = _current_file_name(old_instance, field_name)
        new_name = _current_file_name(instance, field_name)
        if old_name and old_name != new_name:
            _safe_delete(old_name)

    def post_delete_cleanup(sender, instance, **kwargs):
        _safe_delete(_current_file_name(instance, field_name))

    pre_save.connect(
        pre_save_cleanup,
        sender=model,
        dispatch_uid=f"{model.__name__}.{field_name}.pre_save_cleanup",
    )
    post_delete.connect(
        post_delete_cleanup,
        sender=model,
        dispatch_uid=f"{model.__name__}.{field_name}.post_delete_cleanup",
    )
