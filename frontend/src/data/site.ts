/**
 * Saytning statik (marketing) rasmlari va filtrdagi materiallar ro'yxati.
 * Katalog ma'lumotlari (kategoriya, mahsulot) backend API'dan keladi — src/lib/api.ts.
 */

const U = (id: string) => `https://image.qwenlm.ai/generated-images/${id}/_result.png`;

export const IMG = {
  hero: U("47c4b030-fb30-4c5f-9747-c2370dbd1fa3"),
  sofa: U("dd77339e-83a4-4fbe-b17a-422d6cf7b9f8"),
  armchair: U("2f29a921-0109-45d5-881a-85ebc88f9d52"),
  table: U("083daa18-2940-4f3e-b999-17042c1b7503"),
  chairs: U("e1c71237-4e6c-43df-b1d5-c4e2a2507083"),
  bed: U("38998553-5807-49ba-8038-354e493adf93"),
  wardrobe: U("eca14de8-21a8-4bd3-9dff-7d17cc8ac64a"),
  coffee: U("9ad377bc-2f76-4837-b964-c0f6fe3c6aa5"),
  shelf: U("c0156861-0581-4d9d-801a-e4fec3e95c43"),
  workshop: U("031fd2e6-4434-4524-8691-840cfa3c122b"),
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
