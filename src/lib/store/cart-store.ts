"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  price: number; // cents, includes variant price diff
  variant?: string;
  quantity: number;
  stock: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find(
            (l) => l.productId === line.productId && l.variant === line.variant
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l === existing
                  ? { ...l, quantity: Math.min(l.quantity + quantity, l.stock) }
                  : l
              ),
              isOpen: true,
            };
          }
          return {
            lines: [...state.lines, { ...line, quantity }],
            isOpen: true,
          };
        }),
      removeItem: (productId, variant) =>
        set((state) => ({
          lines: state.lines.filter(
            (l) => !(l.productId === productId && l.variant === variant)
          ),
        })),
      updateQuantity: (productId, quantity, variant) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.productId === productId && l.variant === variant
                ? { ...l, quantity: Math.max(0, Math.min(quantity, l.stock)) }
                : l
            )
            .filter((l) => l.quantity > 0),
        })),
      clearCart: () => set({ lines: [] }),
      subtotal: () =>
        get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      itemCount: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    { name: "fieldnote-cart" }
  )
);
