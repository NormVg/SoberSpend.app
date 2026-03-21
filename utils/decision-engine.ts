import type { Category, DecisionResult, Expense, WarningLevel } from '@/types';
import { projectedUsage, spentByCategory, totalSpent, usagePercent } from './budget-engine';

/**
 * Evaluate a pending transaction against budget limits.
 * Returns risk assessment with warning level and message.
 */
export function evaluateTransaction(
  merchant: string,
  amount: number,
  category: Category,
  expenses: Expense[],
  monthlyBudget: number
): DecisionResult {
  const byCategory = spentByCategory(expenses);
  const catSpent = byCategory[category.id] || 0;
  const total = totalSpent(expenses);

  const currentPercent = usagePercent(catSpent, category.budgetLimit);
  const projectedPercent = projectedUsage(catSpent, amount, category.budgetLimit);

  const totalCurrentPercent = usagePercent(total, monthlyBudget);
  const totalProjectedPercent = projectedUsage(total, amount, monthlyBudget);

  // Determine warning level based on projected category usage
  let warningLevel: WarningLevel = 'safe';
  let warningMessage = '';

  if (projectedPercent >= 100) {
    warningLevel = 'exceeded';
    warningMessage = `This will exceed your ${category.name} budget by ₹${Math.abs(category.budgetLimit - (catSpent + amount)).toLocaleString('en-IN')}`;
  } else if (projectedPercent >= 80) {
    warningLevel = 'near_limit';
    warningMessage = `You'll be at ${projectedPercent}% of your ${category.name} budget after this`;
  } else if (totalProjectedPercent >= 90) {
    warningLevel = 'near_limit';
    warningMessage = `Your total monthly budget will be at ${totalProjectedPercent}%`;
  } else {
    warningLevel = 'safe';
    warningMessage = `This fits within your ${category.name} budget`;
  }

  return {
    category,
    currentSpent: catSpent,
    currentPercent,
    projectedSpent: catSpent + amount,
    projectedPercent,
    totalCurrentSpent: total,
    totalCurrentPercent,
    totalProjectedSpent: total + amount,
    totalProjectedPercent,
    warningLevel,
    warningMessage,
  };
}
