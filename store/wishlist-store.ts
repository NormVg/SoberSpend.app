import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import type { WishlistItem } from '@/types';
import { generateId } from '@/utils/format';
import { create } from 'zustand';

interface WishlistState {
  items: WishlistItem[];

  addItem: (name: string, price: number, categoryId?: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearAll: () => void;
  initialize: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  items: [],

  addItem: async (name, price, categoryId) => {
    const id = generateId();
    const addedAt = new Date().toISOString();
    const item: WishlistItem = { id, name, price, addedAt, categoryId };

    set((state) => ({ items: [item, ...state.items] }));

    const user = useAuthStore.getState().user;
    if (user) {
      await supabase.from('Wishlists').insert({
        id,
        user_id: user.id,
        name,
        price,
        category_id: categoryId,
        added_at: addedAt,
      });
    }
  },

  removeItem: async (id) => {
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
    await supabase.from('Wishlists').delete().eq('id', id);
  },

  clearAll: () => set({ items: [] }),

  initialize: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const { data } = await supabase
      .from('Wishlists')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (data) {
      const items: WishlistItem[] = data.map((row) => ({
        id: row.id,
        name: row.name,
        price: row.price,
        categoryId: row.category_id || undefined,
        addedAt: row.added_at,
      }));
      set({ items });
    }
  },
}));
