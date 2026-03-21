import type { Expense, PendingTransaction } from '@/types';
import { generateId } from '@/utils/format';
import { create } from 'zustand';

interface ExpenseState {
  expenses: Expense[];
  pendingTransaction: PendingTransaction | null;

  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  removeExpense: (id: string) => void;
  setPendingTransaction: (tx: PendingTransaction | null) => void;
  confirmPendingTransaction: () => void;
  clearAll: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  pendingTransaction: null,

  addExpense: (expense) => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      date: new Date().toISOString(),
    };
    set((state) => ({
      expenses: [newExpense, ...state.expenses],
    }));
  },

  removeExpense: (id) => {
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));
  },

  setPendingTransaction: (tx) => {
    set({ pendingTransaction: tx });
  },

  confirmPendingTransaction: () => {
    const { pendingTransaction } = get();
    if (!pendingTransaction) return;

    const newExpense: Expense = {
      id: generateId(),
      amount: pendingTransaction.amount,
      category: pendingTransaction.category,
      merchant: pendingTransaction.merchant,
      note: pendingTransaction.note,
      date: new Date().toISOString(),
    };

    set((state) => ({
      expenses: [newExpense, ...state.expenses],
      pendingTransaction: null,
    }));
  },

  clearAll: () => {
    set({ expenses: [], pendingTransaction: null });
  },
}));
