"""
Ustaxona — Django 5.2 sozlamalari.
Barcha maxfiy va muhitga bog'liq qiymatlar .env fayldan python-decouple orqali o'qiladi.
"""
import mimetypes
import sys
from pathlib import Path

from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parent.parent

# `manage.py test` yoki pytest — testlar .env'siz ham sqlite'da ishlaydi.
TESTING = "test" in sys.argv or "pytest" in sys.modules

SECRET_KEY = config("SECRET_KEY", default="test-only-secret-key" if TESTING else None)
DEBUG = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())
CSRF_TRUSTED_ORIGINS = config("CSRF_TRUSTED_ORIGINS", default="", cast=Csv())

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # tashqi
    "rest_framework",
    "django_filters",
    "corsheaders",
    "drf_spectacular",
    "imagekit",
    # loyiha ilovalari (apps/ papkasisiz, tub papkada)
    "core",
    "catalog",
    "orders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# PostgreSQL (.env orqali). Testlarda avtomatik sqlite ishlatiladi.
if config("DB_ENGINE", default="postgres") == "sqlite" or TESTING:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": config("DB_NAME"),
            "USER": config("DB_USER"),
            "PASSWORD": config("DB_USER_PASSWORD"),
            "HOST": config("DB_HOST", default="localhost"),
            "PORT": config("DB_PORT", default="5432"),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
]

LANGUAGE_CODE = "uz"
TIME_ZONE = "Asia/Tashkent"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / config("MEDIA_ROOT", default="media")

# Windows'ning MIME ro'yxatida webp yo'q — dev server rasmlarni octet-stream deb bermasin.
mimetypes.add_type("image/webp", ".webp")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- DRF ---
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "core.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 12,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    # Katalogni ko'rish bir sahifada bir nechta so'rov yuboradi — anon limit keng.
    # Buyurtma spamiga qarshi: bitta IP soatiga ko'pi bilan 10 ta buyurtma.
    "DEFAULT_THROTTLE_RATES": {
        "anon": "3000/hour",
        "user": "6000/hour",
        "orders": "10/hour",
        "contact": "5/hour",
    },
    # Django oldidagi reverse-proxy'lar soni (nginx yoki Traefik = 1). To'g'ri qiymat
    # bo'lmasa throttling barcha mijozlarni proxy IP'si ostida bitta deb hisoblaydi.
    "NUM_PROXIES": config("NUM_PROXIES", default=0, cast=int),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Ustaxona API",
    "DESCRIPTION": "Mebel ustaxonasi uchun katalog va buyurtma API'si (Swagger/OpenAPI).",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "ENUM_NAME_OVERRIDES": {
        "ProductStatusEnum": "catalog.models.Product.Status",
        "OrderStatusEnum": "orders.models.Order.Status",
    },
}

# --- Xavfsizlik (production) ---
# USE_HTTPS=True faqat sayt haqiqatan HTTPS orqali (Traefik/sertifikat bilan) ochilganda.
# Oddiy http://localhost:8080 da True bo'lsa — cheksiz redirect va admin'ga kirib bo'lmaydi.
USE_HTTPS = config("USE_HTTPS", default=not DEBUG, cast=bool)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
if USE_HTTPS:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30  # 30 kun
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
if not DEBUG:
    X_FRAME_OPTIONS = "DENY"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}

# CORS — faqat frontend domenlariga ochiq
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5173",
    cast=Csv(),
)
CORS_ALLOW_CREDENTIALS = False

# Saytning ommaviy manzili — sitemap.xml'dagi havolalar uchun
SITE_URL = config("SITE_URL", default="http://localhost:5173").rstrip("/")

# --- Telegram bot ---
TELEGRAM_BOT_TOKEN = config("TELEGRAM_BOT_TOKEN", default="")
TELEGRAM_CHAT_ID = config("TELEGRAM_CHAT_ID", default="")
