import { Link, useNavigate } from "react-router-dom";
import {
  IconArrow,
  IconBasket,
  IconMinus,
  IconPlus,
  IconTrash,
  IconTruck,
} from "../components/icons";
import { fmtPrice } from "../lib/api";
import { useCart } from "../lib/cart";
import { useI18n } from "../lib/i18n";
import { usePageMeta } from "../lib/meta";

export default function CartPage() {
  const { t } = useI18n();
  const { items, setQty, removeItem, clear, subtotal, toast } = useCart();
  const navigate = useNavigate();
  usePageMeta(`${t("cart_title")} — Ustaxona`);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
        <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-bone-300 bg-bone-50">
          <IconBasket className="h-10 w-10 text-bone-300" />
        </span>
        <h1 className="mt-7 font-display text-3xl font-bold">{t("cart_empty_t")}</h1>
        <p className="mt-3 max-w-md text-ink-500">{t("cart_empty_d")}</p>
        <Link
          to="/catalog"
          className="group mt-9 flex items-center gap-2.5 rounded-md border border-pine-900 bg-amber-400 px-7 py-3.5 font-display font-bold text-pine-950 shadow-hard transition-all hover:-translate-y-0.5 hover:bg-amber-300 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          {t("cta_catalog")}
          <IconArrow className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t("cart_title")}
          <span className="ml-3 font-mono text-lg font-medium text-ink-500">({items.length})</span>
        </h1>
        <button
          type="button"
          onClick={() => {
            clear();
            toast(t("cart_clear"));
          }}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink-500 transition-colors hover:text-clay-500"
        >
          <IconTrash className="h-4 w-4" /> {t("cart_clear")}
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {items.map((i, idx) => (
            <li
              key={i.key}
              data-reveal
              style={{ transitionDelay: `${idx * 60}ms` }}
              className="flex flex-col gap-4 rounded-lg border border-ink-900/10 bg-bone-50 p-4 transition-all hover:border-pine-900/30 hover:shadow-hard-sm sm:flex-row sm:items-center"
            >
              <Link to={`/product/${i.slug}`} className="shrink-0">
                <img src={i.image} alt={i.name} className="h-28 w-full rounded-md object-cover sm:h-24 sm:w-32" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/product/${i.slug}`} className="font-display text-lg font-bold hover:text-pine-700">
                  {i.name}
                </Link>
                <p className="mt-1 font-mono text-xs text-ink-500">
                  {fmtPrice(i.price)}
                  {i.variant && <span className="ml-2 text-amber-600">· {i.variant}</span>}
                </p>
                {i.stock > 0 && i.stock < 5 && (
                  <p className="mt-1 font-mono text-[11px] text-clay-500">
                    {t("in_stock")}: {i.stock} {t("stock_pcs")}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center rounded-md border border-ink-900/15 bg-bone-100">
                  <button
                    type="button"
                    onClick={() => setQty(i.key, i.qty - 1)}
                    className="p-2.5 text-ink-700 transition-colors hover:text-pine-700"
                    aria-label="Kamaytirish"
                  >
                    <IconMinus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center font-mono text-sm font-bold">{i.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(i.key, i.qty + 1)}
                    className="p-2.5 text-ink-700 transition-colors hover:text-pine-700"
                    aria-label="Ko'paytirish"
                  >
                    <IconPlus className="h-4 w-4" />
                  </button>
                </div>
                <span className="w-36 text-right font-mono text-base font-bold text-pine-900">
                  {fmtPrice(i.price * i.qty)}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(i.key)}
                  className="rounded-md p-2 text-ink-500 transition-colors hover:bg-clay-400/15 hover:text-clay-500"
                  aria-label="O'chirish"
                >
                  <IconTrash className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Xulosa */}
        <aside className="h-fit rounded-lg border border-ink-900/10 bg-bone-50 p-6 lg:sticky lg:top-32" data-reveal="right">
          <h2 className="font-display text-xl font-bold">{t("order_summary")}</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">{t("subtotal")}</dt>
              <dd className="font-mono font-semibold">{fmtPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="flex items-center gap-2 text-ink-500">
                <IconTruck className="h-4 w-4 text-pine-600" /> {t("delivery_row")}
              </dt>
              <dd className="text-right font-mono text-xs text-amber-600">{t("delivery_calc")}</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-end justify-between border-t border-dashed border-ink-900/20 pt-5">
            <span className="font-display text-lg font-bold">{t("total")}</span>
            <span className="font-mono text-2xl font-bold text-pine-900">{fmtPrice(subtotal)}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/checkout")}
            className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-md border border-pine-900 bg-amber-400 px-6 py-4 font-display text-base font-bold text-pine-950 shadow-hard transition-all hover:-translate-y-0.5 hover:bg-amber-300 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            {t("to_checkout")}
            <IconArrow className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
          </button>
          <Link
            to="/catalog"
            className="mt-3 block text-center font-mono text-xs uppercase tracking-wider text-ink-500 transition-colors hover:text-pine-700"
          >
            ← {t("continue_shopping")}
          </Link>
          <p className="mt-5 rounded-md bg-amber-400/15 px-3.5 py-2.5 font-mono text-[11px] leading-relaxed text-amber-600">
            {t("payment_note")}
          </p>
        </aside>
      </div>
    </div>
  );
}
