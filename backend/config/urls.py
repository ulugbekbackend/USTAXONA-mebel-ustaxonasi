"""Asosiy URL marshrutlar: admin, API, Swagger hujjatlar, media."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from catalog.sitemap import robots_txt, sitemap_xml

urlpatterns = [
    path("sitemap.xml", sitemap_xml, name="sitemap"),
    path("robots.txt", robots_txt, name="robots"),
    path("admin/", admin.site.urls),
    path("api/", include("catalog.urls")),
    path("api/", include("orders.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

admin.site.site_header = "Ustaxona boshqaruvi"
admin.site.site_title = "Ustaxona"
admin.site.index_title = "Mebel katalog va buyurtmalar"
