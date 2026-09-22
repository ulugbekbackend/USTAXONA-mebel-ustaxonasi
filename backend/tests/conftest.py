"""Pytest fixture'lari: media fayllar vaqtinchalik papkada saqlanadi."""
import pytest


@pytest.fixture(autouse=True)
def _tmp_media(settings, tmp_path):
    """Barcha testlarda MEDIA_ROOT tmp papkaga ko'chiriladi — disk toza qoladi."""
    settings.MEDIA_ROOT = tmp_path / "media"


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    """Throttling hisoblagichlari keshda saqlanadi — testlar bir-biriga ta'sir qilmasin."""
    from django.core.cache import cache

    cache.clear()


@pytest.fixture
def category(db):
    from catalog.models import Category

    return Category.objects.create(name="Test kategoriya", slug="test-kategoriya")
