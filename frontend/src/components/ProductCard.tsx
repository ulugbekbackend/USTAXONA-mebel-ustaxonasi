import { Link } from "react-router-dom";
import type { Product } from "../lib/types";
import { fmtPrice } from "../lib/api";
import { useCart } from "../lib/cart";
import { useI18n } from "../lib/i18n";
import { IconBasket, IconPlus } from "./icons";

export default function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const { addItem, toast, setDrawerOpen } = useCart();
  const { t } = useI18n();

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast(`${t("added_to_cart")} — ${product.name}`);
  };

  const badges: { label: string; cls: string }[] = [];
  if (product.isNew) badges.push({ label: t("badge_new"), cls: "bg-amber-400 text-pine-950" });
  if (product.oldPrice) badges.push({ label: t("badge_sale"), cls: "bg-clay-500 text-bone-50" });
  if (product.isFeatured) badges.push({ label: t("badge_top"), cls: "bg-pine-800 text-amber-300" });

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-ink-900/10 bg-bone-50 transition-all duration-300 hover:-translate-y-1.5 hover:border-pine-900/40 hover:shadow-hard"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-bone-200">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {badges.map((b) => (
            <span
              key={b.label}
              className={`rounded-sm px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${b.cls}`}
            >
              {b.label}
            </span>
          ))}
        </div>
        <span className="absolute right-3 top-3 rounded-sm bg-pine-950/70 px-2 py-0.5 font-mono text-[11px] text-bone-100">
          {product.sku}
        </span>
        {product.status === "on_order" && (
          <span className="absolute bottom-3 left-3 rounded-sm bg-bone-50/95 px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-clay-500">
            {t("on_order")} · 25–30 {t("stock_pcs") === "dona" ? "kun" : "дней"}
          </span>
        )}
        {/* Tez qo'shish tugmasi */}
        <button
          type="button"
          onClick={quickAdd}
          aria-label={t("quick_add")}
          title={t("add_to_cart")}
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-md border border-pine-900 bg-amber-400 text-pine-950 shadow-hard-sm transition-all duration-300 hover:bg-amber-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          <IconPlus className="h-5 w-5" />
        </button>
      </div>

      <div className={`flex flex-1 flex-col gap-1.5 p-4 ${compact ? "" : "p-5"}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-pine-600">
            {product.material}
          </span>
          <span className="font-mono text-[11px] text-ink-500">{product.dimensions}</span>
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-ink-900 transition-colors group-hover:text-pine-700">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="font-mono text-xs text-ink-500 line-through">
                {fmtPrice(product.oldPrice)}
              </span>
            )}
            <span className="font-mono text-base font-bold text-pine-900">
              {fmtPrice(product.price)}
            </span>
          </div>
          <span
            className={`flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide ${
              product.status === "in_stock" ? "text-pine-600" : "text-clay-500"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                product.status === "in_stock" ? "bg-pine-600" : "bg-clay-500"
              }`}
            />
            {product.status === "in_stock" ? `${t("in_stock")} · ${product.stock}` : t("on_order")}
          </span>
        </div>
        <span className="sr-only">
          <IconBasket className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
