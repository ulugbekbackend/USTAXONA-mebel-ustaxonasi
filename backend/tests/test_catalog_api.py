"""Katalog API testlari: kategoriya daraxti, filtrlar, so'rovlar soni."""
from decimal import Decimal

import pytest
from django.db import connection
from django.test.utils import CaptureQueriesContext
from django.urls import reverse
from rest_framework.test import APIClient

from catalog.models import Category, Product


@pytest.fixture
def tree(db):
    """mebel -> (divanlar -> burchak), stullar"""
    root = Category.objects.create(name="Mebel", slug="mebel")
    sofas = Category.objects.create(name="Divanlar", slug="divanlar", parent=root)
    corner = Category.objects.create(name="Burchak", slug="burchak", parent=sofas)
    chairs = Category.objects.create(name="Stullar", slug="stullar", parent=root)

    def make(slug, cat, material, **kw):
        return Product.objects.create(
            name=slug, slug=slug, description="-", category=cat,
            price=Decimal("1000000"), material=material, stock=1, **kw,
        )

    make("divan-1", sofas, "Eman", is_featured=True)
    make("burchak-1", corner, "Yong'oq")
    make("stul-1", chairs, "Buk", is_new=True)
    return {"root": root, "sofas": sofas, "corner": corner, "chairs": chairs}


def _slugs(response):
    return sorted(p["slug"] for p in response.data["results"])


@pytest.mark.django_db
def test_category_tree_counts_include_descendants(tree):
    response = APIClient().get(reverse("category-list"))

    assert response.status_code == 200
    [root] = response.data
    assert root["products_count"] == 3
    sofas = next(c for c in root["children"] if c["slug"] == "divanlar")
    assert sofas["products_count"] == 2
    assert sofas["children"][0]["slug"] == "burchak"


@pytest.mark.django_db
def test_category_tree_query_count_is_constant(tree):
    for i in range(10):
        Category.objects.create(name=f"Qo'shimcha {i}", slug=f"extra-{i}", parent=tree["chairs"])
    with CaptureQueriesContext(connection) as ctx:
        APIClient().get(reverse("category-list"))
    assert len(ctx.captured_queries) <= 4


@pytest.mark.django_db
@pytest.mark.parametrize("value", ["divanlar", "by-id"])
def test_filter_by_category_slug_or_id(tree, value):
    value = str(tree["sofas"].pk) if value == "by-id" else value
    response = APIClient().get(reverse("product-list"), {"category": value})
    assert _slugs(response) == ["burchak-1", "divan-1"]


@pytest.mark.django_db
def test_filter_by_multiple_materials(tree):
    response = APIClient().get(reverse("product-list"), {"material": "Eman,Buk"})
    assert _slugs(response) == ["divan-1", "stul-1"]


@pytest.mark.django_db
def test_filter_featured_new_and_exclude(tree):
    client = APIClient()
    assert _slugs(client.get(reverse("product-list"), {"is_featured": "true"})) == ["divan-1"]
    assert _slugs(client.get(reverse("product-list"), {"is_new": "true"})) == ["stul-1"]
    assert _slugs(client.get(reverse("product-list"), {"exclude": "divan-1"})) == ["burchak-1", "stul-1"]


@pytest.mark.django_db
def test_get_descendant_ids(tree):
    ids = set(tree["root"].get_descendant_ids())
    assert ids == {c.pk for c in tree.values()}
