/** Ustaxona uchun qo'lda chizilgan SVG ikonkalar to'plami. */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const IconBasket = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.2 9.2h15.6l-1.5 10a2.2 2.2 0 0 1-2.18 1.8H7.88A2.2 2.2 0 0 1 5.7 19.2l-1.5-10Z" />
    <path d="M8.3 9V7.4a3.7 3.7 0 0 1 7.4 0V9" />
    <path d="M9.6 13.2v3.4M14.4 13.2v3.4" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10.8" cy="10.8" r="6.3" />
    <path d="m15.6 15.6 4.9 4.9" />
  </svg>
);

export const IconPhone = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.1 3.8h3.2l1.6 4-2 1.5a12.4 12.4 0 0 0 6.8 6.8l1.5-2 4 1.6v3.2a1.7 1.7 0 0 1-1.9 1.7A16.9 16.9 0 0 1 3.4 5.7a1.7 1.7 0 0 1 1.7-1.9Z" />
  </svg>
);

export const IconTelegram = (p: P) => (
  <svg {...base(p)}>
    <path d="M21.3 4.1 2.9 11.3c-.8.3-.8 1.4.1 1.7l4.6 1.5 1.8 5.4c.3.8 1.3 1 1.9.4l2.5-2.4 4.5 3.3c.6.5 1.5.1 1.7-.7l2.8-14.7c.2-.9-.6-1.6-1.5-1.3Z" />
    <path d="m7.7 14.4 9.9-8.1-7.6 9.1-.4 4.2" />
  </svg>
);

export const IconRuler = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.8" y="9.2" width="18.4" height="5.6" rx="1" transform="rotate(-45 12 12)" />
    <path d="m9.2 12 1.2 1.2M11.8 9.4l1.2 1.2M14.4 6.8l1.2 1.2" />
  </svg>
);

export const IconSaw = (p: P) => (
  <svg {...base(p)}>
    <path d="m3 14.5 11-11 6.5 6.5-1.4 1.4-1.4-1.4-1.4 1.4 1.4 1.4-1.4 1.4-1.4-1.4-1.4 1.4 1.4 1.4-1.4 1.4L8 13.6 3 18.6V14.5Z" />
    <circle cx="17.6" cy="6.4" r="0.4" fill="currentColor" />
  </svg>
);

export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2.8 19 5.5v5.2c0 4.6-3 8.6-7 10.5-4-1.9-7-5.9-7-10.5V5.5l7-2.7Z" />
    <path d="m8.8 11.8 2.3 2.3 4.2-4.6" />
  </svg>
);

export const IconTruck = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.8 6.4h11.4v10.2H2.8zM14.2 9.5h3.8l3.2 3.3v3.8h-2" />
    <circle cx="7" cy="17.6" r="1.9" />
    <circle cx="16.6" cy="17.6" r="1.9" />
    <path d="M8.9 16.6h5.8M2.8 16.6h2.3" />
  </svg>
);

export const IconLeaf = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 19.2C5 9.4 12 5 20.2 4.4 19.6 12.6 15.2 19.6 5.4 19.6" />
    <path d="M5.4 19.4C8.6 13.8 12.6 10 17.6 7.2" />
  </svg>
);

export const IconRings = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 6.4a5.6 5.6 0 0 1 0 11.2 4 4 0 0 1 0-8 2.6 2.6 0 0 1 0 5.2" />
    <circle cx="12" cy="12" r="0.5" fill="currentColor" />
  </svg>
);

export const IconHammer = (p: P) => (
  <svg {...base(p)}>
    <path d="m13.4 7.6 6.8 6.8-2.3 2.3-6.8-6.8" />
    <path d="M12 4.6 7.2 9.4l-3-1 1-3 4.6-4.8 2.8 1.4L14 3.4l-2 1.2Z" transform="translate(1.5 3) scale(0.92)" />
    <path d="m10.5 10.5-6.9 8.6a1.5 1.5 0 0 0 2.3 1.9l8.2-7.2" />
  </svg>
);

export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21.4s-6.8-6-6.8-11A6.8 6.8 0 0 1 12 3.6a6.8 6.8 0 0 1 6.8 6.8c0 5-6.8 11-6.8 11Z" />
    <circle cx="12" cy="10.3" r="2.4" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 7.2V12l3.2 2" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5.4v13.2M5.4 12h13.2" />
  </svg>
);

export const IconMinus = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.4 12h13.2" />
  </svg>
);

export const IconX = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.5 12.6 5 5L19.5 7" />
  </svg>
);

export const IconArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h15.2M13.6 6.4l5.6 5.6-5.6 5.6" />
  </svg>
);

export const IconChevron = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9.4 6 6 6-6" />
  </svg>
);

export const IconMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 7h14M9.6 7V5.2a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1V7" />
    <path d="M6.6 7 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.4 7" />
    <path d="M10.2 11v5.4M13.8 11v5.4" />
  </svg>
);

export const IconCopy = (p: P) => (
  <svg {...base(p)}>
    <rect x="8.4" y="8.4" width="12" height="12" rx="2" />
    <path d="M15.6 8.4V5.6a2 2 0 0 0-2-2H5.6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.8" />
  </svg>
);

export const IconShare = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="12" r="2.6" />
    <circle cx="17.4" cy="5.6" r="2.6" />
    <circle cx="17.4" cy="18.4" r="2.6" />
    <path d="m8.4 10.7 6.6-3.8M8.4 13.3l6.6 3.8" />
  </svg>
);

export const IconFilter = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

export const IconFacebook = (p: P) => (
  <svg {...base(p)}>
    <path d="M13.6 21v-7h2.6l.5-3h-3.1V8.9c0-.9.3-1.6 1.7-1.6h1.5V4.6c-.3 0-1.2-.1-2.2-.1-2.3 0-3.9 1.4-3.9 4V11H8v3h2.7v7" />
  </svg>
);

export const IconInstagram = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
  </svg>
);

export const IconXSocial = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.8 4.8 14.4 14.4M19.2 4.8 4.8 19.2" strokeWidth="2.1" />
  </svg>
);

export const IconStar = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden {...p}>
    <path d="M12 3.4 14.5 9l6 .6-4.5 4 1.3 5.9L12 16.4l-5.3 3.1L8 13.6l-4.5-4 6-.6L12 3.4Z" />
  </svg>
);

/** Ustaxona logotipi: yog'och U-monogramma. */
export const LogoMark = ({ className = "h-10 w-10" }: { className?: string }) => (
  <svg viewBox="0 0 44 44" className={className} aria-hidden>
    <rect x="1.5" y="1.5" width="41" height="41" rx="9" fill="var(--color-pine-900)" />
    <rect x="1.5" y="1.5" width="41" height="41" rx="9" fill="none" stroke="var(--color-pine-600)" strokeWidth="1.4" />
    <path
      d="M13 11v12a9 9 0 0 0 18 0V11"
      fill="none"
      stroke="var(--color-amber-400)"
      strokeWidth="4.2"
      strokeLinecap="round"
    />
    <path d="M13 11v2.6M31 11v2.6" stroke="var(--color-pine-900)" strokeWidth="1.6" />
  </svg>
);
