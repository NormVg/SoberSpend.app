import { CATEGORIES, DEFAULT_MONTHLY_BUDGET } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import type { Category } from '@/types';
import { create } from 'zustand';

interface BudgetState {
  monthlyBudget: number;
  monthlySavingsTarget: number;
  categories: Category[];
  isDemoMode: boolean;

  hasCompletedOnboarding: boolean;
  userName: string;
  financialPersonality: 'Saver' | 'Balanced' | 'Spender' | null;
  spendingWeakness: string[];
  primaryGoal: string | null;
  weekendVibe: string | null;
  purchaseRegret: string | null;
  savingsRate: string | null;

  setMonthlyBudget: (amount: number) => Promise<void>;
  setMonthlySavingsTarget: (amount: number) => Promise<void>;
  setCategoryLimit: (categoryId: string, limit: number) => Promise<void>;
  setCategoriesData: (limitsMap: Record<string, number>) => void;
  setOnboardingData: (data: Partial<Pick<BudgetState, 'userName' | 'financialPersonality' | 'spendingWeakness' | 'hasCompletedOnboarding' | 'primaryGoal' | 'weekendVibe' | 'purchaseRegret' | 'savingsRate' | 'monthlyBudget' | 'monthlySavingsTarget'>>) => void;
  getCategoryById: (id: string) => Category | undefined;
  toggleDemoMode: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  monthlyBudget: DEFAULT_MONTHLY_BUDGET,
  monthlySavingsTarget: 5000, // default ₹5,000/month
  categories: CATEGORIES,
  isDemoMode: true,
  hasCompletedOnboarding: false,
  userName: '',
  financialPersonality: null,
  spendingWeakness: [],
  primaryGoal: null,
  weekendVibe: null,
  purchaseRegret: null,
  savingsRate: null,

  setOnboardingData: (data) => set((state) => ({ ...state, ...data })),

  setCategoriesData: (limitsMap) => set((state) => ({
    categories: state.categories.map((c) => ({
      ...c,
      budgetLimit: limitsMap[c.id] !== undefined ? limitsMap[c.id] : c.budgetLimit
    }))
  })),

  setMonthlyBudget: async (amount) => {
    set({ monthlyBudget: amount });
    const user = useAuthStore.getState().user;
    if (user) {
      await supabase.from('Users').update({ monthly_budget: amount }).eq('id', user.id);
    }
  },

  setMonthlySavingsTarget: async (amount) => {
    set({ monthlySavingsTarget: amount });
    const user = useAuthStore.getState().user;
    if (user) {
      await supabase.from('Users').update({ monthly_savings_target: amount }).eq('id', user.id);
    }
  },

  setCategoryLimit: async (categoryId, limit) => {
    const newCategories = get().categories.map((cat) =>
      cat.id === categoryId ? { ...cat, budgetLimit: limit } : cat
    );

    // Update local state synchronously
    set({ categories: newCategories });

    // NOW await the DB update outside the set() callback
    const user = useAuthStore.getState().user;
    if (user) {
      const limitsMap = newCategories.reduce<Record<string, number>>(
        (acc, c) => ({ ...acc, [c.id]: c.budgetLimit }), {}
      );
      await supabase.from('Users').update({ category_limits: limitsMap }).eq('id', user.id);
    }
  },

  getCategoryById: (id) => {
    return get().categories.find((c) => c.id === id);
  },

  toggleDemoMode: () => {
    set((state) => ({ isDemoMode: !state.isDemoMode }));
  },
}));
