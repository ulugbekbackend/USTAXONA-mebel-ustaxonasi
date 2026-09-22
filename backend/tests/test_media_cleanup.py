"""
Media fayllarni avtomatik tozalash signallarini tekshiruvchi testlar
(core/signals.py -> connect_media_cleanup_signals).

Tekshiriladi:
  1. obyekt o'chirilganda fayl diskdan yo'qoladi (post_delete);
  2. obyekt yangilanganida eski fayl diskdan yo'qoladi (pre_save);
  3. galereya rasmlari (ProductImage) uchun ham xuddi shu ishlaydi.
"""
from io import BytesIO

import pytest
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from catalog.models import Product, ProductImage


def make_image(name: str = "test.jpg") -> SimpleUploadedFile:
    """Haqiqiy kichik JPEG fayl (ProcessedImageField qayta ishlashi uchun)."""
    buffer = BytesIO()
    Image.new("RGB", (80, 60), "#8a5a2b").save(buffer, format="JPEG")
    return SimpleUploadedFile(name, buffer.getvalue(), content_type="image/jpeg")


@pytest.mark.django_db
def test_product_image_deleted_on_object_delete(category):
    """post_delete: mahsulot o'chirilganda muqova rasm ham diskdan o'chiriladi."""
    product = Product.objects.create(
        name="Signal test divan", slug="signal-test-divan",
        description="t", category=category, price=1000, image=make_image(),
    )
    path = product.image.name
    assert default_storage.exists(path)

    product.delete()
    assert not default_storage.exists(path), "Fayl diskdan o'chirilmadi!"


@pytest.mark.django_db
def test_old_file_deleted_on_update(category):
    """pre_save: yangi rasm yuklanganda eski rasm diskdan o'chiriladi."""
    product = Product.objects.create(
        name="Signal test stol", slug="signal-test-stol",
        description="t", category=category, price=2000, image=make_image("old.jpg"),
    )
    old_path = product.image.name
    assert default_storage.exists(old_path)

    product.image = make_image("new.jpg")
    product.save()
    product.refresh_from_db()

    assert not default_storage.exists(old_path), "Eski fayl o'chirilmadi!"
    assert default_storage.exists(product.image.name)


@pytest.mark.django_db
def test_gallery_image_deleted_with_object(category):
    """ProductImage o'chirilganda galereya rasmi diskdan yo'qoladi."""
    product = Product.objects.create(
        name="Signal test kreslo", slug="signal-test-kreslo",
        description="t", category=category, price=3000,
    )
    gallery = ProductImage.objects.create(product=product, image=make_image("g1.jpg"))
    path = gallery.image.name
    assert default_storage.exists(path)

    gallery.delete()
    assert not default_storage.exists(path)


@pytest.mark.django_db
def test_same_file_not_deleted_when_unchanged(category):
    """Rasm o'zgarmasa fayl o'chirilmasligi kerak (false-positive yo'q)."""
    product = Product.objects.create(
        name="Signal test shkaf", slug="signal-test-shkaf",
        description="t", category=category, price=4000, image=make_image("same.jpg"),
    )
    path = product.image.name
    product.name = "Signal test shkaf (yangilangan nom)"
    product.save()

    assert default_storage.exists(path)
