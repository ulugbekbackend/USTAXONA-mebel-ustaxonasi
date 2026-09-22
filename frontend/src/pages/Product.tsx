import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import {
  IconBasket,
  IconChevron,
  IconCopy,
  IconFacebook,
  IconLeaf,
  IconMinus,
  IconPlus,
  IconShare,
  IconShield,
  IconTelegram,
  IconTruck,
  IconXSocial,
} from "../components/icons";
import type { Product } from "../lib/types";
import { categoryBySlug, fetchProduct, fetchSimilar, fmtPrice } from "../lib/api";
import { useCart } from "../lib/cart";
import { useI18n } from "../lib/i18n";
import { usePageMeta } from "../lib/meta";

export default function ProductPage() {
  const { slug = "" } = useParams();
  const { t } = useI18n();
  const { addItem, toast, setDrawerOpen } = useCart();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState<string>("desc");

  usePageMeta(
    product ? `${product.name} — ${fmtPrice(product.price)} | Ustaxona` : "Mahsulot | Ustaxona",
    product?.description.slice(0, 150)
  );

  useEffect(() => {
    let on = true;
    setProduct(undefined);
    setImgIdx(0);
    setVariantId(null);
    setQty(1);
    fetchProduct(slug).then((p) => {
      if (!on) return;
      setProduct(p);
      if (p) {
        setVariantId(p.variants[0]?.id ?? null);
        fetchSimilar(p).then((s) => on && setSimilar(s));
      }
    });
    return () => {
      on = false;
    };
  }, [slug]);

  if (product === undefined) {
    return (
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div className="skeleton aspect-[4/3] rounded-xl" />
        <div className="space-y-4">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-10 w-3/4 rounded" />
          <div className="skeleton h-8 w-40 rounded" />
          <div className="skeleton h-24 w-full rounded" />
          <div className="skeleton h-14 w-full rounded" />
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-bold">{t("not_found_t")}</h1>
        <p className="mt-3 text-ink-500">{t("not_found_d")}</p>
        <Link
          to="/catalog"
          className="mt-8 rounded-md border border-pine-900 bg-amber-400 px-6 py-3 font-display font-bold text-pine-950 shadow-hard-sm"
        >
          {t("back_to_catalog")}
        </Link>
      </div>
    );
  }

  const cat = categoryBySlug(product.category);
  const variant = product.variants.find((v) => v.id === variantId) ?? null;
  const price = product.price + (variant?.priceDelta ?? 0);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${product.name} — ${fmtPrice(price)} (Ustaxona)`;

  const addToCart = () => {
    addItem(product, qty, variantId);
    toast(`${t("added_to_cart")} — ${product.name}`);
    setDrawerOpen(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast(t("link_copied"));
    } catch {
      toast(t("link_copied"));
    }
  };

  const accordion = (key: string, title: string, body: React.ReactNode) => (
    <div className="border-b border-ink-900/10">
      <button
        type="button"
        onClick={() => setOpen(open === key ? "" : key)}
        className="flex w-full items-center justify-between py-4 text-left font-display text-base font-bold"
      >
        {title}
        <IconChevron className={`h-5 w-5 text-pine-600 transition-transform duration-300 ${open === key ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-all duration-300 ${open === key ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">{body}</div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <nav className="font-mono text-xs text-ink-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-pine-700">{t("home")}</Link>
        <span className="mx-2">/</span>
        <Link to="/catalog" className="hover:text-pine-700">{t("catalog")}</Link>
        {cat && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/catalog/${cat.slug}`} className="hover:text-pine-700">{cat.name}</Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-ink-900">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        {/* Galereya */}
        <div data-reveal="left">
          <div className="group relative overflow-hidden rounded-xl border border-ink-900/10 bg-bone-200">
            <img
              key={imgIdx}
              src={product.images[imgIdx]}
              alt={`${product.name} — ${imgIdx + 1}-rasm`}
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <span className="absolute right-4 top-4 rounded-sm bg-pine-950/75 px-2.5 py-1 font-mono text-xs text-bone-100">
              {product.sku}
            </span>
            {product.images.length > 1 && (
              <span className="absolute bottom-4 right-4 rounded-sm bg-pine-950/75 px-2.5 py-1 font-mono text-xs text-bone-100">
                {imgIdx + 1} / {product.images.length}
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  className={`h-20 w-24 overflow-hidden rounded-lg border-2 transition-all ${
                    i === imgIdx
                      ? "border-amber-500 shadow-hard-sm"
                      : "border-ink-900/10 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Kafolat lentasi */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: IconTruck, label: t("free_delivery") },
              { icon: IconShield, label: t("warranty_note").split("·")[0].trim() },
              { icon: IconLeaf, label: t("eco_note") },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-3 rounded-lg border border-ink-900/10 bg-bone-50 px-4 py-3">
                <b.icon className="h-5 w-5 shrink-0 text-pine-600" />
                <span className="text-xs font-semibold leading-snug text-ink-700">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ma'lumot */}
        <div data-reveal="right">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-pine-600">
            {product.material} · {product.sku}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-end gap-3">
            <span className="font-mono text-3xl font-bold text-pine-900">{fmtPrice(price)}</span>
            {product.oldPrice && (
              <span className="pb-1 font-mono text-lg text-ink-500 line-through">
                {fmtPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <div className="mt-4">
            {product.status === "in_stock" ? (
              <span className="inline-flex items-center gap-2 rounded-md bg-pine-100 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-pine-700">
                <span className="h-2 w-2 rounded-full bg-pine-600" />
                {t("in_stock")} — {product.stock} {t("stock_pcs")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-md bg-clay-400/20 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-clay-500">
                <span className="h-2 w-2 rounded-full bg-clay-500" />
                {t("on_order")} · 25–30 kun
              </span>
            )}
          </div>

          {/* Variantlar */}
          {product.variants.length > 0 && (
            <div className="mt-6">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
                {t("color_label")}
                {variant && <span className="ml-2 normal-case text-ink-900">— {variant.name}</span>}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    title={v.name}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-all ${
                      variantId === v.id
                        ? "border-pine-900 bg-pine-900 text-bone-50 shadow-hard-sm"
                        : "border-ink-900/15 bg-bone-50 hover:border-pine-700"
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-ink-900/20"
                      style={{ backgroundColor: v.hex }}
                    />
                    {v.name}
                    {v.priceDelta > 0 && (
                      <span className={`font-mono text-[10px] ${variantId === v.id ? "text-amber-300" : "text-ink-500"}`}>
                        +{fmtPrice(v.priceDelta).replace(" so'm", "")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Miqdor + savat */}
          <div className="mt-7 flex flex-wrap items-stretch gap-3">
            <div className="flex items-center rounded-md border border-ink-900/20 bg-bone-50">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3.5 py-3 text-ink-700 transition-colors hover:text-pine-700"
                aria-label="Kamaytirish"
              >
                <IconMinus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-mono text-base font-bold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                className="px-3.5 py-3 text-ink-700 transition-colors hover:text-pine-700"
                aria-label="Ko'paytirish"
              >
                <IconPlus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={addToCart}
              className="group flex flex-1 items-center justify-center gap-3 rounded-md border border-pine-900 bg-amber-400 px-6 py-3.5 font-display text-base font-bold text-pine-950 shadow-hard transition-all hover:-translate-y-0.5 hover:bg-amber-300 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              <IconBasket className="h-5 w-5 transition-transform group-hover:-rotate-6" />
              {t("add_to_cart")}
            </button>
          </div>

          {/* Ulashish */}
          <div className="mt-6 flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-ink-500">
              <IconShare className="h-4 w-4" /> {t("share_label")}:
            </span>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank" rel="noreferrer" aria-label="Telegram"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-ink-900/15 text-ink-700 transition-all hover:-translate-y-0.5 hover:border-pine-900 hover:bg-pine-900 hover:text-amber-300"
            >
              <IconTelegram className="h-4 w-4" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noreferrer" aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-ink-900/15 text-ink-700 transition-all hover:-translate-y-0.5 hover:border-pine-900 hover:bg-pine-900 hover:text-amber-300"
            >
              <IconFacebook className="h-4 w-4" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank" rel="noreferrer" aria-label="X"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-ink-900/15 text-ink-700 transition-all hover:-translate-y-0.5 hover:border-pine-900 hover:bg-pine-900 hover:text-amber-300"
            >
              <IconXSocial className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={copyLink}
              aria-label={t("link_copied")}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-ink-900/15 text-ink-700 transition-all hover:-translate-y-0.5 hover:border-pine-900 hover:bg-pine-900 hover:text-amber-300"
            >
              <IconCopy className="h-4 w-4" />
            </button>
          </div>

          {/* Accordions */}
          <div className="mt-8 border-t border-ink-900/10">
            {accordion(
              "desc",
              t("description_tab"),
              <p className="leading-relaxed text-ink-700">{product.description}</p>
            )}
            {accordion(
              "specs",
              t("specs"),
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
                {[
                  [t("material_lbl"), product.material],
                  [t("dims_label"), product.dimensions],
                  [t("weight_label"), product.weight],
                  [t("sku_label"), product.sku],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="font-mono text-xs uppercase tracking-wider text-ink-500">{k}</dt>
                    <dd className="font-semibold text-ink-900">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {accordion(
              "delivery",
              t("delivery_tab"),
              <p className="leading-relaxed text-ink-700">{t("delivery_note")}</p>
            )}
          </div>
        </div>
      </div>

      {/* O'xshash mahsulotlar */}
      {similar.length > 0 && (
        <section className="mt-16 lg:mt-24">
          <div className="flex items-end justify-between gap-4" data-reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("similar_title")}
            </h2>
            <Link to={`/catalog/${product.category}`} className="link-underline font-display text-sm font-semibold text-pine-700">
              {cat?.name} →
            </Link>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {similar.map((p, i) => (
              <div key={p.slug} data-reveal style={{ transitionDelay: `${i * 70}ms` }}>
                <ProductCard product={p} compact />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
