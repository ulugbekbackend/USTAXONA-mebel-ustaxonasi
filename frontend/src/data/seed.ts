/**
 * Demo katalog ma'lumotlari. Real loyihada bu qatlam backend DRF API'si
 * (GET /api/categories/, GET /api/products/) bilan almashtiriladi —
 * src/lib/api.ts shartnomasi bilan bir xil.
 */

export interface Variant {
  id: number;
  name: string;
  hex: string;
  priceDelta: number;
}

export interface CategoryNode {
  id: number;
  slug: string;
  name: string;
  parent: string | null;
  image: string;
}

export interface Product {
  id: number;
  slug: string;
  sku: string;
  name: string;
  category: string; // child kategoriya slug'i
  price: number;
  oldPrice: number | null;
  material: string;
  dimensions: string;
  weight: string;
  stock: number;
  status: "in_stock" | "on_order";
  isNew: boolean;
  isFeatured: boolean;
  createdAt: number;
  description: string;
  images: string[];
  variants: Variant[];
}

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

export const CATEGORIES: CategoryNode[] = [
  { id: 1, slug: "mehmonxona", name: "Mehmonxona", parent: null, image: IMG.hero },
  { id: 2, slug: "divanlar", name: "Divanlar", parent: "mehmonxona", image: IMG.sofa },
  { id: 3, slug: "kreslolar", name: "Kreslolar", parent: "mehmonxona", image: IMG.armchair },
  { id: 4, slug: "stoliklar", name: "Stoliklar", parent: "mehmonxona", image: IMG.coffee },
  { id: 5, slug: "oshxona", name: "Oshxona", parent: null, image: IMG.table },
  { id: 6, slug: "stullar", name: "Stullar", parent: "oshxona", image: IMG.chairs },
  { id: 7, slug: "yotoqxona", name: "Yotoqxona", parent: null, image: IMG.bed },
  { id: 8, slug: "karavotlar", name: "Karavotlar", parent: "yotoqxona", image: IMG.bed },
  { id: 9, slug: "shkaflar", name: "Shkaflar", parent: "yotoqxona", image: IMG.wardrobe },
  { id: 10, slug: "ofis", name: "Ofis mebelsi", parent: null, image: IMG.shelf },
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    slug: "archa-divani",
    sku: "UX-014",
    name: "«Archa» divani",
    category: "divanlar",
    price: 12_900_000,
    oldPrice: 14_500_000,
    material: "Yong'oq",
    dimensions: "220 × 95 × 85 sm",
    weight: "68 kg",
    stock: 4,
    status: "in_stock",
    isNew: false,
    isFeatured: true,
    createdAt: 20260214,
    description:
      "Uch o'rinli «Archa» divani yong'oq daraxtidan qo'lda ishlangan karkas va zig'ir matoli yostiqlardan iborat. Har bir bog'lanish joyi an'anaviy yog'och o'ymakorligi usulida mahkamlanadi — mix va vint ishlatilmaydi. Yostiqlar qoplamasi yechilib, yuvish mumkin.",
    images: [IMG.sofa, IMG.hero, IMG.workshop],
    variants: [
      { id: 1, name: "Yashil", hex: "#4a5d4e", priceDelta: 0 },
      { id: 2, name: "Krem", hex: "#e4d8be", priceDelta: 0 },
      { id: 3, name: "Kulrang", hex: "#8b8b83", priceDelta: 350_000 },
    ],
  },
  {
    id: 2,
    slug: "dala-kreslosi",
    sku: "UX-021",
    name: "«Dala» kreslosi",
    category: "kreslolar",
    price: 4_800_000,
    oldPrice: null,
    material: "Eman",
    dimensions: "78 × 80 × 92 sm",
    weight: "21 kg",
    stock: 7,
    status: "in_stock",
    isNew: true,
    isFeatured: false,
    createdAt: 20260220,
    description:
      "«Dala» — eman daraxtidan yasalgan, teri bilan qoplangan dam olish kreslosi. Egilgan orqa suyanchig'i belga tabiiy tayanch beradi. Teri vaqti bilan chiroyli «qarish» rangiga kiradi — bu tabiiy jarayon.",
    images: [IMG.armchair, IMG.workshop],
    variants: [
      { id: 4, name: "Karamel", hex: "#b0793f", priceDelta: 0 },
      { id: 5, name: "Qora", hex: "#2e2a26", priceDelta: 420_000 },
    ],
  },
  {
    id: 3,
    slug: "sahro-stoli",
    sku: "UX-008",
    name: "«Sahro» stoli",
    category: "oshxona",
    price: 8_400_000,
    oldPrice: null,
    material: "Yong'oq",
    dimensions: "200 × 100 × 75 sm",
    weight: "74 kg",
    stock: 3,
    status: "in_stock",
    isNew: false,
    isFeatured: true,
    createdAt: 20260201,
    description:
      "Sakkiz kishilik oilaviy stol. Stol usti bitta yaxlit yong'oq taxtadan yo'nib ishlangan, sirti tabiiy yog' bilan pardozlangan — issiq idish qo'yish mumkin. Oyoqlari yig'iladigan, ko'chishda qulay.",
    images: [IMG.table, IMG.chairs, IMG.workshop],
    variants: [],
  },
  {
    id: 4,
    slug: "bahor-stullari",
    sku: "UX-033",
    name: "«Bahor» stullari (2 ta)",
    category: "stullar",
    price: 3_200_000,
    oldPrice: null,
    material: "Qayin",
    dimensions: "45 × 52 × 88 sm",
    weight: "5.4 kg",
    stock: 12,
    status: "in_stock",
    isNew: false,
    isFeatured: false,
    createdAt: 20260118,
    description:
      "Qayin daraxtidan bukilgan orqa suyanchikli stullar juftligi. O'rindig'i to'qilgan ratan — yozda salqin, qishda iliq saqlaydi. Har bir stul 120 kg gacha yukka sinovdan o'tkaziladi.",
    images: [IMG.chairs, IMG.table, IMG.workshop],
    variants: [
      { id: 6, name: "Tabiiy", hex: "#c9a46b", priceDelta: 0 },
      { id: 7, name: "Yashil", hex: "#5a6e52", priceDelta: 180_000 },
    ],
  },
  {
    id: 5,
    slug: "orzu-karavoti",
    sku: "UX-005",
    name: "«Orzu» karavoti 160×200",
    category: "karavotlar",
    price: 15_600_000,
    oldPrice: null,
    material: "Yong'oq",
    dimensions: "170 × 212 × 96 sm",
    weight: "92 kg",
    stock: 0,
    status: "on_order",
    isNew: false,
    isFeatured: true,
    createdAt: 20260210,
    description:
      "«Orzu» — ustaxonaning eng sevimli loyihasi. Bosh suyanchig'i yumshoq zig'ir mato bilan qoplangan, tagida ikkita katta tortma. Matras to'plamga kirmaydi; tayyorlanish muddati 25–30 kun.",
    images: [IMG.bed, IMG.wardrobe, IMG.workshop],
    variants: [
      { id: 8, name: "Sut rang", hex: "#e8ddc8", priceDelta: 0 },
      { id: 9, name: "Zaytun", hex: "#7a7d5c", priceDelta: 600_000 },
    ],
  },
  {
    id: 6,
    slug: "tog-shkafi",
    sku: "UX-041",
    name: "«Tog'» shkafi",
    category: "shkaflar",
    price: 11_200_000,
    oldPrice: null,
    material: "Eman",
    dimensions: "120 × 60 × 210 sm",
    weight: "110 kg",
    stock: 5,
    status: "in_stock",
    isNew: false,
    isFeatured: false,
    createdAt: 20260112,
    description:
      "Ikki eshikli «Tog'» shkafi emandan yasalgan, eshiklari vertikal o'yiq naqshli. Ichida besh ta polka va kiyim iladigan moslama. Tutqichlari jez — qo'lda quyilgan.",
    images: [IMG.wardrobe, IMG.bed],
    variants: [],
  },
  {
    id: 7,
    slug: "daryo-stoligi",
    sku: "UX-052",
    name: "«Daryo» stoligi",
    category: "stoliklar",
    price: 2_950_000,
    oldPrice: 3_400_000,
    material: "Yong'oq",
    dimensions: "Ø 90 × 45 sm",
    weight: "18 kg",
    stock: 9,
    status: "in_stock",
    isNew: true,
    isFeatured: false,
    createdAt: 20260222,
    description:
      "Yumaloq «Daryo» stoligi — divan oldi uchun. Pastki qavati kitob va pult uchun, oyoqlari tokarlikda yo'nib ishlangan. Sirti qattiq mum bilan pardozlangan, iz qoldirmaydi.",
    images: [IMG.coffee, IMG.sofa],
    variants: [],
  },
  {
    id: 8,
    slug: "bog-javoni",
    sku: "UX-060",
    name: "«Bog'» javonlari",
    category: "ofis",
    price: 3_600_000,
    oldPrice: null,
    material: "Qayin",
    dimensions: "180 × 25 × 80 sm",
    weight: "24 kg",
    stock: 6,
    status: "in_stock",
    isNew: false,
    isFeatured: false,
    createdAt: 20260105,
    description:
      "Devorga o'rnatiladigan uch qavatli javonlar to'plami. Har bir javon 15 kg yuk ko'taradi, mahkamlash detallari komplektda. Kitob, idish va o'simliklar uchun birdek chiroyli.",
    images: [IMG.shelf, IMG.workshop],
    variants: [],
  },
  {
    id: 9,
    slug: "oqtepa-ofis-stoli",
    sku: "UX-071",
    name: "«Oqtepa» ofis stoli",
    category: "ofis",
    price: 5_400_000,
    oldPrice: null,
    material: "Buk",
    dimensions: "140 × 70 × 75 sm",
    weight: "46 kg",
    stock: 4,
    status: "in_stock",
    isNew: false,
    isFeatured: false,
    createdAt: 20260128,
    description:
      "Uy-ofis uchun ixcham ish stoli. O'ng tomonida ikkita tortma, orqa panelida kabellar uchun maxsus teshik va kanal. Buk daraxti — qattiq va barqaror material.",
    images: [IMG.table, IMG.shelf],
    variants: [],
  },
  {
    id: 10,
    slug: "chimyon-kreslosi",
    sku: "UX-080",
    name: "«Chimyon» ish kreslosi",
    category: "ofis",
    price: 2_700_000,
    oldPrice: null,
    material: "Buk + teri",
    dimensions: "62 × 60 × 85 sm",
    weight: "12 kg",
    stock: 10,
    status: "in_stock",
    isNew: true,
    isFeatured: false,
    createdAt: 20260224,
    description:
      "Buk daraxtidan egilgan karkasli ish kreslosi, o'rindig'i teri. Metall mexanizm o'rniga to'liq yog'och konstruksiyalar — skripillamaydi, yillar xizmat qiladi.",
    images: [IMG.armchair, IMG.chairs],
    variants: [
      { id: 10, name: "Asal", hex: "#c98a3d", priceDelta: 0 },
      { id: 11, name: "Tund", hex: "#3a3f3a", priceDelta: 300_000 },
    ],
  },
  {
    id: 11,
    slug: "zarafshon-divani",
    sku: "UX-092",
    name: "«Zarafshon» divani",
    category: "divanlar",
    price: 9_800_000,
    oldPrice: null,
    material: "Yasan",
    dimensions: "180 × 90 × 82 sm",
    weight: "54 kg",
    stock: 3,
    status: "in_stock",
    isNew: false,
    isFeatured: false,
    createdAt: 20260120,
    description:
      "Ikki o'rinli ixcham divan — kichik mehmonxonalar uchun. Yasanning och sarg'ish tusi xonani yengillashtiradi. Qo'llari keng: choy piyola ham sig'adi.",
    images: [IMG.sofa, IMG.coffee],
    variants: [],
  },
  {
    id: 12,
    slug: "yashil-burchak-divani",
    sku: "UX-003",
    name: "«Yashil» burchak divani",
    category: "divanlar",
    price: 18_900_000,
    oldPrice: 21_000_000,
    material: "Yong'oq",
    dimensions: "280 × 160 × 85 sm",
    weight: "118 kg",
    stock: 2,
    status: "in_stock",
    isNew: false,
    isFeatured: true,
    createdAt: 20260205,
    description:
      "Katta oilalar uchun burchak divani: olti o'rin, ochiladigan yotoq bo'limi va ichki sandiq. Karkasi quritilgan yong'oq, yostiqlari o'rta qattiqlikda — erta tonggacha shaklini saqlaydi.",
    images: [IMG.hero, IMG.sofa, IMG.workshop],
    variants: [
      { id: 12, name: "Yashil", hex: "#43584a", priceDelta: 0 },
      { id: 13, name: "Antratsit", hex: "#4a4a48", priceDelta: 500_000 },
    ],
  },
  {
    id: 13,
    slug: "navroz-stul-toplam",
    sku: "UX-104",
    name: "«Navro'z» stul to'plami (4 ta)",
    category: "stullar",
    price: 5_900_000,
    oldPrice: null,
    material: "Eman",
    dimensions: "45 × 52 × 88 sm",
    weight: "5.8 kg",
    stock: 8,
    status: "in_stock",
    isNew: true,
    isFeatured: false,
    createdAt: 20260226,
    description:
      "To'rtta emandan stul — «Sahro» stoli uchun ideal juftlik. Orqa suyanchig'idagi qo'l bilan o'yilgan naqsh har bir stulda biroz farq qiladi: bu seriyali emas, ustaxona ishi.",
    images: [IMG.chairs, IMG.workshop, IMG.table],
    variants: [],
  },
  {
    id: 14,
    slug: "kumush-garderob",
    sku: "UX-115",
    name: "«Kumush» garderob",
    category: "shkaflar",
    price: 13_400_000,
    oldPrice: null,
    material: "Yasan",
    dimensions: "160 × 62 × 220 sm",
    weight: "140 kg",
    stock: 1,
    status: "in_stock",
    isNew: false,
    isFeatured: false,
    createdAt: 20260108,
    description:
      "Uch bo'limli garderob: kiyim iladigan joy, tortmalar va oy nurlangan oynali eshik. Yasan daraxtining och tusi kichik yotoqxonani ham tor ko'rsatmaydi.",
    images: [IMG.wardrobe, IMG.shelf],
    variants: [],
  },
];

export const MATERIALS = ["Yong'oq", "Eman", "Qayin", "Buk", "Yasan"];
