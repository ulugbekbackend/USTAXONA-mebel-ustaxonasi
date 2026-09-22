"""Buyurtma yaratish API'si — throttling bilan (spam cheklash) va Telegram bildirishnoma."""
from django.db import transaction
from rest_framework import mixins, viewsets
from rest_framework.throttling import ScopedRateThrottle

from core.telegram import notify_contact_message, notify_new_order
from orders.models import ContactMessage, Order
from orders.serializers import ContactMessageSerializer, OrderSerializer


class OrderViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    POST /api/orders/ — yangi buyurtma yaratadi.
    Anonim foydalanuvchi uchun soatiga 10 ta buyurtma (settings: 'orders' scope).
    """

    queryset = Order.objects.select_related("customer").prefetch_related("items")
    serializer_class = OrderSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "orders"

    def perform_create(self, serializer):
        order = serializer.save()
        # DB commit bo'lgach Telegram'ga xabar yuboramiz (muvaffaqiyatsiz bo'lsa ham
        # buyurtma saqlanib qoladi — xabar yuborish asosiy oqimni buzmaydi).
        transaction.on_commit(lambda: notify_new_order(order))


class ContactMessageViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """POST /api/contact/ — "Aloqa" formasi. Admin'da saqlanadi va Telegram'ga yuboriladi."""

    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "contact"

    def perform_create(self, serializer):
        message = serializer.save()
        transaction.on_commit(lambda: notify_contact_message(message))
