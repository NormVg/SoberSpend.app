import type { Expense } from '@/types';

/**
 * Calculate total spent from a list of expenses.
 */
export function totalSpent(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Calculate spent per category.
 */
export function spentByCategory(expenses: Expense[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const e of expenses) {
    map[e.category] = (map[e.category] || 0) + e.amount;
  }
  return map;
}

/**
 * Calculate budget usage percentage.
 */
export function usagePercent(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.round((spent / limit) * 100);
}

/**
 * Calculate remaining budget.
 */
export function remaining(spent: number, limit: number): number {
  return Math.max(0, limit - spent);
}

/**
 * Calculate projected usage after a new expense.
 */
export function projectedUsage(currentSpent: number, newAmount: number, limit: number): number {
  return usagePercent(currentSpent + newAmount, limit);
}

/**
 * Get expenses from the current month only.
 */
export function currentMonthExpenses(expenses: Expense[]): Expense[] {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  return expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
}

/**
 * Calculate daily average spending.
 */
export function dailyAverage(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  const total = totalSpent(expenses);
  const now = new Date();
  const dayOfMonth = now.getDate();
  return Math.round(total / dayOfMonth);
}

/**
 * Estimate days needed to afford a given price based on savings rate.
 * If savingsTarget is provided, uses that directly.
 * Otherwise infers from daily spend vs daily budget.
 */
export function daysToAfford(price: number, monthlyBudget: number, monthlySpent: number, monthlySavingsTarget?: number): number {
  let dailySavings: number;

  if (monthlySavingsTarget && monthlySavingsTarget > 0) {
    dailySavings = monthlySavingsTarget / 30;
  } else {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const dailySpend = dayOfMonth > 0 ? monthlySpent / dayOfMonth : 0;
    dailySavings = (monthlyBudget / 30) - dailySpend;
  }

  if (dailySavings <= 0) return -1;
  return Math.ceil(price / dailySavings);
}
