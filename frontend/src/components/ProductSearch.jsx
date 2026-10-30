import { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductSearch.css';

export default function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stan dla wybranego produktu i formularza dodawania do dziennika
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [weight, setWeight] = useState(100);
  const [mealType, setMealType] = useState('Śniadanie');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Opóźnienie zapytania (Debounce 300ms)
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchProducts(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const fetchProducts = async (searchTerm) => {
    setIsLoading(true);
    setError(null);
    let localProducts = [];
    let offProducts = [];

    // 1. Pobieranie z lokalnego API FastAPI
    try {
      const localResponse = await axios.get(
        `http://localhost:8000/api/products?search=${searchTerm}`
      );
      localProducts = localResponse.data.map((p) => ({
        ...p,
        source: 'local',
      }));
    } catch (err) {
      console.warn('Backend API jest niedostępny lub zwrócił błąd:', err);
    }

    // 2. Pobieranie z zewnętrznego API Open Food Facts
    try {
      const offResponse = await axios.get(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchTerm}&search_simple=1&action=process&json=1&page_size=5`
      );
      offProducts = (offResponse.data.products || [])
        .filter((p) => p.product_name)
        .map((p) => ({
          id: p.code,
          name: p.product_name,
          calories_100g: Math.round(p.nutriments['energy-kcal_100g'] || 0),
          protein_100g: Math.round(p.nutriments.proteins_100g || 0),
          carbs_100g: Math.round(p.nutriments.carbohydrates_100g || 0),
          fat_100g: Math.round(p.nutriments.fat_100g || 0),
          source: 'openfoodfacts',
        }));
    } catch (err) {
      console.error('Błąd Open Food Facts API:', err);
    }

    const combinedResults = [...localProducts, ...offProducts];
    setResults(combinedResults);

    if (combinedResults.length === 0 && localProducts.length === 0 && offProducts.length === 0) {
      setError('Nie znaleziono produktów spełniających kryteria.');
    }

    setIsLoading(false);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSuccessMsg('');
  };

  const handleAddMeal = async () => {
    if (!selectedProduct || weight <= 0) return;

    try {
      await axios.post('http://localhost:8000/api/logs/entry', {
        user_id: 1,
        product_name: selectedProduct.name,
        calories_100g: selectedProduct.calories_100g,
        protein_100g: selectedProduct.protein_100g,
        carbs_100g: selectedProduct.carbs_100g,
        fat_100g: selectedProduct.fat_100g,
        meal_type: mealType,
        weight_g: parseInt(weight, 10),
      });

      setSuccessMsg(`Dodano ${weight}g "${selectedProduct.name}" do posiłku: ${mealType}!`);
      setSelectedProduct(null);
      setQuery('');
      setResults([]);
    } catch (err) {
      console.error('Błąd podczas zapisywania posiłku:', err);
      setError('Nie udało się zapisać posiłku w dzienniku.');
    }
  };

  return (
    <div className="search-container">
      <h2>Wyszukaj i dodaj produkt</h2>
      <input
        type="text"
        placeholder="Wpisz nazwę produktu (np. Mleko, Skyr)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />

      {isLoading && <p className="status-text">Szukam...</p>}
      {error && <p className="status-text error">{error}</p>}
      {successMsg && <p className="status-text success">{successMsg}</p>}

      {/* Formularz wprowadzania gramatury po wybraniu produktu */}
      {selectedProduct && (
        <div className="add-meal-box">
          <h3>Wybrano: {selectedProduct.name}</h3>
          <div className="form-group">
            <label>Posiłek: </label>
            <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
              <option>Śniadanie</option>
              <option>Drugie śniadanie</option>
              <option>Obiad</option>
              <option>Kolacja</option>
              <option>Przekąska</option>
            </select>
          </div>

          <div className="form-group">
            <label>Waga (g): </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="1"
            />
          </div>

          <p className="calculated-macros">
            Wartość dla {weight}g:{' '}
            <strong>
              {Math.round((selectedProduct.calories_100g * weight) / 100)} kcal
            </strong>
          </p>

          <button onClick={handleAddMeal} className="btn-add">
            Dodaj do dziennika
          </button>
          <button onClick={() => setSelectedProduct(null)} className="btn-cancel">
            Anuluj
          </button>
        </div>
      )}

      {/* Lista wyników wyszukiwania */}
      <ul className="results-list">
        {results.map((product) => (
          <li
            key={`${product.source}-${product.id}`}
            className="result-item"
            onClick={() => handleSelectProduct(product)}
          >
            <div className="product-header">
              <strong>{product.name}</strong>
              <span className={`badge ${product.source}`}>
                {product.source === 'local' ? 'Baza lokalna' : 'Open Food Facts'}
              </span>
            </div>
            <div className="product-macros">
              <span>🔥 {product.calories_100g} kcal</span>
              <span>🍗 B: {product.protein_100g}g</span>
              <span>🍞 W: {product.carbs_100g}g</span>
              <span>🥑 T: {product.fat_100g}g</span>
              <span className="per-100g">(w 100g)</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}