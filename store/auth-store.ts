import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { useBudgetStore } from '@/store/budget-store';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setInitialized: (val: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setInitialized: (val) => set({ isInitialized: val, isLoading: false }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  initialize: async () => {
    set({ isLoading: true });

    // Get current session from storage
    const { data: { session } } = await supabase.auth.getSession();

    const fetchAndHydrateProfile = async (uid: string) => {
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('id', uid)
        .single();

      if (!error && data) {
        const budgetStore = useBudgetStore.getState();

        // Hydrate all profile fields
        budgetStore.setOnboardingData({
          userName: data.name || '',
          monthlyBudget: data.monthly_budget ? Number(data.monthly_budget) : 30000,
          monthlySavingsTarget: data.monthly_savings_target ? Number(data.monthly_savings_target) : 5000,
          financialPersonality: data.financial_personality || 'Balanced',
          spendingWeakness: data.spending_weakness || [],
          primaryGoal: data.primary_goal || '',
          weekendVibe: data.weekend_vibe || '',
          purchaseRegret: data.purchase_regret || '',
          savingsRate: data.savings_rate || '',
          hasCompletedOnboarding: true,
        });

        // Hydrate category per-category budget limits from JSON blob
        if (data.category_limits && typeof data.category_limits === 'object') {
          budgetStore.setCategoriesData(data.category_limits as Record<string, number>);
        }

        return true;
      }

      // If we failed to fetch the user (they don't exist in the DB), force onboarding
      useBudgetStore.getState().setOnboardingData({ hasCompletedOnboarding: false } as any);
      return false;
    };

    let activeUser = session?.user ?? null;
    let activeSession = session;

    if (session) {
      // Actively verify against the server rather than trusting local storage purely
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        await supabase.auth.signOut();
        useBudgetStore.getState().setOnboardingData({ hasCompletedOnboarding: false } as any);
        activeUser = null;
        activeSession = null;
      } else {
        activeUser = user;
        await fetchAndHydrateProfile(user.id);
      }
    }

    set({
      session: activeSession,
      user: activeUser,
      isInitialized: true,
      isLoading: false
    });

    // Listen to auth changes
    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession?.user) {
        await fetchAndHydrateProfile(newSession.user.id);
      }
      set({ session: newSession, user: newSession?.user ?? null });
    });
  },
}));
