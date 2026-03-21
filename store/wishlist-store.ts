import type { WishlistItem } from '@/types';
import { generateId } from '@/utils/format';
import { create } from 'zustand';

interface WishlistState {
  items: WishlistItem[];

  addItem: (name: string, price: number, categoryId?: string) => void;
  removeItem: (id: string) => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  items: [
    { id: 'w1', name: 'AirPods Pro', price: 24900, addedAt: new Date().toISOString(), categoryId: 'cat-3' }, // Electronic/Shopping
    { id: 'w2', name: 'Nike Air Max', price: 12995, addedAt: new Date().toISOString(), categoryId: 'cat-3' },
  ],

  addItem: (name, price, categoryId) => {
    const item: WishlistItem = {
      id: generateId(),
      name,
      price,
      addedAt: new Date().toISOString(),
      categoryId,
    };
    set((state) => ({ items: [item, ...state.items] }));
  },

  removeItem: (id) => {
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },
}));
