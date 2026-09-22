# Ustaxona — mebel ustaxonasi uchun katalog va buyurtma sayti

To'liq stek: **Django 5.2 LTS + DRF + PostgreSQL** (backend) va **React 19 + Vite** (frontend).
Mebel yasaydigan usta uchun onlayn katalog, savat va buyurtma tizimi.

## Loyiha tuzilishi (apps/ papkasi YO'Q)

```
backend/
  manage.py
  config/            settings, urls, wsgi, asgi
  core/              umumiy: signals (media tozalash), pagination, telegram, apps
  catalog/           Category, Product, ProductImage, ProductVariant + API
                     fixtures/demo_catalog.json + `seed_demo` buyrug'i
  orders/            Customer, Order, OrderItem, ContactMessage + API (throttling bilan)
  tests/             pytest testlar (katalog, buyurtma, media signallar, telegram)
  Dockerfile
frontend/            React 19 + Vite (src/, public/, package.json, Dockerfile)
  src/lib/api.ts     DRF API qatlami (javoblarni frontend turlariga o'giradi)
nginx/nginx.conf     SPA + /api,/admin proxy, /media,/static volume'dan
scripts/backup-db.sh PostgreSQL avtomatik backup (cron uchun)
```

## Buyurtma logikasi

- **Narx backend'da hisoblanadi** — frontend faqat mahsulot, variant va sonini yuboradi.
  Variant tanlangan mahsulotga tegishli bo'lishi shart.
- **Stok:** `Mavjud` holatidagi mahsulotning stoki buyurtmada kamayadi (qatorlar
  `select_for_update` bilan qulflanadi). Stok yetmasa buyurtma rad etiladi.
  `Buyurtmaga` holatidagi mahsulot stokdan qat'i nazar qabul qilinadi.
  Stok mahsulot darajasida yuritiladi (variantlarda alohida stok yo'q).
- **Bekor qilish:** admin'da buyurtma `Bekor qilingan` qilinsa ayirilgan stok omborga
  qaytadi. Bekor qilingan buyurtmani qayta tiklab bo'lmaydi.
- **Mijoz** telefon raqami bo'yicha bitta yoziladi (`+998XXXXXXXXX`). Yetkazish manzili
  har bir buyurtmada alohida saqlanadi.

## To'lov

| Usul | Holati |
|---|---|
| Naqd (yetkazilganda) | ishlaydi |
| Terminal | ishlaydi |
| Payme | **tez kunda** — API `400` qaytaradi, saytda tugma o'chirilgan |
| Click | **tez kunda** — API `400` qaytaradi, saytda tugma o'chirilgan |

Ulash uchun: merchant API'ni yozib, `Order.AVAILABLE_PAYMENT_METHODS` (backend) va
`AVAILABLE_PAYMENT_METHODS` (`frontend/src/lib/api.ts`) ro'yxatlariga qo'shish kifoya.
`Order.payment_status` (unpaid/paid/refunded) maydoni tayyor.

## Media fayllarni avtomatik tozalash

`backend/core/signals.py` ichida **umumiy** `connect_media_cleanup_signals(Model, field_name)` funksiyasi:

- `post_delete` — obyekt o'chirilganda fayl `default_storage.delete()` bilan diskdan o'chiriladi;
- `pre_save` — yangi rasm yuklanganda bazadagi eski fayl yo'li bilan yangisi solishtiriladi,
  farq qilsa eski fayl diskdan o'chiriladi (ishlatilmayotgan rasm xotirada qolib ketmaydi).

Har bir media-model uchun qayta yozilmaydi — ilovalarning `apps.py → ready()` ichida ulanadi
(`catalog/apps.py`: `Product.image`, `ProductImage.image`, `Category.image`).

## API (drf-spectacular Swagger)

| Endpoint | Metod | Tavsif |
|---|---|---|
| `/api/categories/` | GET | Kategoriya daraxti, har birida `products_count` (avlodlari bilan) |
| `/api/products/` | GET | Ro'yxat — filtrlar pastda |
| `/api/products/{slug}/` | GET | Detal (galereya + variantlar) |
| `/api/orders/` | POST | Buyurtma yaratish (bitta IP soatiga 10 ta) |
| `/api/contact/` | POST | "Aloqa" formasi — admin'da `Murojaatlar`, Telegram'ga xabar (soatiga 5 ta) |
| `/sitemap.xml` | GET | Dinamik sitemap (kategoriya va mahsulotlar, `SITE_URL` asosida) |
| `/api/docs/` | GET | Swagger UI |

`/api/products/` filtrlari: `category` (slug yoki id, avlodlari bilan), `q` (nom, tavsif,
material, artikul), `material` (vergul bilan bir nechta: `Eman,Buk`), `price_min`, `price_max`,
`in_stock`, `is_featured`, `is_new`, `exclude` (slug), `ordering` (`price`, `-price`, `name`,
`-created_at`), `page`, `page_size` (≤ 48).

Rasmlar yuklanganda **django-imagekit** orqali avtomatik **WebP**'ga o'giriladi (1200×900, quality 82).

## Telegram bot

`.env` ga `TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` yozilsa, har bir yangi buyurtma
haqida ustaga formatlangan xabar boradi (`core/telegram.py`). Xabar tranzaksiya commit
bo'lgach fon oqimida yuboriladi — Telegram sekin yoki xato bo'lsa ham buyurtma saqlanadi
va mijoz kutib qolmaydi. Mijoz kiritgan matn HTML-escape qilinadi.

## Lokal ishga tushirish

### 1) Backend (Django)

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env        # SECRET_KEY ni almashtiring; lokal'da DB_ENGINE=sqlite

python manage.py migrate
python manage.py seed_demo            # demo kategoriya, mahsulot va rasmlar (internet kerak)
# python manage.py seed_demo --no-images  # internet bo'lmasa — rasmsiz
python manage.py createsuperuser
python manage.py runserver  # http://127.0.0.1:8000  (admin: /admin, API: /api/docs)
```

PostgreSQL bilan ishlash uchun `.env` dan `DB_ENGINE=sqlite` ni olib tashlab, `DB_*` ni to'ldiring.

### 2) Frontend (React)

```bash
cd frontend
cp .env.example .env        # API_PROXY_TARGET — Django manzili (default :8000)
npm install
npm run dev                 # http://localhost:5173
```

Dev'da `/api`, `/media` va `/sitemap.xml` so'rovlarini Vite backend'ga proxy qiladi — CORS kerak emas.
Backend boshqa domenda bo'lsa build oldidan `VITE_API_URL` ni bering.

### 3) Testlar

```bash
cd backend
pytest                      # .env'siz ham ishlaydi — testlar doim sqlite'da
```

### 4) Docker bilan (production uslubida)

```bash
cp .env.example .env                   # POSTGRES_PASSWORD, USE_HTTPS, domenlar
cp backend/.env.example backend/.env   # SECRET_KEY, Telegram
docker compose up -d --build
docker compose exec backend python manage.py createsuperuser
# Sayt: http://localhost:8080   Admin: http://localhost:8080/admin/
```

Domen hali olinmagan — hamma joyda `example.com` placeholder turibdi (root `.env` da `DOMAIN=example.com`). Domen olingach faqat
`.env` o'zgartiriladi: `DOMAIN=<domen>`, `SITE_URL=https://<domen>`, `USE_HTTPS=True`.
`ALLOWED_HOSTS`, CSRF, Traefik qoidalari, `sitemap.xml` va `robots.txt` shundan quriladi.

HTTPS'siz lokal sinov uchun `USE_HTTPS=False` qoldiring — aks holda Django https'ga
yo'naltiradi va admin'ga kirib bo'lmaydi.

Backup (cron): `0 3 * * * /path/to/scripts/backup-db.sh` — har kuni 03:00 da, 14 kun saqlanadi.

## Production xavfsizlik (sozlangan)

`USE_HTTPS=True` da: HTTPS redirect, HSTS (30 kun), secure cookie'lar.
`ALLOWED_HOSTS`/`CORS_ALLOWED_ORIGINS` faqat .env'dagi domenlarga ochiq.
DRF throttling (anon 3000/soat, buyurtma 10/soat) proxy ortida mijozning haqiqiy IP'si
bo'yicha ishlaydi (`NUM_PROXIES`).
