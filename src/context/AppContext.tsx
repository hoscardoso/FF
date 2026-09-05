import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { CardUsage, Purchase } from '@/types';
import {
  loadHistory,
  saveHistory,
  loadPurchases,
  savePurchases,
  seedIfEmpty,
  uid,
} from '@/lib/storage';

interface AppContextValue {
  history: CardUsage[];
  purchases: Purchase[];
  addHistory: (item: Omit<CardUsage, 'id' | 'createdAt'>) => void;
  updateHistory: (id: string, item: Partial<CardUsage>) => void;
  deleteHistory: (id: string) => void;
  addPurchase: (item: Omit<Purchase, 'id' | 'createdAt'>) => void;
  addPurchases: (items: Omit<Purchase, 'id' | 'createdAt'>[]) => void;
  updatePurchase: (id: string, item: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<CardUsage[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const seeded = seedIfEmpty();
    setHistory(seeded.history);
    setPurchases(seeded.purchases);
  }, []);

  const addHistory = useCallback((item: Omit<CardUsage, 'id' | 'createdAt'>) => {
    setHistory((prev) => {
      const next = [...prev, { ...item, id: uid(), createdAt: new Date().toISOString() }];
      saveHistory(next);
      return next;
    });
  }, []);

  const updateHistory = useCallback((id: string, item: Partial<CardUsage>) => {
    setHistory((prev) => {
      const next = prev.map((h) => (h.id === id ? { ...h, ...item } : h));
      saveHistory(next);
      return next;
    });
  }, []);

  const deleteHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const addPurchase = useCallback((item: Omit<Purchase, 'id' | 'createdAt'>) => {
    setPurchases((prev) => {
      const next = [...prev, { ...item, id: uid(), createdAt: new Date().toISOString() }];
      savePurchases(next);
      return next;
    });
  }, []);

  const addPurchases = useCallback((items: Omit<Purchase, 'id' | 'createdAt'>[]) => {
    setPurchases((prev) => {
      const next = [
        ...prev,
        ...items.map((item) => ({
          ...item,
          id: uid(),
          createdAt: new Date().toISOString(),
        })),
      ];
      savePurchases(next);
      return next;
    });
  }, []);

  const updatePurchase = useCallback((id: string, item: Partial<Purchase>): void => {
    setPurchases((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...item } : p));
      savePurchases(next);
      return next;
    });
  }, []);

  const deletePurchase = useCallback((id: string) => {
    setPurchases((prev) => {
      const next = prev.filter((p) => p.id !== id);
      savePurchases(next);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        history,
        purchases,
        addHistory,
        updateHistory,
        deleteHistory,
        addPurchase,
        addPurchases,
        updatePurchase,
        deletePurchase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
