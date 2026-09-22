import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import {
  IconArrow,
  IconLeaf,
  IconPhone,
  IconRings,
  IconRuler,
  IconShield,
  IconStar,
} from "../components/icons";
import { IMG } from "../data/site";
import type { Product } from "../lib/types";
import { fetchFeatured, fetchNew, fmtPrice, getCategories, productCountFor } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { usePageMeta } from "../lib/meta";

const MARQUEE = [
  "Yong'oq", "Eman", "Qayin", "Buk", "Yasan",
  "Tabiiy teri", "Ratan", "Zig'ir mato", "Jez detallar",
];

const STEPS = [
  { t: "step1_t", d: "step1_d" },
  { t: "step2_t", d: "step2_d" },
  { t: "step3_t", d: "step3_d" },
  { t: "step4_t", d: "step4_d" },
] as const;

const WHY = [
  { icon: IconRings, t: "why1_t", d: "why1_d" },
  { icon: IconRuler, t: "why3_t", d: "why3_d" },
  { icon: IconLeaf, t: "why2_t", d: "why2_d" },
  { icon: IconShield, t: "why4_t", d: "why4_d" },
] as const;

const REVIEWS_UZ = [
  {
    name: "Dilnoza, Chilonzor",
    text: "«Archa» divaniga bir yil bo'ldi — birorta joyi g'ijirlamaydi. Mehmonlar hammasi qayerdan olganimizni so'raydi.",
    prod: "«Archa» divani",
  },
  {
    name: "Bekzod, Mirzo Ulug'bek",
    text: "Usta o'zi kelib o'lchadi, eskiz chizdi, roppa-rosa 25 kunda keltirdi. Burchak divani xonaga millimetrgacha tushdi.",
    prod: "«Yashil» burchak divani",
  },
  {
    name: "Gulnora, Yunusobod",
    text: "Oshxona stolini bobomnikiga o'xshatib yasab berishdi — xuddi o'sha yog'och hidi. Rahmat ustaxona jamoasi!",
    prod: "«Sahro» stoli",
  },
];

const REVIEWS_RU = [
  {
    name: "Дилноза, Чиланзар",
    text: "Дивану «Арча» уже год — ни одного скрипа. Все гости спрашивают, где мы его взяли.",
    prod: "Диван «Арча»",
  },
  {
    name: "Бекзод, Мирзо Улугбек",
    text: "Мастер сам приехал, замерил, нарисовал эскиз и привёз ровно через 25 дней. Угловой диван встал миллиметр в миллиметр.",
    prod: "Угловой диван «Яшил»",
  },
  {
    name: "Гулнора, Юнусобод",
    text: "Сделали стол как у моего дедушки — тот самый запах дерева. Спасибо мастерской!",
    prod: "Стол «Сахро»",
  },
];

/** Aylanuvchi usta muhri */
function Stamp() {
  return (
    <div className="spin-slow relative h-28 w-28 sm:h-36 sm:w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <defs>
          <path id="stampCircle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <circle cx="60" cy="60" r="58" fill="var(--color-pine-950)" stroke="var(--color-amber-400)" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="33" fill="none" stroke="var(--color-amber-400)" strokeWidth="1" strokeDasharray="3 4" />
        <text fill="var(--color-amber-300)" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" letterSpacing="2.5">
          <textPath href="#stampCircle">QO'LDA YASALGAN • TOSHKENT USTAXONASI • 2009 •</textPath>
        </text>
        <path d="M52 46v14a8 8 0 0 0 16 0V46" fill="none" stroke="var(--color-amber-400)" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function Home() {
  const { t, lang } = useI18n();
  const [featured, setFeatured] = useState<Product[] | null>(null);
  const [fresh, setFresh] = useState<Product[] | null>(null);
  usePageMeta(
    "Ustaxona — Qo'lda yasalgan mebel | Katalog va buyurtma",
    "Toshkentdagi mebel ustaxonasi: divan, kreslo, stol, karavot va shkaflar. Tabiiy yog'och, qo'l mehnati, 2 yil kafolat."
  );

  useEffect(() => {
    let on = true;
    fetchFeatured(8).then((d) => on && setFeatured(d));
    fetchNew(4).then((d) => on && setFresh(d));
    return () => {
      on = false;
    };
  }, []);

  const reviews = lang === "ru" ? REVIEWS_RU : REVIEWS_UZ;
  // Mosaic 8 katak uchun chizilgan — mahsuloti bor birinchi 8 kategoriya.
  const mosaic = getCategories()
    .filter((c) => c.productsCount > 0)
    .slice(0, 8);

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="grain-dark relative overflow-hidden bg-pine-900 text-bone-100">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-pine-700/30 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-24 lg:pt-16">
          <div className="relative z-10">
            <p
              className="mask-line font-mono text-xs uppercase tracking-[0.24em] text-amber-400"
              data-reveal
            >
              <span style={{ animationDelay: "0.05s" }}>{t("hero_kicker")}</span>
            </p>
            <h1 className="mt-5 font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight text-bone-50 sm:text-6xl lg:text-[4.2rem]">
              <span className="mask-line">
                <span style={{ animationDelay: "0.15s" }}>{t("hero_l1")}</span>
              </span>
              <span className="mask-line text-amber-400">
                <span style={{ animationDelay: "0.3s" }}>{t("hero_l2")}</span>
              </span>
            </h1>
            <p className="mask-line mt-6 max-w-xl text-base leading-relaxed text-pine-200 sm:text-lg">
              <span style={{ animationDelay: "0.45s" }}>{t("hero_sub")}</span>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4" data-reveal>
              <Link
                to="/catalog"
                className="group flex items-center gap-2.5 rounded-md border border-pine-950 bg-amber-400 px-6 py-3.5 font-display text-base font-bold text-pine-950 shadow-hard transition-all hover:-translate-y-0.5 hover:bg-amber-300 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                {t("cta_catalog")}
                <IconArrow className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="flex items-center gap-2.5 rounded-md border border-pine-600 px-6 py-3.5 font-display text-base font-semibold text-bone-100 transition-all hover:border-amber-400 hover:text-amber-300"
              >
                <IconPhone className="h-4.5 w-4.5" />
                {t("cta_order")}
              </Link>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-pine-700/70 pt-7" data-reveal>
              {[
                { n: "17", l: t("stat_years") },
                { n: "1200+", l: t("stat_orders") },
                { n: "2", l: t("stat_warranty") },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="sr-only">{s.l}</dt>
                  <dd className="font-display text-4xl font-bold text-amber-400">{s.n}</dd>
                  <dd className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-pine-300">
                    {s.l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative" data-reveal="right">
            <div className="relative overflow-hidden rounded-xl border-2 border-pine-700">
              <img
                src={IMG.hero}
                alt="Ustaxonada qo'lda yasalgan divan"
                className="kenburns h-[22rem] w-full object-cover sm:h-[28rem] lg:h-[32rem]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pine-950/55 via-transparent to-pine-950/10" />
              {/* Suzuvchi mahsulot kartochkasi */}
              <Link
                to="/product/yashil-burchak-divani"
                className="group absolute bottom-5 right-5 flex items-center gap-3 rounded-lg border border-pine-900 bg-bone-50 p-3 pr-5 shadow-hard transition-transform hover:-translate-y-1"
              >
                <img
                  src={IMG.hero}
                  alt=""
                  className="h-12 w-12 rounded-md object-cover"
                />
                <span>
                  <span className="block font-display text-sm font-bold text-ink-900">
                    «Yashil» divani
                  </span>
                  <span className="block font-mono text-xs font-semibold text-pine-700">
                    {fmtPrice(18_900_000)}
                  </span>
                </span>
                <IconArrow className="h-4 w-4 text-pine-600 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="absolute -left-5 -top-7 hidden sm:block lg:-left-10">
              <Stamp />
            </div>
          </div>
        </div>

        {/* Materiallar lentasi */}
        <div className="marquee relative border-t border-pine-700 bg-pine-950 py-3.5">
          <div className="marquee-track">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                {MARQUEE.map((m) => (
                  <span key={`${dup}-${m}`} className="flex items-center">
                    <span className="px-6 font-mono text-xs uppercase tracking-[0.28em] text-pine-300">
                      {m}
                    </span>
                    <span className="h-1.5 w-1.5 rotate-45 bg-amber-400" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= KATEGORIYALAR ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-amber-600">
              {t("materials_label")} · {t("cats_title")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t("cats_title")}
            </h2>
            <p className="mt-2 max-w-lg text-ink-500">{t("cats_sub")}</p>
          </div>
          <Link
            to="/catalog"
            className="link-underline flex items-center gap-2 font-display font-semibold text-pine-700"
          >
            {t("view_all")} <IconArrow className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {mosaic.map((c, idx) => {
            const big = idx === 0;
            const wide = idx === 3;
            return (
              <Link
                key={c.slug}
                to={`/catalog/${c.slug}`}
                data-reveal="zoom"
                style={{ transitionDelay: `${idx * 60}ms` }}
                className={`group relative overflow-hidden rounded-lg border border-ink-900/10 ${
                  big ? "col-span-2 row-span-2 min-h-[20rem] sm:min-h-[26rem]" : "min-h-[9.5rem] sm:min-h-[12rem]"
                } ${wide ? "col-span-2" : ""}`}
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pine-950/85 via-pine-950/25 to-transparent transition-opacity group-hover:from-pine-950/95" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 sm:p-5">
                  <div>
                    <h3 className={`font-display font-bold text-bone-50 ${big ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"}`}>
                      {c.name}
                    </h3>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-amber-300">
                      {productCountFor(c.slug)} {t("products_label")}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-bone-100/30 bg-bone-50/10 text-bone-50 transition-all group-hover:bg-amber-400 group-hover:text-pine-950">
                    <IconArrow className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= TAVSIYA ETILGAN ================= */}
      <section className="border-y border-bone-300/60 bg-bone-200/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-amber-600">
                ★ {t("featured_title")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {t("featured_title")}
              </h2>
              <p className="mt-2 max-w-lg text-ink-500">{t("featured_sub")}</p>
            </div>
            <Link
              to="/catalog?sort=-created"
              className="link-underline flex items-center gap-2 font-display font-semibold text-pine-700"
            >
              {t("view_all")} <IconArrow className="h-4 w-4" />
            </Link>
          </div>

          {featured === null ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
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
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
              {featured.map((p, i) => (
                <div key={p.slug} data-reveal style={{ transitionDelay: `${(i % 4) * 80}ms` }} className={i === 0 ? "sm:col-span-2 lg:row-span-1" : ""}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= JARAYON ================= */}
      <section className="grain-dark bg-pine-900 text-bone-100">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-24">
          <div data-reveal="left">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-amber-400">
              01 → 04
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-bone-50 sm:text-4xl">
              {t("process_title")}
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-pine-200">{t("process_sub")}</p>
            <div className="relative mt-10 hidden overflow-hidden rounded-xl border-2 border-pine-700 lg:block">
              <img src={IMG.workshop} alt="Ustaxonada ish jarayoni" loading="lazy" className="kenburns h-72 w-full object-cover" />
              <div className="absolute inset-0 bg-pine-950/20" />
            </div>
          </div>
          <ol className="relative space-y-8">
            <span className="absolute bottom-4 left-[1.35rem] top-4 hidden w-px bg-pine-700 sm:block" />
            {STEPS.map((s, i) => (
              <li
                key={s.t}
                data-reveal
                style={{ transitionDelay: `${i * 90}ms` }}
                className="relative flex gap-5 sm:gap-7"
              >
                <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-amber-400 bg-pine-950 font-mono text-sm font-bold text-amber-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="border-b border-pine-800 pb-8">
                  <h3 className="font-display text-xl font-bold text-bone-50">{t(s.t)}</h3>
                  <p className="mt-2 max-w-md leading-relaxed text-pine-200">{t(s.d)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= NEGA BIZ ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="max-w-2xl" data-reveal>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-amber-600">
            {t("why_title")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t("why_title")}
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {WHY.map((w, i) => {
            const Icon = w.icon;
            return (
              <div
                key={w.t}
                data-reveal={i % 2 === 0 ? "left" : "right"}
                style={{ transitionDelay: `${i * 70}ms` }}
                className={`group flex gap-5 rounded-lg border border-ink-900/10 bg-bone-50 p-6 transition-all hover:-translate-y-1 hover:border-pine-900/40 hover:shadow-hard sm:p-7 ${
                  i % 3 === 0 ? "sm:col-span-2 sm:flex-row sm:items-start" : ""
                }`}
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-pine-900 bg-amber-400 text-pine-950 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                  <Icon className="h-7 w-7" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold">{t(w.t)}</h3>
                  <p className="mt-2 leading-relaxed text-ink-500">{t(w.d)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= YANGI KELGANLAR ================= */}
      {fresh && fresh.length > 0 && (
        <section className="border-t border-bone-300/60 bg-bone-200/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
              <h2 className="font-display text-3xl font-bold tracking-tight">{t("new_title")}</h2>
              <Link to="/catalog?sort=-created" className="link-underline flex items-center gap-2 font-display font-semibold text-pine-700">
                {t("view_all")} <IconArrow className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
              {fresh.map((p, i) => (
                <div key={p.slug} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= MIJOZLAR SO'ZI ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="text-center" data-reveal>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-amber-600">
            ★★★★★ · 4.9
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t("reviews_title")}
          </h2>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {reviews.map((r, i) => (
            <figure
              key={r.name}
              data-reveal
              style={{ transitionDelay: `${i * 100}ms` }}
              className={`relative rounded-lg border border-ink-900/15 bg-bone-50 p-7 shadow-hard-sm transition-transform duration-300 hover:rotate-0 hover:-translate-y-1 ${
                i === 0 ? "md:-rotate-2" : i === 1 ? "md:translate-y-6 md:rotate-1" : "md:rotate-2"
              }`}
            >
              <span className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-2 rounded-sm bg-amber-400/80" />
              <div className="flex gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, s) => (
                  <IconStar key={s} className="h-4 w-4" />
                ))}
              </div>
              <blockquote className="mt-4 leading-relaxed text-ink-700">{r.text}</blockquote>
              <figcaption className="mt-5 border-t border-dashed border-ink-900/15 pt-4">
                <span className="block font-display font-bold">{r.name}</span>
                <span className="font-mono text-xs text-ink-500">{r.prod}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative overflow-hidden bg-amber-400">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "repeating-linear-gradient(94deg, var(--color-pine-950) 0 1px, transparent 1px 14px)" }} />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:py-20">
          <div data-reveal="left">
            <h2 className="font-display text-3xl font-bold tracking-tight text-pine-950 sm:text-5xl">
              {t("cta_band_t")}
            </h2>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-pine-800">{t("cta_band_d")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row" data-reveal="right">
            <Link
              to="/contact"
              className="flex items-center justify-center gap-2.5 rounded-md border border-pine-950 bg-pine-900 px-7 py-4 font-display text-base font-bold text-bone-50 shadow-[6px_6px_0_rgba(25,20,16,0.35)] transition-all hover:-translate-y-0.5 hover:bg-pine-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              <IconPhone className="h-5 w-5" /> {t("cta_band_btn")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
