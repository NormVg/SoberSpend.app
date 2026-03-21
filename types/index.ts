export type WarningLevel = 'safe' | 'near_limit' | 'exceeded';

export interface Category {
  id: string;
  name: string;
  budgetLimit: number;
  color: string;
  icon: string; // SF Symbol name
  keywords: string[];
}

export interface Expense {
  id: string;
  amount: number;
  category: string; // category id
  merchant: string;
  note?: string;
  date: string; // ISO string
}

export interface Budget {
  monthlyTotal: number;
  categories: Category[];
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  addedAt: string; // ISO string
  categoryId?: string;
}

export interface DecisionResult {
  category: Category;
  currentSpent: number;
  currentPercent: number;
  projectedSpent: number;
  projectedPercent: number;
  totalCurrentSpent: number;
  totalCurrentPercent: number;
  totalProjectedSpent: number;
  totalProjectedPercent: number;
  warningLevel: WarningLevel;
  warningMessage: string;
}

export interface PendingTransaction {
  merchant: string;
  amount: number;
  category: string;
  note?: string;
}
