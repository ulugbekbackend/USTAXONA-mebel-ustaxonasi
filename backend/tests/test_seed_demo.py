"""`seed_demo` buyrug'i: demo katalog internetsiz, rasmlari bilan yuklanadi va qayta ishga tushirish xavfsiz."""
import json
from pathlib import Path

import pytest
from django.core.management import call_command

from catalog.models import Category, Product, ProductImage

FIXTURE = Path(__file__).resolve().parents[1] / "catalog" / "fixtures" / "demo_catalog.json"


@pytest.mark.django_db
def test_seed_demo_loads_catalog_with_images():
    data = json.loads(FIXTURE.read_text(encoding="utf-8"))

    call_command("seed_demo")

    assert Category.objects.count() == len(data["categories"])
    assert Product.objects.count() == len(data["products"])
    assert not Category.objects.filter(image="").exists()
    expected_images = sum(len(p["images"]) for p in data["products"])
    assert ProductImage.objects.count() == expected_images


@pytest.mark.django_db
def test_seed_demo_is_idempotent():
    call_command("seed_demo", no_images=True)
    call_command("seed_demo", no_images=True)

    data = json.loads(FIXTURE.read_text(encoding="utf-8"))
    assert Product.objects.count() == len(data["products"])
    assert ProductImage.objects.count() == 0
