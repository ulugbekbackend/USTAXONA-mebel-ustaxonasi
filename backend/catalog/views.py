"""Katalog API: kategoriya daraxti + mahsulot ro'yxati (filtr, qidiruv, saralash, pagination)."""
import django_filters
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter

from catalog.models import Category, Product
from catalog.serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)
from core.pagination import StandardResultsSetPagination


class ProductFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(method="filter_category")
    q = django_filters.CharFilter(method="filter_search")
    material = django_filters.CharFilter(method="filter_material")
    price_min = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    price_max = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    in_stock = django_filters.BooleanFilter(method="filter_in_stock")
    is_featured = django_filters.BooleanFilter(field_name="is_featured")
    is_new = django_filters.BooleanFilter(field_name="is_new")
    exclude = django_filters.CharFilter(field_name="slug", exclude=True)

    class Meta:
        model = Product
        fields = []

    def filter_category(self, queryset, name, value):
        """Kategoriya (slug yoki id) + barcha avlodlari bo'yicha filtrlaydi."""
        lookup = {"pk": value} if value.isdigit() else {"slug": value}
        cat = Category.objects.filter(**lookup).first()
        if cat is None:
            return queryset.none()
        return queryset.filter(category_id__in=cat.get_descendant_ids())

    def filter_material(self, queryset, name, value):
        """Vergul bilan bir nechta material: ?material=Eman,Buk (istalgan biri)."""
        query = Q()
        for material in filter(None, (m.strip() for m in value.split(","))):
            query |= Q(material__icontains=material)
        return queryset.filter(query) if query else queryset

    def filter_search(self, queryset, name, value):
        """
        Qidiruv: hozircha oddiy icontains. Katta katalogda PostgreSQL
        full-text search'ga o'tkazish mumkin:
            from django.contrib.postgres.search import SearchVector
            queryset.annotate(search=SearchVector("name", "description"))
                      .filter(search=value)
        """
        return queryset.filter(
            Q(name__icontains=value)
            | Q(description__icontains=value)
            | Q(material__icontains=value)
            | Q(sku__icontains=value)
        )

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(status=Product.Status.IN_STOCK, stock__gt=0)
        return queryset


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Mahsulotlar: ro'yxat (filtr/qidiruv/saralash/pagination) va detal."""

    queryset = (
        Product.objects.select_related("category")
        .prefetch_related("images", "variants")
    )
    lookup_field = "slug"
    pagination_class = StandardResultsSetPagination
    filterset_class = ProductFilter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ["price", "created_at", "name"]
    ordering = ["-created_at"]

    def filter_queryset(self, queryset):
        # Saralash maydoni teng bo'lgan mahsulotlar sahifalar orasida takrorlanmasin/yo'qolmasin.
        queryset = super().filter_queryset(queryset)
        return queryset.order_by(*queryset.query.order_by, "-id")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Kategoriya daraxti (pagination'siz — bir so'rovda butun daraxt)."""

    queryset = Category.objects.filter(parent__isnull=True)
    serializer_class = CategorySerializer
    pagination_class = None
    lookup_field = "slug"

    def get_serializer_context(self):
        """Butun daraxt va mahsulot sonlari 2 ta so'rovda yuklanadi (N+1 yo'q)."""
        context = super().get_serializer_context()
        children_map: dict[int | None, list[Category]] = {}
        for cat in Category.objects.order_by("name"):
            children_map.setdefault(cat.parent_id, []).append(cat)
        context["children_map"] = children_map
        context["own_counts"] = dict(
            Product.objects.values("category_id")
            .annotate(n=Count("id"))
            .values_list("category_id", "n")
        )
        return context
