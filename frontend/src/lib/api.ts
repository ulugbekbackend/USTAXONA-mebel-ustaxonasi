/**
 * API qatlami — Django DRF endpointlari (/api/...) bilan ishlaydi va javoblarni
 * frontend turlariga (lib/types.ts) o'giradi.
 *
 * Manzil: VITE_API_URL (masalan https://api.example.com). Bo'sh bo'lsa — nisbiy
 * /api: dev'da Vite proxy, production'da Nginx backend'ga uzatadi.
 */
import type { CategoryNode, Product } from "./types";

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
export const PLACEHOLDER_IMG = `${import.meta.env.BASE_URL}placeholder.svg`;

export interface ProductQuery {
  category?: string | null;
  q?: string | null;
  materials?: string[];
  priceMin?: number | null;
  priceMax?: number | null;
  inStockOnly?: boolean;
  sort?: string; // "-created" | "price" | "-price" | "name"
  page?: number;
  pageSize?: number;
}

export interface Paged<T> {
  results: T[];
  count: number;
  page: number;
  pages: number;
}

export const fmtPrice = (n: number): string =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";

/* ------------------------------ HTTP ------------------------------ */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: unknown = null
  ) {
    super(message);
  }
}

/** DRF xato javobidagi barcha matnlarni bitta ro'yxatga yig'adi. */
function collectMessages(data: unknown): string[] {
  if (typeof data === "string") return [data];
  if (Array.isArray(data)) return data.flatMap(collectMessages);
  if (data && typeof data === "object") return Object.values(data).flatMap(collectMessages);
  return [];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api${path}`, {
      ...init,
      headers: { Accept: "application/json", "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("Server bilan aloqa yo'q. Internetni tekshirib, qayta urinib ko'ring.", 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      res.status === 429
        ? "Juda ko'p so'rov yuborildi. Birozdan keyin qayta urinib ko'ring."
        : collectMessages(data).join(" ") || `Server xatosi (${res.status})`;
    throw new ApiError(message, res.status, data);
  }
  return data as T;
}

function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined && v !== "" && v !== false) sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/* --------------------------- DRF -> frontend --------------------------- */

interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  products_count: number;
  children: ApiCategory[];
}

interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  old_price: string | null;
  material: string;
  dimensions: string;
  status: "in_stock" | "on_order";
  stock: number;
  is_new: boolean;
  is_featured: boolean;
  created_at: string;
  category_slug: string;
  image_url: string | null;
  // faqat detal javobida:
  description?: string;
  weight?: string;
  images?: { image: string }[];
  variants?: { id: number; name: string; color_hex: string; price_delta: string }[];
}

interface ApiPage<T> {
  count: number;
  results: T[];
}

function toProduct(p: ApiProduct): Product {
  const images = [p.image_url, ...(p.images ?? []).map((i) => i.image)].filter(
    (src, i, all): src is string => !!src && all.indexOf(src) === i
  );
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku || `UX-${String(p.id).padStart(3, "0")}`,
    name: p.name,
    category: p.category_slug,
    price: Number(p.price),
    oldPrice: p.old_price === null ? null : Number(p.old_price),
    material: p.material,
    dimensions: p.dimensions,
    weight: p.weight ?? "",
    stock: p.stock,
    status: p.status,
    isNew: p.is_new,
    isFeatured: p.is_featured,
    createdAt: Date.parse(p.created_at),
    description: p.description ?? "",
    images: images.length ? images : [PLACEHOLDER_IMG],
    variants: (p.variants ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      hex: v.color_hex,
      priceDelta: Number(v.price_delta),
    })),
  };
}

/* ----------------------------- Kategoriyalar ----------------------------- */

// Daraxt ilova ochilganda bir marta yuklanadi (main.tsx) — menyu, footer va
// sahifalar uni sinxron o'qiydi.
let categories: CategoryNode[] = [];

function flatten(nodes: ApiCategory[], parent: string | null, out: CategoryNode[]) {
  for (const c of nodes) {
    out.push({
      id: c.id,
      slug: c.slug,
      name: c.name,
      parent,
      image: c.image ?? PLACEHOLDER_IMG,
      productsCount: c.products_count,
    });
    flatten(c.children, c.slug, out);
  }
  return out;
}

export async function loadCategories(): Promise<void> {
  try {
    categories = flatten(await request<ApiCategory[]>("/categories/"), null, []);
  } catch (err) {
    console.error("Kategoriyalar yuklanmadi:", err);
  }
}

export const getCategories = (): CategoryNode[] => categories;

export const categoryBySlug = (slug: string): CategoryNode | undefined =>
  categories.find((c) => c.slug === slug);

export const productCountFor = (slug: string): number =>
  categoryBySlug(slug)?.productsCount ?? 0;

/* ------------------------------- Mahsulotlar ------------------------------- */

const ORDERING: Record<string, string> = {
  "-created": "-created_at",
  price: "price",
  "-price": "-price",
  name: "name",
};

async function listProducts(params: Record<string, string | number | boolean | null | undefined>) {
  return request<ApiPage<ApiProduct>>(`/products/${qs(params)}`);
}

export async function fetchProducts(query: ProductQuery = {}): Promise<Paged<Product>> {
  const pageSize = query.pageSize ?? 9;
  const params = {
    category: query.category,
    q: query.q?.trim(),
    material: query.materials?.join(","),
    price_min: query.priceMin,
    price_max: query.priceMax,
    in_stock: query.inStockOnly,
    ordering: ORDERING[query.sort ?? "-created"] ?? "-created_at",
    page_size: pageSize,
  };
  let page = Math.max(1, query.page ?? 1);
  try {
    let data: ApiPage<ApiProduct>;
    try {
      data = await listProducts({ ...params, page });
    } catch (err) {
      // Filtr o'zgarib sahifalar kamaygan bo'lsa (DRF 404) — birinchi sahifaga qaytamiz.
      if (!(err instanceof ApiError && err.status === 404) || page === 1) throw err;
      page = 1;
      data = await listProducts({ ...params, page });
    }
    return {
      results: data.results.map(toProduct),
      count: data.count,
      page,
      pages: Math.max(1, Math.ceil(data.count / pageSize)),
    };
  } catch (err) {
    console.error("Mahsulotlar yuklanmadi:", err);
    return { results: [], count: 0, page: 1, pages: 1 };
  }
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    return toProduct(await request<ApiProduct>(`/products/${encodeURIComponent(slug)}/`));
  } catch (err) {
    if (!(err instanceof ApiError && err.status === 404)) console.error(err);
    return null;
  }
}

/** Ro'yxatni `limit` gacha to'ldiradi: avval asosiy so'rov, yetmasa — qo'shimcha. */
async function fillUp(
  primary: Record<string, string | number | boolean | null | undefined>,
  fallback: Record<string, string | number | boolean | null | undefined>,
  limit: number
): Promise<Product[]> {
  try {
    const first = (await listProducts({ ...primary, page_size: limit })).results;
    if (first.length >= limit) return first.map(toProduct);
    const extra = (await listProducts({ ...fallback, page_size: limit * 2 })).results;
    const seen = new Set(first.map((p) => p.slug));
    return [...first, ...extra.filter((p) => !seen.has(p.slug))].slice(0, limit).map(toProduct);
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function fetchSimilar(product: Product, limit = 4): Promise<Product[]> {
  return fillUp(
    { category: product.category, exclude: product.slug },
    { exclude: product.slug },
    limit
  );
}

export async function fetchFeatured(limit = 8): Promise<Product[]> {
  return fillUp({ is_featured: true }, {}, limit);
}

export async function fetchNew(limit = 4): Promise<Product[]> {
  try {
    const data = await listProducts({ is_new: true, page_size: limit });
    return data.results.map(toProduct);
  } catch (err) {
    console.error(err);
    return [];
  }
}

/* -------------------------------- Buyurtma -------------------------------- */

export type PaymentMethod = "cash" | "terminal" | "payme" | "click";
/** Payme va Click merchant API ulangach shu ro'yxatga qo'shiladi. */
export const AVAILABLE_PAYMENT_METHODS: PaymentMethod[] = ["cash", "terminal"];

export interface OrderPayload {
  customer: { full_name: string; phone: string; address: string };
  comment: string;
  payment_method: PaymentMethod;
  items: { product: number; variant: number | null; quantity: number }[];
}

/**
 * POST /api/orders/ — backend Order + OrderItem yaratadi, narx va stokni o'zi
 * hisoblaydi, ustaga Telegram xabar yuboradi. Xatoda ApiError tashlanadi.
 */
export async function createOrder(payload: OrderPayload): Promise<{ id: number; number: string }> {
  return request<{ id: number; number: string }>("/orders/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ------------------------------ Aloqa formasi ------------------------------ */

/** POST /api/contact/ — murojaat admin'da saqlanadi va ustaga Telegram'da boradi. */
export async function sendContactMessage(payload: {
  name: string;
  phone: string;
  message: string;
}): Promise<void> {
  await request("/contact/", { method: "POST", body: JSON.stringify(payload) });
}
