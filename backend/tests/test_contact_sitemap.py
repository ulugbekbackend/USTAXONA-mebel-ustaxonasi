"""Aloqa formasi (/api/contact/) va /sitemap.xml testlari."""
from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from catalog.models import Product
from orders.models import ContactMessage


@pytest.mark.django_db
def test_contact_message_is_saved_with_normalized_phone():
    response = APIClient().post(
        reverse("contact-list"),
        {"name": "Dilnoza", "phone": "90 123 45 67", "message": "Shkaf o'lchami bo'yicha savol"},
        format="json",
    )
    assert response.status_code == 201, response.data
    msg = ContactMessage.objects.get()
    assert msg.phone == "+998901234567"
    assert not msg.is_processed


@pytest.mark.django_db
def test_contact_message_rejects_bad_phone():
    response = APIClient().post(
        reverse("contact-list"), {"name": "Dilnoza", "phone": "12"}, format="json"
    )
    assert response.status_code == 400
    assert not ContactMessage.objects.exists()


@pytest.mark.django_db
def test_sitemap_lists_categories_and_products(settings, category):
    settings.SITE_URL = "https://example.com"
    Product.objects.create(
        name="Stol", slug="eman-stol", description="-", category=category, price=Decimal("1"),
    )
    response = APIClient().get("/sitemap.xml")

    assert response.status_code == 200
    body = response.content.decode()
    assert "<loc>https://example.com/catalog/test-kategoriya</loc>" in body
    assert "<loc>https://example.com/product/eman-stol</loc>" in body
    assert "#" not in body


@pytest.mark.django_db
def test_robots_txt_uses_site_url(settings):
    settings.SITE_URL = "https://example.com"
    response = APIClient().get("/robots.txt")
    assert response.status_code == 200
    assert "Sitemap: https://example.com/sitemap.xml" in response.content.decode()
