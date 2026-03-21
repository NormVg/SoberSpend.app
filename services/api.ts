/**
 * API service layer — placeholder for backend integration.
 * Currently all operations use local Zustand stores.
 * Swap implementations to hit real API endpoints when backend is ready.
 */

const API_BASE = ''; // Set to your backend URL when ready

export const api = {
  // Expenses
  async getExpenses() {
    // TODO: return fetch(`${API_BASE}/api/expenses`).then(r => r.json());
    return null; // Using local store
  },

  async addExpense(data: { amount: number; category: string; merchant: string }) {
    // TODO: return fetch(`${API_BASE}/api/expenses`, { method: 'POST', body: JSON.stringify(data) });
    return null; // Using local store
  },

  // Budgets
  async getBudgets() {
    // TODO: return fetch(`${API_BASE}/api/budgets`).then(r => r.json());
    return null;
  },

  // Sync
  async syncData() {
    // TODO: Implement two-way sync
    return null;
  },
};
