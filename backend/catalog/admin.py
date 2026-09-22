from django.contrib import admin

from catalog.models import Category, Product, ProductImage, ProductVariant


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "parent", "products_count"]
    search_fields = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ["parent"]

    @admin.display(description="Mahsulotlar")
    def products_count(self, obj):
        return obj.products.count()


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name", "category", "price", "status", "stock",
        "is_featured", "is_new", "created_at",
    ]
    list_filter = ["status", "material", "category", "is_featured", "is_new"]
    search_fields = ["name", "slug", "description"]
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ["is_featured", "is_new", "status"]
    list_select_related = ["category"]
    date_hierarchy = "created_at"
    inlines = [ProductImageInline, ProductVariantInline]
    actions = ["make_featured", "mark_new"]

    @admin.action(description="Tavsiya etilgan qilish")
    def make_featured(self, request, queryset):
        queryset.update(is_featured=True)

    @admin.action(description="Yangi deb belgilash")
    def mark_new(self, request, queryset):
        queryset.update(is_new=True)


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ["__str__", "product", "sort_order"]
    list_filter = ["product"]
