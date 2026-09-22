import { useState, type FormEvent } from "react";
import {
  IconClock,
  IconPhone,
  IconPin,
  IconTelegram,
} from "../components/icons";
import { IMG, SOCIAL, externalLinkProps } from "../data/site";
import { ApiError, sendContactMessage } from "../lib/api";
import { useCart } from "../lib/cart";
import { useI18n } from "../lib/i18n";
import { usePageMeta } from "../lib/meta";

const PHONE = "+998 90 123 45 67";

export default function ContactPage() {
  const { t } = useI18n();
  const { toast } = useCart();
  usePageMeta(`${t("contact_title")} — Ustaxona`);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || sending) return;
    setSending(true);
    try {
      await sendContactMessage({ name: name.trim(), phone: phone.trim(), message: msg.trim() });
      setName("");
      setPhone("");
      setMsg("");
      toast(t("contact_sent"));
    } catch (err) {
      // Xato bo'lsa maydonlar tozalanmaydi — mijoz qayta yuborishi mumkin.
      toast(err instanceof ApiError ? err.message : String(err));
    } finally {
      setSending(false);
    }
  };

  const rows = [
    { icon: IconPin, title: t("footer_contact"), value: t("footer_address") },
    { icon: IconPhone, title: t("call_now"), value: PHONE, href: `tel:${PHONE.replace(/\s/g, "")}` },
    { icon: IconTelegram, title: t("telegram_us"), value: SOCIAL.telegram.handle, href: SOCIAL.telegram.href },
    { icon: IconClock, title: t("hours"), value: t("hours") },
  ];

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="max-w-2xl" data-reveal>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-amber-600">
            {t("workshop_label")} · Chilonzor-9
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            {t("contact_title")}
          </h1>
          <p className="mt-4 text-lg text-ink-500">{t("contact_sub")}</p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Aloqa ma'lumotlari */}
          <div className="space-y-4" data-reveal="left">
            {rows.map((r) => {
              const inner = (
                <>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-pine-900 bg-amber-400 text-pine-950 transition-transform duration-300 group-hover:-rotate-6">
                    <r.icon className="h-5.5 w-5.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                      {r.title}
                    </span>
                    <span className="mt-0.5 block font-display text-base font-bold text-ink-900">
                      {r.value}
                    </span>
                  </span>
                </>
              );
              return r.href ? (
                <a
                  key={r.title}
                  {...externalLinkProps(r.href)}
                  className="group flex items-center gap-4 rounded-lg border border-ink-900/10 bg-bone-50 p-5 transition-all hover:-translate-y-0.5 hover:border-pine-900/40 hover:shadow-hard-sm"
                >
                  {inner}
                </a>
              ) : (
                <div
                  key={r.title}
                  className="group flex items-center gap-4 rounded-lg border border-ink-900/10 bg-bone-50 p-5"
                >
                  {inner}
                </div>
              );
            })}

            {/* Xarita (uslublashtirilgan) */}
            <div className="relative mt-6 overflow-hidden rounded-lg border border-ink-900/10">
              <svg viewBox="0 0 400 200" className="w-full bg-pine-100">
                <g stroke="var(--color-pine-300)" strokeWidth="1">
                  {Array.from({ length: 13 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 33} y1="0" x2={i * 33} y2="200" />
                  ))}
                  {Array.from({ length: 7 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 33} x2="400" y2={i * 33} />
                  ))}
                </g>
                <path d="M0 150 C 80 140, 140 170, 210 150 S 340 120, 400 140" fill="none" stroke="var(--color-pine-500)" strokeWidth="7" opacity="0.5" />
                <path d="M60 0 L 140 200" stroke="var(--color-bone-300)" strokeWidth="10" opacity="0.7" />
                <circle cx="210" cy="92" r="26" fill="var(--color-amber-400)" opacity="0.25" />
                <circle cx="210" cy="92" r="10" fill="var(--color-amber-500)" stroke="var(--color-pine-950)" strokeWidth="2.5" />
                <path d="M210 78 c-7 0 -12 5 -12 11 c0 8 12 20 12 20 s12 -12 12 -20 c0 -6 -5 -11 -12 -11Z" fill="var(--color-pine-900)" />
                <circle cx="210" cy="89" r="3.4" fill="var(--color-amber-400)" />
              </svg>
              <p className="border-t border-ink-900/10 bg-bone-50 px-4 py-3 font-mono text-xs text-ink-500">
                {t("map_hint")}
              </p>
            </div>
          </div>

          {/* Forma + ustaxona rasmi */}
          <div data-reveal="right">
            <form onSubmit={submit} className="rounded-lg border border-ink-900/10 bg-bone-50 p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-name" className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
                    {t("contact_name")} *
                  </label>
                  <input
                    id="c-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-md border border-ink-900/15 bg-bone-100/50 px-4 py-3 text-sm transition-colors focus:border-pine-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="c-phone" className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
                    {t("form_phone")} *
                  </label>
                  <input
                    id="c-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+998 90 123 45 67"
                    className="w-full rounded-md border border-ink-900/15 bg-bone-100/50 px-4 py-3 text-sm transition-colors focus:border-pine-700 focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="c-msg" className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
                  {t("contact_msg")}
                </label>
                <textarea
                  id="c-msg"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  rows={5}
                  placeholder="240×60 sm oshxona stoli kerak, yong'oq daraxtidan…"
                  className="w-full resize-none rounded-md border border-ink-900/15 bg-bone-100/50 px-4 py-3 text-sm transition-colors focus:border-pine-700 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="mt-6 w-full rounded-md border border-pine-900 bg-amber-400 px-6 py-3.5 font-display text-base font-bold text-pine-950 shadow-hard transition-all hover:-translate-y-0.5 hover:bg-amber-300 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-70"
              >
                {sending ? t("sending") : t("contact_send")}
              </button>
            </form>

            <figure className="group relative mt-6 overflow-hidden rounded-lg border border-ink-900/10">
              <img
                src={IMG.workshop}
                alt="Ustaxona ichida ish jarayoni"
                loading="lazy"
                className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-[1.05] sm:h-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pine-950/80 via-transparent to-transparent" />
              <figcaption className="absolute bottom-4 left-5 right-5">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-300">
                  {t("workshop_label")}
                </span>
                <span className="block font-display text-lg font-bold text-bone-50">
                  Chilonzor-9, 14-uy
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  );
}
