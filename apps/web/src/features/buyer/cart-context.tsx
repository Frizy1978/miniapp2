"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type CartItem = {
  imageUrl: string | null;
  name: string;
  price: string;
  productId: string;
  quantity: number;
  slug: string;
  unitLabel: string | null;
  unitType: "piece" | "weight" | "other";
};

type CartContextValue = {
  addItem: (item: CartItem) => void;
  clearCart: () => void;
  items: CartItem[];
  removeItem: (productId: string) => void;
  replaceItems: (items: CartItem[]) => void;
  setQuantity: (productId: string, quantity: number) => void;
  total: number;
};

const CART_STORAGE_KEY = "fh_cart_v1";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!stored) {
      setHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as CartItem[];
      setItems(parsed);
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => {
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    return {
      addItem(item) {
        const normalizedQuantity = Number(item.quantity.toFixed(3));

        if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
          return;
        }

        setItems((current) => {
          const existing = current.find((entry) => entry.productId === item.productId);

          if (!existing) {
            return [...current, { ...item, quantity: normalizedQuantity }];
          }

          return current.map((entry) =>
            entry.productId === item.productId
              ? { ...entry, quantity: Number((entry.quantity + normalizedQuantity).toFixed(3)) }
              : entry
          );
        });
      },
      clearCart() {
        setItems([]);
      },
      items,
      removeItem(productId) {
        setItems((current) => current.filter((item) => item.productId !== productId));
      },
      replaceItems(nextItems) {
        setItems(nextItems);
      },
      setQuantity(productId, quantity) {
        if (!Number.isFinite(quantity)) {
          return;
        }

        setItems((current) =>
          current
            .map((item) =>
              item.productId === productId
                ? { ...item, quantity: Number(quantity.toFixed(3)) }
                : item
            )
            .filter((item) => item.quantity > 0)
        );
      },
      total
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
