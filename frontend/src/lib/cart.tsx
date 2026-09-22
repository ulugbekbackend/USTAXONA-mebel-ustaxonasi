import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "../lib/types";

export interface CartItem {
  key: string; // slug + variant
  productId: number;
  variantId: number | null;
  slug: string;
  name: string;
  price: number; // variant farqi bilan
  image: string;
  qty: number;
  variant: string | null;
  stock: number;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product, qty?: number, variantId?: number | null) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  toast: (msg: string) => void;
  toastMsg: string | null;
  bump: number; // savat badge "pop" animatsiyasi uchun
}

const Ctx = createContext<CartCtx | null>(null);
// v2: buyurtma uchun productId/variantId qo'shildi — v1 savatlari mos emas.
const STORAGE_KEY = "ustaxona-cart-v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [bump, setBump] = useState(0);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* private rejim yoki to'lgan xotira — savat faqat sessiyada qoladi */
    }
  }, [items]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2400);
  }, []);

  const addItem = useCallback(
    (product: Product, qty = 1, variantId: number | null = null) => {
      const variant = product.variants.find((v) => v.id === variantId) ?? null;
      const price = product.price + (variant?.priceDelta ?? 0);
      const key = `${product.slug}__${variant?.id ?? "base"}`;
      setItems((prev) => {
        const found = prev.find((i) => i.key === key);
        if (found) {
          return prev.map((i) =>
            i.key === key ? { ...i, qty: Math.min(i.qty + qty, 99) } : i
          );
        }
        return [
          ...prev,
          {
            key,
            productId: product.id,
            variantId: variant?.id ?? null,
            slug: product.slug,
            name: product.name,
            price,
            image: product.images[0],
            qty,
            variant: variant?.name ?? null,
            stock: product.stock,
          },
        ];
      });
      setBump((b) => b + 1);
    },
    []
  );

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, 99) } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      addItem,
      removeItem,
      setQty,
      clear,
      drawerOpen,
      setDrawerOpen,
      toast,
      toastMsg,
      bump,
    }),
    [items, count, subtotal, addItem, removeItem, setQty, clear, drawerOpen, toast, toastMsg, bump]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart CartProvider ichida ishlatilishi kerak");
  return ctx;
}
