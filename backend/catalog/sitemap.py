"""
/sitemap.xml va /robots.txt — frontend sahifalari (bosh sahifa, katalog, kategoriya, mahsulot) ro'yxati.
Havolalar SITE_URL (.env) asosida quriladi — domen kodga yozilmaydi. Nginx ikkalasini shu yerga uzatadi.
"""
from xml.sax.saxutils import escape

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.cache import cache_page

from catalog.models import Category, Product

STATIC_PAGES = [("/", "daily", "1.0"), ("/catalog", "daily", "0.9"), ("/contact", "monthly", "0.6")]


@cache_page(60 * 60)
def sitemap_xml(request):
    base = settings.SITE_URL
    rows = [(base + path, None, freq, prio) for path, freq, prio in STATIC_PAGES]
    rows += [
        (f"{base}/catalog/{c.slug}", c.updated_at, "weekly", "0.8")
        for c in Category.objects.only("slug", "updated_at")
    ]
    rows += [
        (f"{base}/product/{p.slug}", p.updated_at, "weekly", "0.7")
        for p in Product.objects.only("slug", "updated_at")
    ]

    urls = []
    for loc, lastmod, freq, prio in rows:
        mod = f"<lastmod>{lastmod.date().isoformat()}</lastmod>" if lastmod else ""
        urls.append(
            f"  <url><loc>{escape(loc)}</loc>{mod}"
            f"<changefreq>{freq}</changefreq><priority>{prio}</priority></url>"
        )
    body = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    return HttpResponse(body, content_type="application/xml")


def robots_txt(request):
    """Sitemap havolasi SITE_URL'dan olinadi — domen kodga qattiq yozilmaydi."""
    lines = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin/",
        "Disallow: /api/",
        "",
        f"Sitemap: {settings.SITE_URL}/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines) + "\n", content_type="text/plain")
