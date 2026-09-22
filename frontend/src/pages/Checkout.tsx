import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IconArrow, IconCheck } from "../components/icons";
import {
  AVAILABLE_PAYMENT_METHODS,
  ApiError,
  createOrder,
  fmtPrice,
  type PaymentMethod,
} from "../lib/api";
import { useCart } from "../lib/cart";
import { useI18n } from "../lib/i18n";
import { usePageMeta } from "../lib/meta";
import type { TKey } from "../lib/i18n";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: TKey; hint: TKey }[] = [
  { id: "cash", label: "pay_cash", hint: "pay_cash_d" },
  { id: "terminal", label: "pay_terminal", hint: "pay_terminal_d" },
  { id: "payme", label: "pay_payme", hint: "pay_online_d" },
  { id: "click", label: "pay_click", hint: "pay_online_d" },
];

/** Backend bilan bir xil qoida: 9 raqam yoki 998 bilan boshlanadigan 12 raqam. */
const isValidPhone = (value: string): boolean => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 9 || (digits.length === 12 && digits.startsWith("998"));
};

interface Errors {
  name?: string;
  phone?: string;
  address?: string;
}

export default function CheckoutPage() {
  const { t } = useI18n();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  usePageMeta(`${t("checkout_title")} — Ustaxona`);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [placed, setPlaced] = useState<{ number: string } | null>(null);

  const validate = (): boolean => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = t("field_required");
    if (!isValidPhone(phone)) e.phone = t("phone_invalid");
    if (address.trim().length < 5) e.address = t("field_required");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate() || sending) return;
    setSending(true);
    setSubmitError(null);
    try {
      const order = await createOrder({
        customer: { full_name: name.trim(), phone: phone.trim(), address: address.trim() },
        comment: comment.trim(),
        payment_method: payment,
        items: items.map((i) => ({
          product: i.productId,
          variant: i.variantId,
          quantity: i.qty,
        })),
      });
      setPlaced(order);
      clear();
      window.scrollTo({ top: 0 });
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setSending(false);
    }
  };

  /* Muvaffaqiyat ekrani */
  if (placed) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
        <span className="badge-pop flex h-24 w-24 items-center justify-center rounded-full border-2 border-pine-900 bg-amber-400 shadow-hard">
          <IconCheck className="h-11 w-11 text-pine-950" />
        </span>
        <h1 className="mt-8 font-display text-3xl font-bold sm:text-4xl">{t("success_title")}</h1>
        <p className="mt-4 font-mono text-sm uppercase tracking-wider text-ink-500">
          {t("success_sub")}
        </p>
        <p className="mt-1 font-mono text-4xl font-bold tracking-wide text-pine-900">
          {placed.number}
        </p>
        <p className="mt-5 max-w-md leading-relaxed text-ink-500">{t("success_note")}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-md border border-pine-900 bg-amber-400 px-6 py-3 font-display font-bold text-pine-950 shadow-hard-sm transition-all hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            {t("success_btn_home")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/catalog")}
            className="rounded-md border border-pine-900 px-6 py-3 font-display font-bold text-pine-900 transition-all hover:bg-pine-900 hover:text-bone-50"
          >
            {t("success_btn_catalog")}
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">{t("cart_empty_t")}</h1>
        <p className="mt-3 text-ink-500">{t("cart_empty_d")}</p>
        <Link
          to="/catalog"
          className="mt-8 rounded-md border border-pine-900 bg-amber-400 px-6 py-3 font-display font-bold text-pine-950 shadow-hard-sm"
        >
          {t("cta_catalog")}
        </Link>
      </div>
    );
  }

  const field = (err?: string) =>
    `w-full rounded-md border bg-bone-50 px-4 py-3 text-sm transition-colors focus:outline-none ${
      err ? "border-clay-500" : "border-ink-900/15 focus:border-pine-700"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div data-reveal>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t("checkout_title")}
        </h1>
        <p className="mt-3 max-w-xl text-ink-500">{t("checkout_sub")}</p>
      </div>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]" noValidate>
        <div className="space-y-6" data-reveal="left">
          <div>
            <label htmlFor="f-name" className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
              {t("form_name")} *
            </label>
            <input
              id="f-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aziz Karimov"
              className={field(errors.name)}
            />
            {errors.name && <p className="mt-1.5 font-mono text-xs text-clay-500">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="f-phone" className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
              {t("form_phone")} *
            </label>
            <input
              id="f-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className={field(errors.phone)}
            />
            {errors.phone && <p className="mt-1.5 font-mono text-xs text-clay-500">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="f-address" className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
              {t("form_address")} *
            </label>
            <input
              id="f-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Toshkent, Chilonzor-9, 25-uy, 14-xonadon"
              className={field(errors.address)}
            />
            {errors.address && <p className="mt-1.5 font-mono text-xs text-clay-500">{errors.address}</p>}
          </div>
          <div>
            <label htmlFor="f-comment" className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
              {t("form_comment")}
            </label>
            <textarea
              id="f-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("comment_ph")}
              rows={4}
              className={`${field()} resize-none`}
            />
          </div>

          <fieldset>
            <legend className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
              {t("payment_method")}
            </legend>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map((o) => {
                const available = AVAILABLE_PAYMENT_METHODS.includes(o.id);
                const active = payment === o.id;
                return (
                  <label
                    key={o.id}
                    className={`relative flex items-center gap-3 rounded-md border px-4 py-3 transition-colors ${
                      !available
                        ? "cursor-not-allowed border-ink-900/10 opacity-55"
                        : active
                          ? "cursor-pointer border-pine-900 bg-amber-400/15"
                          : "cursor-pointer border-ink-900/15 hover:border-pine-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={o.id}
                      checked={active}
                      disabled={!available}
                      onChange={() => setPayment(o.id)}
                      className="h-4 w-4 accent-pine-900"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-sm font-bold">{t(o.label)}</span>
                      <span className="block font-mono text-[11px] text-ink-500">{t(o.hint)}</span>
                    </span>
                    {!available && (
                      <span className="rounded-full bg-amber-400 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-pine-950">
                        {t("coming_soon")}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {submitError && (
            <div role="alert" className="rounded-md border border-clay-500/40 bg-clay-500/10 px-4 py-3 text-sm text-clay-500">
              <p className="font-display font-bold">{t("order_failed")}</p>
              <p className="mt-1">{submitError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="group flex w-full items-center justify-center gap-3 rounded-md border border-pine-900 bg-amber-400 px-6 py-4 font-display text-lg font-bold text-pine-950 shadow-hard transition-all hover:-translate-y-0.5 hover:bg-amber-300 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:px-10"
          >
            {sending ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                {t("sending")}
              </>
            ) : (
              <>
                {t("submit_order")}
                <IconArrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
          <p className="rounded-md bg-amber-400/15 px-4 py-3 font-mono text-xs leading-relaxed text-amber-600">
            {t("payment_note")}
          </p>
        </div>

        {/* Tarkib */}
        <aside className="h-fit rounded-lg border border-ink-900/10 bg-bone-50 p-6 lg:sticky lg:top-32" data-reveal="right">
          <h2 className="font-display text-xl font-bold">{t("order_summary")}</h2>
          <ul className="mt-5 space-y-4">
            {items.map((i) => (
              <li key={i.key} className="flex items-center gap-3">
                <img src={i.image} alt="" className="h-14 w-16 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-semibold">{i.name}</p>
                  <p className="font-mono text-xs text-ink-500">
                    × {i.qty}
                    {i.variant && <span className="ml-1.5 text-amber-600">· {i.variant}</span>}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-pine-900">
                  {fmtPrice(i.price * i.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-end justify-between border-t border-dashed border-ink-900/20 pt-5">
            <span className="font-display font-bold">{t("total")}</span>
            <span className="font-mono text-xl font-bold text-pine-900">{fmtPrice(subtotal)}</span>
          </div>
        </aside>
      </form>
    </div>
  );
}
