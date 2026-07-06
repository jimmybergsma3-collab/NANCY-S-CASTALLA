"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { productId: string; name: string; packageLabel: string; packageQuantity: number; quantity: number };
type CartContextValue = {
  items: CartItem[]; itemCount: number; ready: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, packageLabel: string, quantity: number) => void;
  removeItem: (productId: string, packageLabel: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "nancys_cart_v1";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as CartItem[];
        if (Array.isArray(stored)) setItems(stored.filter((item) => item.productId && item.packageLabel && item.quantity > 0));
      } catch { /* Ignore corrupt local data. */ }
      setReady(true);
    });
  }, []);

  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items, ready]);

  const value = useMemo<CartContextValue>(() => ({
    items, ready, itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    addItem(item, quantity = 1) {
      setItems((current) => {
        const found = current.find((line) => line.productId === item.productId && line.packageLabel === item.packageLabel);
        return found
          ? current.map((line) => line === found ? { ...line, quantity: Math.min(99, line.quantity + quantity) } : line)
          : [...current, { ...item, quantity: Math.min(99, Math.max(1, quantity)) }];
      });
    },
    updateQuantity(productId, packageLabel, quantity) {
      if (quantity < 1) return;
      setItems((current) => current.map((line) => line.productId === productId && line.packageLabel === packageLabel ? { ...line, quantity: Math.min(99, quantity) } : line));
    },
    removeItem(productId, packageLabel) { setItems((current) => current.filter((line) => line.productId !== productId || line.packageLabel !== packageLabel)); },
    clear() { setItems([]); },
  }), [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
