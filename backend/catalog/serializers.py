from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from catalog.models import Category, Product, ProductImage, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    """
    Kategoriya daraxti. View context'ga `children_map` (parent_id -> [Category])
    va `own_counts` (category_id -> mahsulotlar soni) beradi — butun daraxt
    N+1 so'rovsiz, xotirada yig'iladi.
    """

    children = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "parent", "description", "image",
                  "products_count", "children"]

    def _children(self, obj):
        return self.context["children_map"].get(obj.id, [])

    @extend_schema_field(serializers.ListField(child=serializers.DictField()))
    def get_children(self, obj):
        return CategorySerializer(self._children(obj), many=True, context=self.context).data

    @extend_schema_field(serializers.IntegerField())
    def get_products_count(self, obj):
        own = self.context["own_counts"].get(obj.id, 0)
        return own + sum(self.get_products_count(c) for c in self._children(obj))


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt", "sort_order"]


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ["id", "name", "color_hex", "price_delta"]


class ProductListSerializer(serializers.ModelSerializer):
    """Ro'yxat uchun yengil serializer — faqat muqova rasm."""

    image_url = serializers.SerializerMethodField()
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "sku", "price", "old_price", "material",
                  "dimensions", "status", "stock", "is_new", "is_featured",
                  "created_at", "category_slug", "category_name", "image_url"]

    def get_image_url(self, obj) -> str | None:
        # obj.images.all() prefetch'dan o'qiladi (.first() har safar yangi so'rov yuboradi).
        field = obj.image or next((i.image for i in obj.images.all()), None)
        if not field:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(field.url) if request else field.url


class ProductDetailSerializer(ProductListSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + [
            "description", "weight", "images", "variants",
        ]
