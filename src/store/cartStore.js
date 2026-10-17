import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_QTY = 10;
const clampQty = (n) => Math.max(1, Math.min(MAX_QTY, Math.floor(n) || 1));

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],

      addItem: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, qty: clampQty(i.qty + qty) } : i,
              ),
            };
          }
          const { id, title, price, image, category } = product;
          return { items: [...state.items, { id, title, price, image, category, qty: clampQty(qty) }] };
        }),

      setQty: (id, qty) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, qty: clampQty(qty) } : i)),
        })),

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      clear: () => set({ items: [] }),
    }),
    { name: 'shopfront-cart' },
  ),
);

export { MAX_QTY };
