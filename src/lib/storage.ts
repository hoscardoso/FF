import type { CardUsage, Purchase } from '@/types';

const HISTORY_KEY = 'cc_history';
const PURCHASES_KEY = 'cc_purchases';

export function loadHistory(): CardUsage[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as CardUsage[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: CardUsage[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

export function loadPurchases(): Purchase[] {
  try {
    const raw = localStorage.getItem(PURCHASES_KEY);
    return raw ? (JSON.parse(raw) as Purchase[]) : [];
  } catch {
    return [];
  }
}

export function savePurchases(items: Purchase[]): void {
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(items));
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function seedIfEmpty(): {
  history: CardUsage[];
  purchases: Purchase[];
} {
  return {
    history: [],
    purchases: [],
  };
}
