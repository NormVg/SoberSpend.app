import { CATEGORIES } from '@/constants/categories';

/**
 * Match a merchant name to a category using keyword-based rules.
 * Falls back to 'other' if no match is found.
 */
export function categorize(merchant: string): string {
  const lower = merchant.toLowerCase().trim();

  for (const cat of CATEGORIES) {
    for (const keyword of cat.keywords) {
      if (lower.includes(keyword)) {
        return cat.id;
      }
    }
  }

  return 'other';
}

/**
 * MCC Code ranges → category mapping
 *
 * 5411–5499  → food (Grocery Stores & Food Shops)
 * 5812–5814  → food (Restaurants & Fast Food)
 * 5000–5599  → shopping (General Retail)
 * 7300–7999  → entertainment (Business & Misc Services, includes cinemas)
 * 4000–4799  → travel (Transportation & Travel)
 * 4900       → bills (Utilities)
 * 5541       → travel (Fuel / Petrol)
 * 5912       → bills (Pharmacy)
 */
export function categorizeMCC(mcc: string): string {
  const code = parseInt(mcc, 10);
  if (isNaN(code)) return 'other';

  // Food — grocery stores & food shops
  if (code >= 5411 && code <= 5499) return 'food';
  // Food — restaurants & fast food
  if (code >= 5812 && code <= 5814) return 'food';

  // Travel — transportation
  if (code >= 4000 && code <= 4799) return 'travel';
  // Travel — fuel
  if (code === 5541 || code === 5542) return 'travel';

  // Entertainment — cinemas, theaters, services
  if (code >= 7300 && code <= 7999) return 'entertainment';

  // Bills — utilities
  if (code >= 4800 && code <= 4999) return 'bills';
  // Bills — pharmacy
  if (code === 5912) return 'bills';
  // Bills — insurance
  if (code >= 6300 && code <= 6399) return 'bills';

  // Shopping — general retail
  if (code >= 5000 && code <= 5799) return 'shopping';

  return 'other';
}
