import AddEntryForm from './AddEntryForm';

const SOURCE_LABELS = {
  local: 'Baza lokalna',
  openfoodfacts: 'Open Food Facts',
  custom: 'Własny (oczekuje)',
};

export default function ResultsList({
  results,
  selectedProduct,
  onSelectProduct,
  onEntryAdded,
  onCancelSelect,
}) {
  if (results.length === 0) return null;

  return (
    <ul className="results-list">
      {results.map((product) => {
        const isSelected = selectedProduct?.uniqueKey === product.uniqueKey;

        return (
          <li
            key={product.uniqueKey}
            className={`result-card ${isSelected ? 'selected' : ''}`}
          >
            <button
              type="button"
              className="result-select-btn"
              aria-expanded={isSelected}
              onClick={() => onSelectProduct(product)}
            >
              <div className="product-header">
                <strong className="product-name">{product.name}</strong>
                <span className={`badge ${product.source}`}>
                  {SOURCE_LABELS[product.source] || product.source}
                </span>
              </div>

              <div className="product-macros">
                <span>
                  🔥{' '}
                  {product.calories_100g !== null
                    ? `${product.calories_100g} kcal`
                    : 'brak danych'}
                </span>
                <span>🍗 B: {product.protein_100g}g</span>
                <span>🍞 W: {product.carbs_100g}g</span>
                <span>🥑 T: {product.fat_100g}g</span>
                <span className="per-100g">(w 100g)</span>
              </div>
            </button>

            {isSelected && (
              <AddEntryForm
                product={product}
                onSuccess={onEntryAdded}
                onCancel={onCancelSelect}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}