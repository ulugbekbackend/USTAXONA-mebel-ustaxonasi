"""Buyurtma API'si testlari: yaratish, narx, variant, stok, telefon, to'lov usuli."""
from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from catalog.models import Product, ProductVariant
from orders.models import Customer, Order


@pytest.fixture
def product(category):
    return Product.objects.create(
        name="Test divan", slug="test-divan", description="tavsif",
        category=category, price=Decimal("1500000"), stock=5,
    )


@pytest.fixture
def client():
    return APIClient()


def _payload(product_id: int, variant_id: int | None = None, quantity: int = 2) -> dict:
    item = {"product": product_id, "quantity": quantity}
    if variant_id:
        item["variant"] = variant_id
    return {
        "customer": {
            "full_name": "Aziz Karimov",
            "phone": "+998 90 123-45-67",
            "address": "Toshkent, Chilonzor-9",
        },
        "payment_method": "cash",
        "comment": "Iltimos, oqshomga yetkazing",
        "items": [item],
    }


def _post(client, payload):
    return client.post(reverse("order-list"), payload, format="json")


@pytest.mark.django_db
def test_create_order_computes_total(client, product):
    response = _post(client, _payload(product.id))

    assert response.status_code == 201, response.data
    order = Order.objects.get(pk=response.data["id"])
    assert order.total == Decimal("3000000")
    assert order.items.count() == 1
    assert order.number == f"UX-{order.pk:05d}"
    assert order.payment_status == "unpaid"
    assert order.address == "Toshkent, Chilonzor-9"


@pytest.mark.django_db
def test_create_order_with_variant_price_delta(client, product):
    variant = ProductVariant.objects.create(
        product=product, name="Yashil", color_hex="#4a5d4e", price_delta=Decimal("200000"),
    )
    response = _post(client, _payload(product.id, variant.id))

    assert response.status_code == 201
    order = Order.objects.get(pk=response.data["id"])
    assert order.total == Decimal("3400000")  # (1500000 + 200000) * 2
    assert order.items.first().variant_name == "Yashil"


@pytest.mark.django_db
def test_variant_of_other_product_is_rejected(client, product, category):
    other = Product.objects.create(
        name="Qimmat shkaf", slug="qimmat-shkaf", description="-",
        category=category, price=Decimal("9000000"), stock=5,
    )
    foreign_variant = ProductVariant.objects.create(
        product=other, name="Oltin", price_delta=Decimal("-8000000"),
    )
    response = _post(client, _payload(product.id, foreign_variant.id))

    assert response.status_code == 400
    assert not Order.objects.exists()


@pytest.mark.django_db
def test_order_requires_items(client, product):
    payload = _payload(product.id)
    payload["items"] = []
    assert _post(client, payload).status_code == 400


@pytest.mark.django_db
def test_stock_is_decremented(client, product):
    assert _post(client, _payload(product.id, quantity=2)).status_code == 201
    product.refresh_from_db()
    assert product.stock == 3


@pytest.mark.django_db
def test_insufficient_stock_is_rejected(client, product):
    # Bir xil mahsulot ikki qatorda: 3 + 3 = 6 > 5 — umumiy miqdor tekshiriladi.
    payload = _payload(product.id, quantity=3)
    payload["items"].append({"product": product.id, "quantity": 3})
    response = _post(client, payload)

    assert response.status_code == 400
    product.refresh_from_db()
    assert product.stock == 5
    assert not Order.objects.exists()


@pytest.mark.django_db
def test_on_order_product_ignores_stock(client, product):
    product.status = Product.Status.ON_ORDER
    product.stock = 0
    product.save()

    assert _post(client, _payload(product.id, quantity=4)).status_code == 201
    product.refresh_from_db()
    assert product.stock == 0


@pytest.mark.django_db
def test_cancel_releases_stock(client, product):
    response = _post(client, _payload(product.id, quantity=2))
    order = Order.objects.get(pk=response.data["id"])

    order.release_stock()
    product.refresh_from_db()
    assert product.stock == 5
    order.release_stock()  # ikkinchi marta chaqirilsa stok ikki marta qaytmaydi
    product.refresh_from_db()
    assert product.stock == 5


@pytest.mark.django_db
@pytest.mark.parametrize("method", ["payme", "click"])
def test_payme_click_are_coming_soon(client, product, method):
    payload = _payload(product.id)
    payload["payment_method"] = method
    response = _post(client, payload)

    assert response.status_code == 400
    assert "tez kunda" in str(response.data["payment_method"])


@pytest.mark.django_db
@pytest.mark.parametrize("phone", ["123", "+7 999 123 45 67", "90 123 45 6"])
def test_invalid_phone_is_rejected(client, product, phone):
    payload = _payload(product.id)
    payload["customer"]["phone"] = phone
    assert _post(client, payload).status_code == 400


@pytest.mark.django_db
def test_customer_is_reused_by_phone(client, product):
    _post(client, _payload(product.id, quantity=1))
    payload = _payload(product.id, quantity=1)
    payload["customer"]["phone"] = "901234567"  # xuddi shu raqam, boshqa formatda
    payload["customer"]["address"] = "Samarqand, Registon ko'chasi"
    _post(client, payload)

    customer = Customer.objects.get()
    assert customer.phone == "+998901234567"
    assert customer.address == "Samarqand, Registon ko'chasi"
    assert customer.orders.count() == 2
    # Birinchi buyurtma manzili o'zgarmagan
    assert customer.orders.order_by("pk").first().address == "Toshkent, Chilonzor-9"
