import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { IconChevron, IconFilter, IconSearch, IconX } from "../components/icons";
import { MATERIALS } from "../data/site";
import type { Product } from "../lib/types";
import { categoryBySlug, fetchProducts, getCategories, type Paged } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { usePageMeta } from "../lib/meta";

export default function CategoryPage() {
  const { slug } = useParams();
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<Paged<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const q = params.get("q") ?? "";
  const mats = (params.get("mats") ?? "").split(",").filter(Boolean);
  const priceMin = params.get("min");
  const priceMax = params.get("max");
  const inStock = params.get("stock") === "1";
  const sort = params.get("sort") ?? "-created";
  const page = Number(params.get("page") ?? 1);

  const cat = slug ? categoryBySlug(slug) : undefined;
  usePageMeta(
    `${cat?.name ?? t("nav_catalog")} — Ustaxona`,
    "Mebel katalogi: filtr, saralash va qidiruv bilan."
  );

  const setParam = useCallback(
    (key: string, value: string | null, resetPage = true) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === null || value === "") next.delete(key);
          else next.set(key, value);
          if (resetPage && key !== "page") next.delete("page");
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  useEffect(() => {
    let on = true;
    setLoading(true);
    fetchProducts({
      category: slug ?? null,
      q: q || null,
      materials: mats.length ? mats : undefined,
      priceMin: priceMin ? Number(priceMin) : null,
      priceMax: priceMax ? Number(priceMax) : null,
      inStockOnly: inStock,
      sort,
      page,
    }).then((d) => {
      if (on) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      on = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, q, params.get("mats"), priceMin, priceMax, inStock, sort, page]);

  const hasActiveFilters = !!(q || mats.length || priceMin || priceMax || inStock || slug);

  const clearAll = () => setParams(new URLSearchParams(), { replace: true });

  const parents = getCategories().filter((c) => c.parent === null);

  const filterPanel = (
    <div className="space-y-7">
      {/* Kategoriya daraxti */}
      <div>
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
          {t("filters")}
        </h3>
        <ul className="mt-3 space-y-1">
          <li>
            <Link
              to="/catalog"
              onClick={() => setParams(new URLSearchParams(), { replace: true })}
              className={`block rounded-md px-3 py-2 font-display text-sm font-semibold transition-colors ${
                !slug ? "bg-pine-900 text-amber-300" : "text-ink-700 hover:bg-bone-200"
              }`}
            >
              {t("all_categories")}
            </Link>
          </li>
          {parents.map((p) => {
            const children = getCategories().filter((c) => c.parent === p.slug);
            return (
              <li key={p.slug}>
                <Link
                  to={`/catalog/${p.slug}`}
                  className={`block rounded-md px-3 py-2 font-display text-sm font-semibold transition-colors ${
                    slug === p.slug
                      ? "bg-pine-900 text-amber-300"
                      : "text-ink-700 hover:bg-bone-200"
                  }`}
                >
                  {p.name}
                </Link>
                {children.length > 0 && (
                  <ul className="ml-3 mt-1 space-y-0.5 border-l border-bone-300 pl-3">
                    {children.map((c) => (
                      <li key={c.slug}>
                        <Link
                          to={`/catalog/${c.slug}`}
                          className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                            slug === c.slug
                              ? "bg-amber-400/30 font-semibold text-amber-600"
                              : "text-ink-500 hover:bg-bone-200 hover:text-ink-900"
                          }`}
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Narx */}
      <div>
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
          {t("price_range")}
        </h3>
        <div className="mt-3 flex items-center gap-2">
          <input
            key={`min-${priceMin ?? ""}`}
            type="number"
            min={0}
            defaultValue={priceMin ?? ""}
            placeholder={t("from")}
            onBlur={(e) => setParam("min", e.target.value || null)}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="w-full rounded-md border border-ink-900/15 bg-bone-50 px-3 py-2 font-mono text-sm focus:border-pine-700 focus:outline-none"
          />
          <span className="text-ink-500">—</span>
          <input
            key={`max-${priceMax ?? ""}`}
            type="number"
            min={0}
            defaultValue={priceMax ?? ""}
            placeholder={t("to")}
            onBlur={(e) => setParam("max", e.target.value || null)}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="w-full rounded-md border border-ink-900/15 bg-bone-50 px-3 py-2 font-mono text-sm focus:border-pine-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Material */}
      <div>
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
          {t("material_label")}
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {MATERIALS.map((m) => {
            const active = mats.includes(m);
            const toggle = () => {
              const next = active ? mats.filter((x) => x !== m) : [...mats, m];
              setParam("mats", next.length ? next.join(",") : null);
            };
            return (
              <button
                key={m}
                type="button"
                onClick={toggle}
                className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-all ${
                  active
                    ? "border-pine-900 bg-pine-900 text-amber-300 shadow-hard-sm"
                    : "border-ink-900/15 bg-bone-50 text-ink-700 hover:border-pine-700"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mavjudlik */}
      <label className="flex cursor-pointer items-center gap-3">
        <span
          onClick={() => setParam("stock", inStock ? null : "1")}
          className={`relative h-6 w-11 rounded-full border transition-colors ${
            inStock ? "border-pine-900 bg-pine-900" : "border-ink-900/20 bg-bone-200"
          }`}
        >
          <span
            className={`absolute top-0.5 h-[18px] w-[18px] rounded-full transition-all ${
              inStock ? "left-[22px] bg-amber-400" : "left-0.5 bg-bone-50"
            }`}
          />
        </span>
        <span className="text-sm font-semibold text-ink-700">{t("only_in_stock")}</span>
      </label>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-ink-900/25 px-4 py-2.5 font-display text-sm font-semibold text-ink-500 transition-colors hover:border-clay-500 hover:text-clay-500"
        >
          <IconX className="h-4 w-4" /> {t("clear_filters")}
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      {/* Non bo'laklari */}
      <nav className="font-mono text-xs text-ink-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-pine-700">{t("home")}</Link>
        <span className="mx-2">/</span>
        <Link to="/catalog" className="hover:text-pine-700">{t("catalog")}</Link>
        {cat && (
          <>
            <span className="mx-2">/</span>
            <span className="text-ink-900">{cat.name}</span>
          </>
        )}
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div data-reveal>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {cat?.name ?? t("all_categories")}
          </h1>
          <p className="mt-2 font-mono text-sm text-ink-500">
            {data ? `${data.count} ${t("results_found")}` : "…"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {q && (
            <span className="flex items-center gap-2 rounded-md border border-amber-500/50 bg-amber-400/20 px-3 py-1.5 font-mono text-xs text-amber-600">
              <IconSearch className="h-3.5 w-3.5" /> «{q}»
              <button type="button" onClick={() => setParam("q", null)} aria-label="Qidiruvni tozalash">
                <IconX className="h-3.5 w-3.5 hover:text-clay-500" />
              </button>
            </span>
          )}
          <label className="flex items-center gap-2">
            <span className="hidden font-mono text-xs uppercase tracking-wider text-ink-500 sm:inline">
              {t("sort_label")}
            </span>
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value === "-created" ? null : e.target.value)}
              className="rounded-md border border-ink-900/15 bg-bone-50 px-3 py-2 font-mono text-xs focus:border-pine-700 focus:outline-none"
            >
              <option value="-created">{t("sort_new")}</option>
              <option value="price">{t("sort_price_asc")}</option>
              <option value="-price">{t("sort_price_desc")}</option>
              <option value="name">{t("sort_name")}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[250px_1fr]">
        {/* Filtrlar */}
        <aside>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="flex w-full items-center justify-between rounded-md border border-ink-900/15 bg-bone-50 px-4 py-3 font-display text-sm font-bold lg:hidden"
          >
            <span className="flex items-center gap-2">
              <IconFilter className="h-4 w-4" /> {t("filters")}
            </span>
            <IconChevron className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <div className={`mt-4 rounded-lg border border-ink-900/10 bg-bone-50 p-5 lg:sticky lg:top-32 lg:mt-0 lg:block ${showFilters ? "block" : "hidden"}`}>
            {filterPanel}
          </div>
        </aside>

        {/* Natijalar */}
        <div>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-ink-900/10 bg-bone-50">
                  <div className="skeleton aspect-[4/3]" />
                  <div className="space-y-2 p-5">
                    <div className="skeleton h-3 w-1/3 rounded" />
                    <div className="skeleton h-5 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.results.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
                {data.results.map((p, i) => (
                  <div key={p.slug} data-reveal style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>

              {/* Sahifalash */}
              {data.pages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Sahifalar">
                  <button
                    type="button"
                    disabled={data.page <= 1}
                    onClick={() => setParam("page", String(data.page - 1), false)}
                    className="rounded-md border border-ink-900/15 bg-bone-50 px-4 py-2 font-mono text-sm transition-all hover:border-pine-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ←
                  </button>
                  {Array.from({ length: data.pages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setParam("page", String(i + 1), false)}
                      className={`h-10 w-10 rounded-md border font-mono text-sm font-semibold transition-all ${
                        data.page === i + 1
                          ? "border-pine-900 bg-pine-900 text-amber-300 shadow-hard-sm"
                          : "border-ink-900/15 bg-bone-50 hover:border-pine-900"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={data.page >= data.pages}
                    onClick={() => setParam("page", String(data.page + 1), false)}
                    className="rounded-md border border-ink-900/15 bg-bone-50 px-4 py-2 font-mono text-sm transition-all hover:border-pine-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    →
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-ink-900/20 bg-bone-50 px-6 py-20 text-center">
              <IconSearch className="h-14 w-14 text-bone-300" />
              <h2 className="mt-5 font-display text-2xl font-bold">{t("empty_title")}</h2>
              <p className="mt-2 max-w-sm text-ink-500">{t("empty_sub")}</p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-7 rounded-md border border-pine-900 bg-amber-400 px-6 py-3 font-display text-sm font-bold text-pine-950 shadow-hard-sm transition-all hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {t("clear_filters")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
