import { CATEGORIES, DEFAULT_MONTHLY_BUDGET } from '@/constants/categories';
import type { Category } from '@/types';
import { create } from 'zustand';

interface BudgetState {
  monthlyBudget: number;
  monthlySavingsTarget: number;
  categories: Category[];
  isDemoMode: boolean;

  setMonthlyBudget: (amount: number) => void;
  setMonthlySavingsTarget: (amount: number) => void;
  setCategoryLimit: (categoryId: string, limit: number) => void;
  getCategoryById: (id: string) => Category | undefined;
  toggleDemoMode: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  monthlyBudget: DEFAULT_MONTHLY_BUDGET,
  monthlySavingsTarget: 5000, // default ₹5,000/month
  categories: CATEGORIES,
  isDemoMode: true,

  setMonthlyBudget: (amount) => {
    set({ monthlyBudget: amount });
  },

  setMonthlySavingsTarget: (amount) => {
    set({ monthlySavingsTarget: amount });
  },

  setCategoryLimit: (categoryId, limit) => {
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === categoryId ? { ...cat, budgetLimit: limit } : cat
      ),
    }));
  },

  getCategoryById: (id) => {
    return get().categories.find((c) => c.id === id);
  },

  toggleDemoMode: () => {
    set((state) => ({ isDemoMode: !state.isDemoMode }));
  },
}));
