import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { SOCIAL, externalLinkProps } from "../data/site";
import { fmtPrice, getCategories } from "../lib/api";
import { useCart } from "../lib/cart";
import { useI18n, type Lang } from "../lib/i18n";
import {
  IconBasket,
  IconCheck,
  IconClock,
  IconFacebook,
  IconInstagram,
  IconMenu,
  IconMinus,
  IconPhone,
  IconPin,
  IconPlus,
  IconSearch,
  IconTelegram,
  IconTrash,
  IconX,
  LogoMark,
} from "./icons";

const PHONE = "+998 90 123 45 67";

/* ---------------------------------- Header ---------------------------------- */
export function Header() {
  const { t, lang, setLang } = useI18n();
  const { count, setDrawerOpen, bump } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/catalog?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `link-underline font-display text-[15px] font-semibold transition-colors ${
      isActive ? "text-amber-600" : "text-bone-100 hover:text-amber-300"
    }`;

  return (
    <header className="sticky top-0 z-40">
      {/* Yuqori lenta */}
      <div className="grain-dark border-b border-pine-700/60 bg-pine-950 text-bone-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 font-mono text-[11px] sm:px-6">
          <span className="hidden items-center gap-1.5 sm:flex">
            <IconClock className="h-3.5 w-3.5 text-amber-400" /> {t("hours")}
          </span>
          <span className="flex items-center gap-1.5">
            <IconPin className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Toshkent, Chilonzor-9</span>
            <span className="md:hidden">Toshkent</span>
          </span>
          <div className="flex items-center gap-4">
            <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="hidden items-center gap-1.5 hover:text-amber-300 sm:flex">
              <IconPhone className="h-3.5 w-3.5" /> {PHONE}
            </a>
            <a
              {...externalLinkProps(SOCIAL.telegram.href)}
              aria-label="Telegram"
              className="text-amber-400 transition-transform hover:scale-110"
            >
              <IconTelegram className="h-4 w-4" />
            </a>
            <div className="flex items-center gap-1 rounded-sm border border-pine-700 p-0.5">
              {(["uz", "ru"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`rounded-[3px] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase transition-colors ${
                    lang === l ? "bg-amber-400 text-pine-950" : "text-pine-200 hover:text-amber-300"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Asosiy panel */}
      <div
        className={`grain-dark border-b transition-all duration-300 ${
          scrolled
            ? "border-pine-700 bg-pine-900/97 shadow-[0_10px_30px_-18px_rgba(14,21,17,0.9)]"
            : "border-pine-800 bg-pine-900"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="group flex items-center gap-3">
            <LogoMark className="h-11 w-11 transition-transform duration-300 group-hover:rotate-6" />
            <span className="leading-none">
              <span className="block font-display text-xl font-bold tracking-tight text-bone-50">
                USTAXONA
              </span>
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.28em] text-amber-400">
                mebel ustaxonasi
              </span>
            </span>
          </Link>

          <nav className="ml-8 hidden items-center gap-6 lg:flex">
            <NavLink to="/" end className={navCls}>
              {t("nav_home")}
            </NavLink>
            <NavLink to="/catalog" className={navCls}>
              {t("nav_catalog")}
            </NavLink>
            <NavLink to="/contact" className={navCls}>
              {t("nav_contact")}
            </NavLink>
          </nav>

          <form onSubmit={submitSearch} className="ml-auto hidden flex-1 items-center md:flex md:max-w-xs">
            <div className="flex w-full items-center rounded-md border border-pine-700 bg-pine-950/60 px-3 transition-colors focus-within:border-amber-400">
              <IconSearch className="h-4 w-4 shrink-0 text-pine-300" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search_ph")}
                className="w-full bg-transparent px-2 py-2 text-sm text-bone-100 placeholder:text-pine-300/70 focus:outline-none"
              />
            </div>
          </form>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="relative flex items-center gap-2 rounded-md border border-pine-700 bg-pine-950/60 px-3.5 py-2.5 font-display text-sm font-semibold text-bone-100 transition-all hover:border-amber-400 hover:text-amber-300"
            aria-label={t("nav_cart")}
          >
            <IconBasket className="h-5 w-5" />
            <span className="hidden sm:inline">{t("nav_cart")}</span>
            {count > 0 && (
              <span
                key={bump}
                className="badge-pop absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 font-mono text-[11px] font-bold text-pine-950"
              >
                {count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md border border-pine-700 p-2 text-bone-100 lg:hidden"
            aria-label="Menyu"
          >
            {menuOpen ? <IconX className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobil menyu */}
        {menuOpen && (
          <div className="border-t border-pine-800 bg-pine-950 px-4 py-4 lg:hidden">
            <form onSubmit={submitSearch} className="mb-4 flex items-center rounded-md border border-pine-700 px-3">
              <IconSearch className="h-4 w-4 text-pine-300" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search_ph")}
                className="w-full bg-transparent px-2 py-2 text-sm text-bone-100 placeholder:text-pine-300/70 focus:outline-none"
              />
            </form>
            <nav className="flex flex-col gap-1">
              {[
                { to: "/", label: t("nav_home") },
                { to: "/catalog", label: t("nav_catalog") },
                { to: "/contact", label: t("nav_contact") },
              ].map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2.5 font-display text-base font-semibold ${
                      isActive ? "bg-pine-800 text-amber-300" : "text-bone-100 hover:bg-pine-800/60"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <a
              href={`tel:${PHONE.replace(/\s/g, "")}`}
              className="mt-3 flex items-center gap-2 px-3 font-mono text-sm text-amber-400"
            >
              <IconPhone className="h-4 w-4" /> {PHONE}
            </a>
          </div>
        )}
      </div>
    </header>
  );
}

/* ---------------------------------- Footer ---------------------------------- */
export function Footer() {
  const { t } = useI18n();
  const parents = getCategories().filter((c) => c.parent === null);
  return (
    <footer className="grain-dark border-t border-pine-800 bg-pine-950 text-bone-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_0.8fr_1.1fr]">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <LogoMark className="h-10 w-10" />
            <span className="font-display text-lg font-bold tracking-tight">USTAXONA</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-pine-200">{t("footer_about")}</p>
          <div className="mt-5 flex gap-2.5">
            {[
              { href: SOCIAL.telegram.href, icon: <IconTelegram className="h-4.5 w-4.5" />, label: "Telegram" },
              { href: SOCIAL.facebook.href, icon: <IconFacebook className="h-4.5 w-4.5" />, label: "Facebook" },
              { href: SOCIAL.instagram.href, icon: <IconInstagram className="h-4.5 w-4.5" />, label: "Instagram" },
            ].map((s) => (
              <a
                key={s.label}
                {...externalLinkProps(s.href)}
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-pine-700 text-pine-200 transition-all hover:-translate-y-0.5 hover:border-amber-400 hover:text-amber-400"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-[0.22em] text-amber-400">
            {t("footer_cats")}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {parents.map((c) => (
              <li key={c.slug}>
                <Link to={`/catalog/${c.slug}`} className="link-underline text-pine-200 hover:text-bone-50">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-[0.22em] text-amber-400">
            {t("footer_pages")}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { to: "/catalog", label: t("nav_catalog") },
              { to: "/cart", label: t("nav_cart") },
              { to: "/checkout", label: t("checkout_title") },
              { to: "/contact", label: t("nav_contact") },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="link-underline text-pine-200 hover:text-bone-50">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-[0.22em] text-amber-400">
            {t("footer_contact")}
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-pine-200">
            <li className="flex items-start gap-2.5">
              <IconPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              {t("footer_address")}
            </li>
            <li className="flex items-center gap-2.5">
              <IconPhone className="h-4 w-4 shrink-0 text-amber-400" />
              <a href="tel:+998901234567" className="font-mono hover:text-amber-300">
                {PHONE}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <IconClock className="h-4 w-4 shrink-0 text-amber-400" />
              {t("hours")}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-pine-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 font-mono text-[11px] text-pine-300 sm:flex-row sm:px-6">
          <span>© 2026 Ustaxona. {t("footer_rights")}.</span>
          <span>
            {t("footer_dev")}:{" "}
            <a
              href="https://ulugbekdev.uz"
              target="_blank"
              rel="noopener"
              className="text-bone-100 hover:text-amber-300"
            >
              Ulug'bek · ulugbekdev.uz
            </a>
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
            {t("footer_made")}
          </span>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------- Cart drawer -------------------------------- */
export function CartDrawer() {
  const { t } = useI18n();
  const { items, drawerOpen, setDrawerOpen, setQty, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className={`fixed inset-0 z-50 ${drawerOpen ? "" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
      <div
        onClick={() => setDrawerOpen(false)}
        className={`absolute inset-0 bg-pine-950/60 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-pine-800 bg-bone-50 transition-transform duration-400 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink-900/10 px-5 py-4">
          <h2 className="font-display text-lg font-bold">
            {t("nav_cart")}
            {items.length > 0 && (
              <span className="ml-2 font-mono text-sm font-medium text-ink-500">
                ({items.length})
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="rounded-md p-2 text-ink-700 transition-colors hover:bg-bone-200"
            aria-label="Yopish"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <IconBasket className="h-14 w-14 text-bone-300" />
              <p className="mt-4 font-display font-semibold text-ink-700">{t("cart_empty_t")}</p>
              <p className="mt-1 text-sm text-ink-500">{t("cart_empty_d")}</p>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate("/catalog");
                }}
                className="mt-6 rounded-md border border-pine-900 bg-amber-400 px-5 py-2.5 font-display text-sm font-bold text-pine-950 shadow-hard-sm transition-all hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {t("cta_catalog")}
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={i.key} className="flex gap-3 rounded-lg border border-ink-900/10 bg-bone-100/60 p-3">
                  <Link to={`/product/${i.slug}`} onClick={() => setDrawerOpen(false)} className="shrink-0">
                    <img src={i.image} alt={i.name} className="h-20 w-24 rounded-md object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/product/${i.slug}`}
                        onClick={() => setDrawerOpen(false)}
                        className="truncate font-display text-sm font-semibold hover:text-pine-700"
                      >
                        {i.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(i.key)}
                        className="text-ink-500 transition-colors hover:text-clay-500"
                        aria-label="O'chirish"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </div>
                    {i.variant && (
                      <span className="mt-0.5 font-mono text-[11px] text-ink-500">{i.variant}</span>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-md border border-ink-900/15">
                        <button
                          type="button"
                          onClick={() => setQty(i.key, i.qty - 1)}
                          className="p-1.5 text-ink-700 hover:text-pine-700"
                          aria-label="-"
                        >
                          <IconMinus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-semibold">{i.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(i.key, i.qty + 1)}
                          className="p-1.5 text-ink-700 hover:text-pine-700"
                          aria-label="+"
                        >
                          <IconPlus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-mono text-sm font-bold text-pine-900">
                        {fmtPrice(i.price * i.qty)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-ink-900/10 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold text-ink-700">{t("subtotal")}</span>
              <span className="font-mono text-lg font-bold text-pine-900">{fmtPrice(subtotal)}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate("/cart");
                }}
                className="rounded-md border border-pine-900 px-4 py-3 font-display text-sm font-bold text-pine-900 transition-all hover:bg-pine-900 hover:text-bone-50"
              >
                {t("nav_cart")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate("/checkout");
                }}
                className="rounded-md border border-pine-900 bg-amber-400 px-4 py-3 font-display text-sm font-bold text-pine-950 shadow-hard-sm transition-all hover:-translate-y-0.5 hover:bg-amber-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {t("to_checkout")}
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

/* ---------------------------------- Toast ---------------------------------- */
export function ToastHost() {
  const { toastMsg } = useCart();
  return (
    <div
      className={`pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 transition-all duration-300 ${
        toastMsg ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {toastMsg && (
        <div className="flex items-center gap-2.5 rounded-md border border-pine-900 bg-pine-900 px-4 py-3 text-bone-50 shadow-hard-amber">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-pine-950">
            <IconCheck className="h-3.5 w-3.5" />
          </span>
          <span className="font-display text-sm font-semibold">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
