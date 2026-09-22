import re
from collections import Counter
from decimal import Decimal

from django.db import transaction
from django.db.models import F
from rest_framework import serializers

from catalog.models import Product, ProductVariant
from orders.models import ContactMessage, Customer, Order, OrderItem


def normalize_phone(value: str) -> str:
    """O'zbekiston raqamini +998XXXXXXXXX ko'rinishiga keltiradi."""
    digits = re.sub(r"\D", "", value)
    if len(digits) == 9:
        digits = "998" + digits
    if len(digits) != 12 or not digits.startswith("998"):
        raise serializers.ValidationError(
            "Telefon raqamini to'g'ri kiriting (masalan: +998 90 123 45 67)."
        )
    return "+" + digits


class OrderCustomerSerializer(serializers.Serializer):
    full_name = serializers.CharField(min_length=2, max_length=120)
    phone = serializers.CharField(max_length=32)
    address = serializers.CharField(min_length=5, max_length=255)

    def validate_phone(self, value):
        return normalize_phone(value)


class OrderItemWriteSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1, max_value=99)
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all(), required=False, allow_null=True
    )

    def validate(self, attrs):
        variant = attrs.get("variant")
        if variant and variant.product_id != attrs["product"].pk:
            raise serializers.ValidationError(
                {"variant": "Bu variant tanlangan mahsulotga tegishli emas."}
            )
        return attrs


class OrderItemReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["product_name", "unit_price", "quantity", "variant_name", "line_total"]


class OrderSerializer(serializers.ModelSerializer):
    customer = OrderCustomerSerializer()
    items = OrderItemWriteSerializer(many=True, write_only=True)
    read_items = OrderItemReadSerializer(source="items", many=True, read_only=True)
    number = serializers.CharField(read_only=True)

    class Meta:
        model = Order
        fields = ["id", "number", "customer", "items", "read_items",
                  "payment_method", "payment_status", "status", "total",
                  "comment", "created_at"]
        read_only_fields = ["payment_status", "status", "total", "created_at"]
        extra_kwargs = {"comment": {"max_length": 1000}}

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Buyurtmada kamida bitta mahsulot bo'lishi kerak.")
        return value

    def validate_payment_method(self, value):
        if value not in Order.AVAILABLE_PAYMENT_METHODS:
            raise serializers.ValidationError(
                "Payme va Click orqali to'lov tez kunda qo'shiladi. "
                "Hozircha naqd yoki terminal orqali to'lang."
            )
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["customer"]["phone"] = instance.customer.phone
        return data

    @staticmethod
    def _reserve_stock(items_data) -> set[int]:
        """
        "Mavjud" mahsulotlar stokini tekshiradi va kamaytiradi.
        Qatorlar select_for_update bilan qulflanadi — bir vaqtdagi ikki buyurtma
        oxirgi donani ikki marta sotib yubora olmaydi.
        """
        needed = Counter()
        for row in items_data:
            needed[row["product"].pk] += row["quantity"]

        locked = Product.objects.select_for_update().in_bulk(needed.keys())
        errors, reserved = [], set()
        for pk, qty in needed.items():
            product = locked[pk]
            if product.status != Product.Status.IN_STOCK:
                continue  # buyurtmaga yasaladi — stok cheklamaydi
            if product.stock < qty:
                errors.append(
                    f"«{product.name}» omborda {product.stock} dona qolgan, {qty} dona so'raldi."
                )
                continue
            reserved.add(pk)
        if errors:
            raise serializers.ValidationError({"items": errors})

        for pk in reserved:
            Product.objects.filter(pk=pk).update(stock=F("stock") - needed[pk])
        return reserved

    @transaction.atomic
    def create(self, validated_data):
        customer_data = validated_data.pop("customer")
        items_data = validated_data.pop("items")

        reserved = self._reserve_stock(items_data)

        customer, _ = Customer.objects.update_or_create(
            phone=customer_data["phone"],
            defaults={
                "full_name": customer_data["full_name"],
                "address": customer_data["address"],
            },
        )
        order = Order.objects.create(
            customer=customer, address=customer_data["address"], **validated_data
        )

        total = Decimal("0.00")
        for row in items_data:
            product: Product = row["product"]
            variant: ProductVariant | None = row.get("variant")
            unit_price = product.price + (variant.price_delta if variant else Decimal(0))
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                unit_price=unit_price,
                quantity=row["quantity"],
                variant_name=variant.name if variant else "",
                stock_reserved=product.pk in reserved,
            )
            total += unit_price * row["quantity"]

        order.total = total
        order.save(update_fields=["total"])
        return order


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["name", "phone", "message"]
        extra_kwargs = {
            "name": {"min_length": 2},
            "message": {"max_length": 2000},
        }

    def validate_phone(self, value):
        return normalize_phone(value)
