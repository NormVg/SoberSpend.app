import { CATEGORIES, DEFAULT_MONTHLY_BUDGET } from '@/constants/categories';
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

  setMonthlyBudget: (amount: number) => void;
  setMonthlySavingsTarget: (amount: number) => void;
  setCategoryLimit: (categoryId: string, limit: number) => void;
  setOnboardingData: (data: Partial<Pick<BudgetState, 'userName' | 'financialPersonality' | 'spendingWeakness' | 'hasCompletedOnboarding' | 'primaryGoal' | 'weekendVibe' | 'purchaseRegret' | 'savingsRate'>>) => void;
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
