"""
Telegram bot integratsiyasi — yangi buyurtma kelganda ustaga xabar yuboradi.
Bot yaratish: @BotFather -> /newbot -> tokenni .env'ga TELEGRAM_BOT_TOKEN qilib yozing.
Chat ID: @userinfobot yoki getUpdates orqali olinadi -> TELEGRAM_CHAT_ID.
"""
import logging
import threading
from html import escape

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

TELEGRAM_API = "https://api.telegram.org/bot{token}/sendMessage"


def send_telegram_message(text: str) -> bool:
    """Matnni ustaga yuboradi. Token sozlanmagan bo'lsa shunchaki o'tkazib yuboradi."""
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID
    if not token or not chat_id:
        logger.info("Telegram sozlanmagan — xabar yuborilmadi.")
        return False
    try:
        response = requests.post(
            TELEGRAM_API.format(token=token),
            json={
                "chat_id": chat_id,
                "text": text,
                "parse_mode": "HTML",
            },
            timeout=5,
        )
        if not response.ok:
            logger.warning("Telegram xabar rad etildi: %s %s", response.status_code, response.text[:200])
        return response.ok
    except requests.RequestException as exc:
        logger.warning("Telegram xabar yuborishda xato: %s", exc)
        return False


def format_order_message(order) -> str:
    """Buyurtma haqida xabar matni. Mijoz kiritgan barcha matn HTML-escape qilinadi."""
    e = escape
    lines = [
        f"<b>Yangi buyurtma #{order.number}</b>",
        f"Mijoz: {e(order.customer.full_name)}",
        f"Telefon: {e(order.customer.phone)}",
        f"Manzil: {e(order.address)}",
        "",
        "<b>Mahsulotlar:</b>",
    ]
    for item in order.items.all():
        variant = f" ({e(item.variant_name)})" if item.variant_name else ""
        lines.append(
            f"• {e(item.product_name)}{variant} × {item.quantity}"
            f" — {item.unit_price:,.0f} so'm"
        )
    lines += [
        "",
        f"<b>Jami: {order.total:,.0f} so'm</b>",
        f"To'lov: {order.get_payment_method_display()}"
        f" / {order.get_payment_status_display()}",
    ]
    if order.comment:
        lines.append(f"Izoh: {e(order.comment)}")
    return "\n".join(lines)


def notify_new_order(order) -> None:
    """
    Xabar matni shu yerda (DB ulanishi bor oqimda) tayyorlanadi, tarmoq so'rovi
    esa fon oqimida yuboriladi — Telegram sekin javob bersa ham mijoz kutmaydi.
    """
    text = format_order_message(order)
    threading.Thread(target=send_telegram_message, args=(text,), daemon=True).start()


def notify_contact_message(message) -> None:
    """Aloqa formasidan kelgan murojaat haqida xabar (fon oqimida)."""
    e = escape
    lines = [
        "<b>Yangi murojaat</b>",
        f"Ism: {e(message.name)}",
        f"Telefon: {e(message.phone)}",
    ]
    if message.message:
        lines += ["", e(message.message)]
    text = "\n".join(lines)
    threading.Thread(target=send_telegram_message, args=(text,), daemon=True).start()
