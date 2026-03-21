import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import type { Expense, PendingTransaction } from '@/types';
import { generateId } from '@/utils/format';
import { Alert } from 'react-native';
import { create } from 'zustand';

interface ExpenseState {
  expenses: Expense[];
  pendingTransaction: PendingTransaction | null;

  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  removeExpense: (id: string) => void;
  setPendingTransaction: (tx: PendingTransaction | null) => void;
  confirmPendingTransaction: () => Promise<void>;
  clearAll: () => void;
  initialize: () => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  pendingTransaction: null,

  addExpense: async (expense) => {
    const id = generateId();
    const date = new Date().toISOString();
    const newExpense: Expense = { ...expense, id, date };

    set((state) => ({ expenses: [newExpense, ...state.expenses] }));

    const user = useAuthStore.getState().user;
    if (user) {
      await supabase.from('Transactions').insert({
        id,
        user_id: user.id,
        amount: expense.amount,
        category: expense.category,
        merchant: expense.merchant,
        note: expense.note,
        timestamp: date,
      });
    }
  },

  removeExpense: async (id) => {
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));

    await supabase.from('Transactions').delete().eq('id', id);
  },

  setPendingTransaction: (tx) => {
    set({ pendingTransaction: tx });
  },

  confirmPendingTransaction: async () => {
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

    const user = useAuthStore.getState().user;
    if (user) {
      const { error } = await supabase.from('Transactions').insert({
        id: newExpense.id,
        user_id: user.id,
        amount: Math.round(newExpense.amount),
        category: newExpense.category,
        merchant: newExpense.merchant,
        note: newExpense.note || null,
        timestamp: newExpense.date,
      });

      if (error) {
        console.error('Supabase raw error:', error);
        Alert.alert('Database Error', error.message || 'Failed to save transaction');
      }
    }
  },

  clearAll: () => {
    set({ expenses: [], pendingTransaction: null });
  },

  initialize: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const { data } = await supabase
      .from('Transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (data) {
      const expenses: Expense[] = data.map((row) => ({
        id: row.id,
        amount: row.amount,
        category: row.category,
        merchant: row.merchant,
        note: row.note || undefined,
        date: row.timestamp,
      }));
      set({ expenses });
    }
  },
}));
