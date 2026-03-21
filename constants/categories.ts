import type { Category } from '@/types';
import { Colors } from './theme';

export const CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Food',
    budgetLimit: 8000,
    color: Colors.mint,
    icon: 'utensils',
    keywords: ['zomato', 'swiggy', 'restaurant', 'cafe', 'food', 'pizza', 'burger', 'dominos', 'mcdonalds', 'kfc', 'starbucks', 'chai', 'biryani', 'grocery', 'bakery'],
  },
  {
    id: 'travel',
    name: 'Travel',
    budgetLimit: 5000,
    color: Colors.yellow,
    icon: 'car',
    keywords: ['uber', 'ola', 'rapido', 'metro', 'bus', 'train', 'irctc', 'petrol', 'fuel', 'parking', 'taxi'],
  },
  {
    id: 'shopping',
    name: 'Shopping',
    budgetLimit: 6000,
    color: Colors.purple,
    icon: 'shopping-bag',
    keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'mall', 'store', 'shop', 'market'],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    budgetLimit: 3000,
    color: Colors.orange,
    icon: 'film',
    keywords: ['netflix', 'spotify', 'movie', 'cinema', 'pvr', 'inox', 'game', 'gaming', 'youtube'],
  },
  {
    id: 'bills',
    name: 'Bills',
    budgetLimit: 5000,
    color: Colors.blue,
    icon: 'zap',
    keywords: ['electricity', 'water', 'internet', 'wifi', 'jio', 'airtel', 'vi', 'recharge', 'rent', 'emi'],
  },
  {
    id: 'other',
    name: 'Other',
    budgetLimit: 3000,
    color: Colors.pink,
    icon: 'circle-ellipsis',
    keywords: [],
  },
];

export const DEFAULT_MONTHLY_BUDGET = 30000;
