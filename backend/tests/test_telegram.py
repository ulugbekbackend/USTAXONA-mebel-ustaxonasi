"""Telegram xabari: mijoz matni HTML'ni buzmasligi kerak."""
from decimal import Decimal

import pytest

from core.telegram import format_order_message
from orders.models import Customer, Order, OrderItem


@pytest.mark.django_db
def test_customer_text_is_html_escaped():
    customer = Customer.objects.create(
        full_name="<b>Ali</b> & Co", phone="+998901234567", address="x",
    )
    order = Order.objects.create(
        customer=customer, address="Ko'cha <5>", comment="</i>", total=Decimal("100"),
    )
    OrderItem.objects.create(
        order=order, product_name="Stol <A&B>", unit_price=Decimal("100"), quantity=1,
    )

    text = format_order_message(order)

    assert "&lt;b&gt;Ali&lt;/b&gt; &amp; Co" in text
    assert "Ko&#x27;cha &lt;5&gt;" in text
    assert "Stol &lt;A&amp;B&gt;" in text
    assert "</i>" not in text
    assert text.startswith("<b>Yangi buyurtma")  # bizning teglarimiz saqlanadi
