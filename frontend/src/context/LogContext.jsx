import { createContext, useContext, useState, useEffect } from 'react';

const LogContext = createContext();

const INITIAL_CUSTOM_PRODUCTS = [
  {
    id: 'mock-1',
    name: 'Owsianka domowa z bananem',
    calories_100g: 145,
    protein_100g: 4.5,
    carbs_100g: 24.0,
    fat_100g: 3.2,
    status: 'oczekuje',
    source: 'custom',
  },
  {
    id: 'mock-2',
    name: 'Sernik proteinowy domowy',
    calories_100g: 162,
    protein_100g: 14.8,
    carbs_100g: 12.5,
    fat_100g: 5.4,
    status: 'oczekuje',
    source: 'custom',
  },
];

export function LogProvider({ children }) {
  const todayKey = new Date().toISOString().split('T')[0];

  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(`nutritrack_entries_${todayKey}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customProducts, setCustomProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('nutritrack_custom_products');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOM_PRODUCTS;
    } catch {
      return INITIAL_CUSTOM_PRODUCTS;
    }
  });

  const [dailyGoal, setDailyGoal] = useState(() => {
    try {
      const savedGoal = localStorage.getItem('nutritrack_daily_goal');
      return savedGoal ? Number(savedGoal) : 2000;
    } catch {
      return 2000;
    }
  });

  useEffect(() => {
    localStorage.setItem(`nutritrack_entries_${todayKey}`, JSON.stringify(entries));
  }, [entries, todayKey]);

  useEffect(() => {
    localStorage.setItem('nutritrack_custom_products', JSON.stringify(customProducts));
  }, [customProducts]);

  useEffect(() => {
    localStorage.setItem('nutritrack_daily_goal', String(dailyGoal));
  }, [dailyGoal]);

  const updateDailyGoal = (newGoal) => {
    if (newGoal > 0) {
      setDailyGoal(Math.round(newGoal));
    }
  };

  const addEntry = (entryData) => {
    const newEntry = {
      id: Date.now().toString(),
      ...entryData,
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const removeEntry = (entryId) => {
    setEntries((prev) => prev.filter((item) => item.id !== entryId));
  };

  const addCustomProduct = (productData) => {
    const newProduct = {
      id: `custom-${Date.now()}`,
      ...productData,
      status: 'oczekuje',
      source: 'custom',
    };
    setCustomProducts((prev) => [newProduct, ...prev]);
  };

  const approveCustomProduct = (productId) => {
    setCustomProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, status: 'zatwierdzony', source: 'local' } : p
      )
    );
  };

  const rejectCustomProduct = (productId) => {
    setCustomProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <LogContext.Provider
      value={{
        todayKey,
        dailyGoal,
        updateDailyGoal,
        entries,
        addEntry,
        removeEntry,
        customProducts,
        addCustomProduct,
        approveCustomProduct,
        rejectCustomProduct,
      }}
    >
      {children}
    </LogContext.Provider>
  );
}

export const useLog = () => useContext(LogContext);