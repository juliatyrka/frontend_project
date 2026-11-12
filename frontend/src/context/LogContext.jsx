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

  const dailyGoal = 2000;

  useEffect(() => {
    localStorage.setItem(`nutritrack_entries_${todayKey}`, JSON.stringify(entries));
  }, [entries, todayKey]);

  useEffect(() => {
    localStorage.setItem('nutritrack_custom_products', JSON.stringify(customProducts));
  }, [customProducts]);

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

  return (
    <LogContext.Provider
      value={{
        todayKey,
        dailyGoal,
        entries,
        addEntry,
        removeEntry,
        customProducts,
        addCustomProduct,
      }}
    >
      {children}
    </LogContext.Provider>
  );
}

export const useLog = () => useContext(LogContext);