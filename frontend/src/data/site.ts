/**
 * Saytning statik (marketing) rasmlari va filtrdagi materiallar ro'yxati.
 * Katalog ma'lumotlari (kategoriya, mahsulot) backend API'dan keladi — src/lib/api.ts.
 */

// Rasmlar frontend/public/images/ ichida — tashqi hostingga bog'liq emas.
const U = (name: string) => `${import.meta.env.BASE_URL}images/${name}.webp`;

export const IMG = {
  hero: U("hero"),
  sofa: U("sofa"),
  armchair: U("armchair"),
  table: U("table"),
  chairs: U("chairs"),
  bed: U("bed"),
  wardrobe: U("wardrobe"),
  coffee: U("coffee"),
  shelf: U("shelf"),
  workshop: U("workshop"),
};

export const MATERIALS = ["Yong'oq", "Eman", "Qayin", "Buk", "Yasan"];

/**
 * Ijtimoiy tarmoq havolalari — hozircha andoza ("#"), akkauntlar hali ochilmagan.
 * Ochilgach shu yerda almashtiring, masalan: href: "https://t.me/<username>".
 */
export const SOCIAL = {
  telegram: { href: "#", handle: "@username" },
  facebook: { href: "#" },
  instagram: { href: "#" },
};

/**
 * Havola atributlari: "#" andoza — hech narsa qilmaydi (sahifa siljimaydi, yangi tab ochilmaydi);
 * http(s) — yangi tabda; tel: va boshqalar — oddiy havola.
 */
export function externalLinkProps(href: string) {
  if (href === "#") {
    return { href, onClick: (e: { preventDefault(): void }) => e.preventDefault() };
  }
  if (href.startsWith("http")) return { href, target: "_blank", rel: "noreferrer" };
  return { href };
}
