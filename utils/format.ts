/**
 * Format a number as Indian Rupee currency string.
 */
export function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

/**
 * Format an ISO date string to a readable format.
 * e.g. "21 Mar" or "Today" / "Yesterday"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[date.getMonth()]}`;
}

/**
 * Format percentage with % suffix.
 */
export function formatPercent(value: number): string {
  return `${Math.min(value, 999)}%`;
}

/**
 * Generate a simple unique ID.
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
