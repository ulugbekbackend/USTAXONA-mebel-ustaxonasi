/** Frontend ichidagi ma'lumot turlari — api.ts DRF javoblarini shularga o'giradi. */

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
  parent: string | null; // ota kategoriya slug'i
  image: string;
  productsCount: number; // avlod kategoriyalar bilan birga
}

export interface Product {
  id: number;
  slug: string;
  sku: string;
  name: string;
  category: string; // kategoriya slug'i
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
