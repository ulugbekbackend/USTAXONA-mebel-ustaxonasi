"""Katalog modellari: Category (ota-bola), Product, ProductImage, ProductVariant."""
from django.db import models
from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField("Yaratilgan", auto_now_add=True)
    updated_at = models.DateTimeField("Yangilangan", auto_now=True)

    class Meta:
        abstract = True


def webp_upload(subfolder: str):
    """WebP'ga avtomatik o'giriladigan rasm maydoni (django-imagekit)."""
    return ProcessedImageField(
        upload_to=f"{subfolder}/",
        processors=[ResizeToFill(1200, 900)],
        format="WEBP",
        options={"quality": 82},
        blank=True,
        null=True,
    )


class Category(TimeStampedModel):
    """Ota-bola (parent-child) tuzilishidagi kategoriya."""

    name = models.CharField("Nomi", max_length=120)
    slug = models.SlugField("Slug", max_length=140, unique=True)
    parent = models.ForeignKey(
        "self",
        verbose_name="Ota kategoriya",
        on_delete=models.CASCADE,
        related_name="children",
        null=True,
        blank=True,
    )
    description = models.TextField("Tavsif", blank=True)
    image = webp_upload("categories")

    class Meta:
        verbose_name = "Kategoriya"
        verbose_name_plural = "Kategoriyalar"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def get_descendant_ids(self) -> list[int]:
        """Barcha avlod kategoriya id'lari (o'zi bilan birga) — bitta SQL so'rov bilan."""
        children_map: dict[int | None, list[int]] = {}
        for pk, parent_id in Category.objects.values_list("id", "parent_id"):
            children_map.setdefault(parent_id, []).append(pk)
        ids, stack = [], [self.id]
        while stack:
            current = stack.pop()
            ids.append(current)
            stack.extend(children_map.get(current, []))
        return ids


class Product(TimeStampedModel):
    class Status(models.TextChoices):
        IN_STOCK = "in_stock", "Mavjud"
        ON_ORDER = "on_order", "Buyurtmaga"

    name = models.CharField("Nomi", max_length=200)
    slug = models.SlugField("Slug", max_length=220, unique=True)
    sku = models.CharField("Artikul", max_length=30, blank=True)
    description = models.TextField("Tavsif")
    category = models.ForeignKey(
        Category,
        verbose_name="Kategoriya",
        on_delete=models.PROTECT,
        related_name="products",
    )
    price = models.DecimalField("Narxi (so'm)", max_digits=12, decimal_places=2)
    old_price = models.DecimalField(
        "Eski narx", max_digits=12, decimal_places=2, null=True, blank=True
    )
    material = models.CharField("Material", max_length=80)
    dimensions = models.CharField("O'lchamlari", max_length=80, blank=True)
    weight = models.CharField("Og'irligi", max_length=40, blank=True)
    image = webp_upload("products")  # muqova rasmi
    status = models.CharField(
        "Holati", max_length=10, choices=Status.choices, default=Status.IN_STOCK
    )
    # Stok faqat "Mavjud" mahsulotlar uchun hisoblanadi va buyurtmada kamayadi.
    # "Buyurtmaga" mahsulotlar stokdan qat'i nazar yasab beriladi.
    stock = models.PositiveIntegerField("Stok miqdori", default=0)
    is_featured = models.BooleanField("Tavsiya etilgan", default=False)
    is_new = models.BooleanField("Yangi", default=False)

    class Meta:
        verbose_name = "Mahsulot"
        verbose_name_plural = "Mahsulotlar"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    """Mahsulot galereyasi — bir nechta rasm."""

    product = models.ForeignKey(
        Product,
        verbose_name="Mahsulot",
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = ProcessedImageField(
        verbose_name="Rasm",
        upload_to="products/gallery/",
        processors=[ResizeToFill(1200, 900)],
        format="WEBP",
        options={"quality": 82},
    )
    alt = models.CharField("Alt matn", max_length=200, blank=True)
    sort_order = models.PositiveSmallIntegerField("Tartib", default=0)

    class Meta:
        verbose_name = "Mahsulot rasmi"
        verbose_name_plural = "Mahsulot rasmlari"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.product.name} — rasm #{self.pk}"


class ProductVariant(models.Model):
    """Rang/variant (masalan: Yashil, Krem) — narx farqi bilan. Stok mahsulot darajasida."""

    product = models.ForeignKey(
        Product,
        verbose_name="Mahsulot",
        on_delete=models.CASCADE,
        related_name="variants",
    )
    name = models.CharField("Variant nomi", max_length=80)
    color_hex = models.CharField("Rang kodi", max_length=9, blank=True)
    price_delta = models.DecimalField(
        "Narx farqi", max_digits=12, decimal_places=2, default=0
    )

    class Meta:
        verbose_name = "Variant"
        verbose_name_plural = "Variantlar"
        ordering = ["id"]

    def __str__(self):
        return f"{self.product.name} — {self.name}"
