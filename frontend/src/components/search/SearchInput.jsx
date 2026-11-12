export default function SearchInput({ value, onChange }) {
  return (
    <div className="search-field">
      <label htmlFor="product-search-input" className="sr-only">
        Nazwa produktu
      </label>
      <input
        id="product-search-input"
        type="text"
        placeholder="Wpisz nazwę produktu (np. Mleko, Skyr, Owsianka)..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />
    </div>
  );
}