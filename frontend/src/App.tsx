import { useEffect, type ReactNode } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { CartDrawer, Footer, Header, ToastHost } from "./components/chrome";
import { CartProvider } from "./lib/cart";
import { LangProvider, useI18n } from "./lib/i18n";
import Home from "./pages/Home";
import CartPage from "./pages/Cart";
import CategoryPage from "./pages/Category";
import CheckoutPage from "./pages/Checkout";
import ContactPage from "./pages/Contact";
import ProductPage from "./pages/Product";

function NotFound() {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-amber-600">404</p>
      <h1 className="mt-3 font-display text-4xl font-bold">{t("not_found_t")}</h1>
      <p className="mt-3 text-ink-500">{t("not_found_d")}</p>
      <Link
        to="/"
        className="mt-8 rounded-md border border-pine-900 bg-amber-400 px-6 py-3 font-display font-bold text-pine-950 shadow-hard-sm"
      >
        {t("go_home")}
      </Link>
    </div>
  );
}

/** Scroll-reveal kuzatuvchisi + sahifa almashganda tepaga qaytarish. */
function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
    );

    const timer = window.setTimeout(() => {
      document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => {
        if (reduce) el.classList.add("in");
        else io.observe(el);
      });
    }, 60);

    return () => {
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, [location.pathname, location.search]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="noise-layer" aria-hidden />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <ToastHost />
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <CartProvider>
        <BrowserRouter>
          <Shell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<CategoryPage />} />
              <Route path="/catalog/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Shell>
        </BrowserRouter>
      </CartProvider>
    </LangProvider>
  );
}
