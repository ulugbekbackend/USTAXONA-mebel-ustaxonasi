"""
Demo katalogni bazaga yuklaydi (catalog/fixtures/demo_catalog.json):

    python manage.py seed_demo               # kategoriya, mahsulot va rasmlar
    python manage.py seed_demo --no-images   # rasmsiz

Rasmlar catalog/fixtures/images/ ichida (internet kerak emas). Ular oddiy yuklangan rasm
kabi media/ ga saqlanadi va admin'da almashtirilishi mumkin.

Qayta ishga tushirish xavfsiz — yozuvlar slug bo'yicha yangilanadi, takrorlanmaydi.
"""
import json
from pathlib import Path

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.dateparse import parse_datetime

from catalog.models import Category, Product, ProductImage, ProductVariant

FIXTURES = Path(__file__).resolve().parents[2] / "fixtures"
FIXTURE = FIXTURES / "demo_catalog.json"
IMAGES_DIR = FIXTURES / "images"


class Command(BaseCommand):
    help = "Demo kategoriya va mahsulotlarni bazaga yuklaydi."

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-images",
            action="store_true",
            help="Rasmlarsiz yuklaydi.",
        )

    def handle(self, *args, **options):
        data = json.loads(FIXTURE.read_text(encoding="utf-8"))
        with_images = not options["no_images"]

        with transaction.atomic():
            categories = self._load_categories(data["categories"], with_images)
            for row in data["products"]:
                self._load_product(row, categories, with_images)

        self.stdout.write(self.style.SUCCESS(
            f"Yuklandi: {len(data['categories'])} kategoriya, {len(data['products'])} mahsulot."
        ))
        if not with_images:
            self.stdout.write("Rasmlar yuklanmadi — kerak bo'lsa: python manage.py seed_demo")

    def _image(self, key: str) -> ContentFile:
        path = IMAGES_DIR / f"{key}.webp"
        if not path.is_file():
            raise CommandError(f"Demo rasm topilmadi: {path}")
        return ContentFile(path.read_bytes(), name=path.name)

    def _load_categories(self, rows, with_images) -> dict[str, Category]:
        categories: dict[str, Category] = {}
        for row in rows:  # fixture'da ota kategoriya har doim bolasidan oldin keladi
            cat, _ = Category.objects.update_or_create(
                slug=row["slug"],
                defaults={"name": row["name"], "parent": categories.get(row["parent"])},
            )
            if with_images and not cat.image:
                cat.image = self._image(row["image"])
                cat.save()
            categories[cat.slug] = cat
        return categories

    def _load_product(self, row, categories, with_images) -> None:
        product, _ = Product.objects.update_or_create(
            slug=row["slug"],
            defaults={
                "sku": row["sku"],
                "name": row["name"],
                "category": categories[row["category"]],
                "price": row["price"],
                "old_price": row["old_price"],
                "material": row["material"],
                "dimensions": row["dimensions"],
                "weight": row["weight"],
                "stock": row["stock"],
                "status": row["status"],
                "is_new": row["is_new"],
                "is_featured": row["is_featured"],
                "description": row["description"],
            },
        )
        # created_at auto_now_add — saralash demo'dagidek bo'lishi uchun alohida yoziladi.
        Product.objects.filter(pk=product.pk).update(created_at=parse_datetime(row["created_at"]))

        for variant in row["variants"]:
            ProductVariant.objects.update_or_create(
                product=product,
                name=variant["name"],
                defaults={"color_hex": variant["color_hex"], "price_delta": variant["price_delta"]},
            )

        if with_images and not product.images.exists():
            for order, key in enumerate(row["images"]):
                ProductImage.objects.create(
                    product=product, image=self._image(key), alt=row["name"], sort_order=order
                )
