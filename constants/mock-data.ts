import type { Expense } from '@/types';

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const MOCK_EXPENSES: Expense[] = [
  { id: '1', amount: 450, category: 'food', merchant: 'Zomato', date: daysAgo(0) },
  { id: '2', amount: 250, category: 'travel', merchant: 'Uber', date: daysAgo(1) },
  { id: '3', amount: 1200, category: 'shopping', merchant: 'Amazon', date: daysAgo(1) },
  { id: '4', amount: 350, category: 'food', merchant: 'Swiggy', date: daysAgo(2) },
  { id: '5', amount: 199, category: 'entertainment', merchant: 'Netflix', date: daysAgo(3) },
  { id: '6', amount: 150, category: 'travel', merchant: 'Rapido', date: daysAgo(3) },
  { id: '7', amount: 800, category: 'food', merchant: 'Restaurant', date: daysAgo(4) },
  { id: '8', amount: 2500, category: 'bills', merchant: 'Jio Recharge', date: daysAgo(5) },
  { id: '9', amount: 3200, category: 'shopping', merchant: 'Flipkart', date: daysAgo(6) },
  { id: '10', amount: 600, category: 'food', merchant: 'Dominos', date: daysAgo(7) },
  { id: '11', amount: 180, category: 'travel', merchant: 'Metro', date: daysAgo(8) },
  { id: '12', amount: 499, category: 'entertainment', merchant: 'Spotify', date: daysAgo(10) },
  { id: '13', amount: 950, category: 'food', merchant: 'Starbucks', date: daysAgo(12) },
  { id: '14', amount: 1800, category: 'shopping', merchant: 'Myntra', date: daysAgo(15) },
];
