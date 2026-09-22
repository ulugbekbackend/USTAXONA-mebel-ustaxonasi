from django import forms
from django.contrib import admin
from django.db import transaction

from orders.models import ContactMessage, Customer, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product_name", "unit_price", "quantity", "variant_name", "stock_reserved"]
    can_delete = False


class OrderAdminForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = "__all__"

    def clean_status(self):
        status = self.cleaned_data["status"]
        if (
            self.instance.pk
            and self.instance.status == Order.Status.CANCELLED
            and status != Order.Status.CANCELLED
        ):
            raise forms.ValidationError(
                "Bekor qilingan buyurtmani qayta tiklab bo'lmaydi — stok qaytarilgan. "
                "Yangi buyurtma yarating."
            )
        return status


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    form = OrderAdminForm
    list_display = [
        "number", "customer", "total", "status",
        "payment_method", "payment_status", "created_at",
    ]
    list_filter = ["status", "payment_method", "payment_status", "created_at"]
    search_fields = ["customer__full_name", "customer__phone", "address", "comment"]
    list_editable = ["status", "payment_status"]
    list_select_related = ["customer"]
    date_hierarchy = "created_at"
    readonly_fields = ["total", "created_at", "updated_at"]
    inlines = [OrderItemInline]

    def get_changelist_form(self, request, **kwargs):
        # list_editable orqali status o'zgartirilganda ham bir xil tekshiruv ishlaydi.
        kwargs.setdefault("form", OrderAdminForm)
        return super().get_changelist_form(request, **kwargs)

    @transaction.atomic
    def save_model(self, request, obj, form, change):
        cancelled_now = (
            change
            and "status" in form.changed_data
            and obj.status == Order.Status.CANCELLED
        )
        super().save_model(request, obj, form, change)
        if cancelled_now:
            obj.release_stock()

    @admin.display(description="Raqam")
    def number(self, obj):
        return obj.number


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ["full_name", "phone", "address", "created_at", "orders_count"]
    search_fields = ["full_name", "phone", "address"]

    @admin.display(description="Buyurtmalar")
    def orders_count(self, obj):
        return obj.orders.count()


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ["name", "phone", "short_message", "is_processed", "created_at"]
    list_filter = ["is_processed", "created_at"]
    list_editable = ["is_processed"]
    search_fields = ["name", "phone", "message"]
    readonly_fields = ["name", "phone", "message", "created_at"]

    @admin.display(description="Xabar")
    def short_message(self, obj):
        return obj.message[:80]
