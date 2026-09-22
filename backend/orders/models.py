"""Buyurtma modellari: Customer, Order (payment_status bilan), OrderItem."""
from decimal import Decimal

from django.db import models


class Customer(models.Model):
    full_name = models.CharField("Ism-familiya", max_length=120)
    # +998XXXXXXXXX formatida saqlanadi — bir mijoz bir marta yaratiladi.
    phone = models.CharField("Telefon", max_length=20, unique=True)
    address = models.CharField("Oxirgi manzil", max_length=255)
    created_at = models.DateTimeField("Yaratilgan", auto_now_add=True)

    class Meta:
        verbose_name = "Mijoz"
        verbose_name_plural = "Mijozlar"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.phone})"


class Order(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "Yangi"
        IN_PROGRESS = "in_progress", "Jarayonda"
        DELIVERED = "delivered", "Yetkazilgan"
        CANCELLED = "cancelled", "Bekor qilingan"

    class PaymentMethod(models.TextChoices):
        CASH = "cash", "Naqd (yetkazilganda)"
        TERMINAL = "terminal", "Terminal"
        PAYME = "payme", "Payme"
        CLICK = "click", "Click"

    # Hozircha API faqat shularni qabul qiladi; Payme/Click merchant API ulangach qo'shiladi.
    AVAILABLE_PAYMENT_METHODS = (PaymentMethod.CASH, PaymentMethod.TERMINAL)

    class PaymentStatus(models.TextChoices):
        UNPAID = "unpaid", "To'lanmagan"
        PAID = "paid", "To'langan"
        REFUNDED = "refunded", "Qaytarilgan"

    customer = models.ForeignKey(
        Customer, verbose_name="Mijoz", on_delete=models.PROTECT, related_name="orders"
    )
    status = models.CharField(
        "Holati", max_length=12, choices=Status.choices, default=Status.NEW
    )
    payment_method = models.CharField(
        "To'lov usuli",
        max_length=10,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH,
    )
    payment_status = models.CharField(
        "To'lov holati",
        max_length=10,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID,
    )
    # Manzil buyurtma vaqtida snapshot qilinadi — mijoz keyin boshqa manzil
    # bersa ham eski buyurtma manzili o'zgarmaydi.
    address = models.CharField("Yetkazish manzili", max_length=255, default="")
    total = models.DecimalField("Jami (so'm)", max_digits=14, decimal_places=2, default=0)
    comment = models.TextField("Izoh", blank=True)
    created_at = models.DateTimeField("Yaratilgan", auto_now_add=True)
    updated_at = models.DateTimeField("Yangilangan", auto_now=True)

    class Meta:
        verbose_name = "Buyurtma"
        verbose_name_plural = "Buyurtmalar"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Buyurtma #{self.number}"

    @property
    def number(self) -> str:
        return f"UX-{self.pk:05d}"

    def release_stock(self) -> None:
        """Bekor qilingan buyurtma uchun ayirilgan stokni omborga qaytaradi."""
        from catalog.models import Product

        for item in self.items.filter(stock_reserved=True, product__isnull=False):
            Product.objects.filter(pk=item.product_id).update(
                stock=models.F("stock") + item.quantity
            )
        self.items.filter(stock_reserved=True).update(stock_reserved=False)


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, verbose_name="Buyurtma", on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        "catalog.Product",
        verbose_name="Mahsulot",
        on_delete=models.SET_NULL,
        null=True,
        related_name="order_items",
    )
    # Narx va nom snapshot qilib saqlanadi — mahsulot keyin o'zgarsa ham
    # eski buyurtma tarixi buzilmaydi.
    product_name = models.CharField("Mahsulot nomi", max_length=200)
    unit_price = models.DecimalField("Birlik narxi", max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField("Soni", default=1)
    variant_name = models.CharField("Variant", max_length=120, blank=True)
    # Buyurtmada mahsulot stokidan ayirilganmi — bekor qilinganda qaytariladi.
    stock_reserved = models.BooleanField("Stokdan ayirilgan", default=False)

    class Meta:
        verbose_name = "Buyurtma qatori"
        verbose_name_plural = "Buyurtma qatorlari"

    def __str__(self):
        return f"{self.product_name} × {self.quantity}"

    @property
    def line_total(self) -> Decimal:
        return self.unit_price * self.quantity


class ContactMessage(models.Model):
    """"Aloqa" sahifasidagi forma orqali kelgan murojaat."""

    name = models.CharField("Ism", max_length=120)
    phone = models.CharField("Telefon", max_length=20)
    message = models.TextField("Xabar", blank=True)
    is_processed = models.BooleanField("Ko'rib chiqilgan", default=False)
    created_at = models.DateTimeField("Yaratilgan", auto_now_add=True)

    class Meta:
        verbose_name = "Murojaat"
        verbose_name_plural = "Murojaatlar"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.phone})"
