import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartMenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  ingredients: string[];
  price: number;
  emoji: string;
  gradient: string;
  badge?: string;
  imageUrl?: string | null;
}

export interface CartItem {
  item: CartMenuItem;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartMenuItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.item.id === item.id);
          if (existing) return { items: state.items.map((i) => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) };
          return { items: [...state.items, { item, quantity: 1 }] };
        });
        set({ isOpen: true });
      },
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.item.id !== id) })),
      updateQty: (id, qty) => {
        if (qty <= 0) { get().removeItem(id); return; }
        set((state) => ({ items: state.items.map((i) => i.item.id === id ? { ...i, quantity: qty } : i) }));
      },
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      total: () => get().items.reduce((sum, i) => sum + i.item.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "spot-on-cart", partialize: (s) => ({ items: s.items }) }
  )
);
