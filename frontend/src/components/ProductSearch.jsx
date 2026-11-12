import { useState } from 'react';
import { useProductSearch } from '../hooks/useProductSearch';
import SearchInput from './search/SearchInput';
import ResultsList from './search/ResultsList';
import './ProductSearch.css';

export default function ProductSearch() {
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const { results, setResults, isLoading, networkError, noResults, retry } =
    useProductSearch(query);

  const handleSelectProduct = (product) => {
    setSelectedProduct((prev) =>
      prev?.uniqueKey === product.uniqueKey ? null : product
    );
    setSuccessMsg('');
  };

  const handleEntryAdded = (msg) => {
    setSuccessMsg(msg);
    setSelectedProduct(null);
    setQuery('');
    setResults([]);
  };

  return (
    <section className="search-section" aria-labelledby="search-heading">
      <h2 id="search-heading">Wyszukaj i dodaj produkt</h2>

      <SearchInput value={query} onChange={setQuery} />

      <div aria-live="polite" className="status-region">
        {isLoading && <p className="status-text">Szukam...</p>}

        {networkError && (
          <div className="status-box error">
            <p>{networkError}</p>
            <button type="button" onClick={retry} className="btn-retry">
              Spróbuj ponownie
            </button>
          </div>
        )}

        {noResults && !isLoading && !networkError && (
          <p className="status-text">Brak wyników dla podanej frazy.</p>
        )}

        {successMsg && <p className="status-text success">{successMsg}</p>}
      </div>

      <ResultsList
        results={results}
        selectedProduct={selectedProduct}
        onSelectProduct={handleSelectProduct}
        onEntryAdded={handleEntryAdded}
        onCancelSelect={() => setSelectedProduct(null)}
      />
    </section>
  );
}