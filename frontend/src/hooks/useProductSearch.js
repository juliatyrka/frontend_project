import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { localApi, offApi } from '../services/api';
import { useLog } from '../context/LogContext';

const roundToOneDecimal = (val) => {
  if (val === undefined || val === null || Number.isNaN(Number(val))) return 0;
  return Math.round(Number(val) * 10) / 10;
};

export function useProductSearch(query) {
  const { customProducts } = useLog();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const [noResults, setNoResults] = useState(false);

  const fetchProducts = useCallback(
    async (searchTerm, signal) => {
      setIsLoading(true);
      setNetworkError(null);
      setNoResults(false);

      let localProducts = [];
      let offProducts = [];
      let localFailed = false;
      let offFailed = false;

      // 0. Filtrowanie własnych produktów z mocka/localStorage
      const matchingCustom = customProducts
        .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((p) => ({
          ...p,
          uniqueKey: `custom-${p.id}`,
        }));

      // 1. Pobieranie z lokalnego backendu
      try {
        const localRes = await localApi.get('/api/products', {
          params: { search: searchTerm },
          signal,
        });
        localProducts = localRes.data.map((p) => ({
          ...p,
          uniqueKey: `local-${p.id}`,
          source: 'local',
        }));
      } catch (err) {
        if (axios.isCancel(err)) return;
        localFailed = true;
      }

      // 2. Pobieranie z Open Food Facts
      try {
        const offRes = await offApi.get('/cgi/search.pl', {
          params: {
            search_terms: searchTerm,
            search_simple: 1,
            action: 'process',
            json: 1,
            page_size: 5,
          },
          signal,
        });

        offProducts = (offRes.data.products || [])
          .filter((p) => p.product_name)
          .map((p) => {
            const rawKcal = p.nutriments?.['energy-kcal_100g'];
            const hasKcal = rawKcal !== undefined && rawKcal !== null && rawKcal !== '';

            return {
              id: p.code,
              uniqueKey: `off-${p.code}`,
              name: p.product_name,
              calories_100g: hasKcal ? Math.round(Number(rawKcal)) : null,
              protein_100g: roundToOneDecimal(p.nutriments?.proteins_100g),
              carbs_100g: roundToOneDecimal(p.nutriments?.carbohydrates_100g),
              fat_100g: roundToOneDecimal(p.nutriments?.fat_100g),
              source: 'openfoodfacts',
            };
          });
      } catch (err) {
        if (axios.isCancel(err)) return;
        offFailed = true;
      }

      if (signal?.aborted) return;

      const combined = [...matchingCustom, ...localProducts, ...offProducts];
      setResults(combined);

      if (localFailed && offFailed && matchingCustom.length === 0) {
        setNetworkError('Błąd połączenia z serwerem i bazą produktów.');
      } else if (combined.length === 0) {
        setNoResults(true);
      }

      setIsLoading(false);
    },
    [customProducts]
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setNetworkError(null);
      setNoResults(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchProducts(trimmed, controller.signal);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, fetchProducts]);

  const retry = () => {
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      fetchProducts(trimmed);
    }
  };

  return { results, setResults, isLoading, networkError, noResults, retry };
}