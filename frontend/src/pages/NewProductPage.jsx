import { useState } from 'react';
import { useLog } from '../context/LogContext';
import './NewProductPage.css';

export default function NewProductPage() {
  const { customProducts, addCustomProduct } = useLog();

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const validate = () => {
    const nextErrors = {};
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      nextErrors.name = 'Nazwa produktu musi mieć co najmniej 2 znaki.';
    }

    const kcalNum = Number(calories);
    if (calories === '' || Number.isNaN(kcalNum) || kcalNum < 0 || kcalNum > 900) {
      nextErrors.calories = 'Kalorie muszą mieścić się w przedziale 0–900 kcal.';
    }

    const pNum = Number(protein);
    const cNum = Number(carbs);
    const fNum = Number(fat);

    if (protein === '' || Number.isNaN(pNum) || pNum < 0 || pNum > 100) {
      nextErrors.protein = 'Białko musi wynosić 0–100 g.';
    }
    if (carbs === '' || Number.isNaN(cNum) || cNum < 0 || cNum > 100) {
      nextErrors.carbs = 'Węglowodany muszą wynosić 0–100 g.';
    }
    if (fat === '' || Number.isNaN(fNum) || fNum < 0 || fNum > 100) {
      nextErrors.fat = 'Tłuszcze muszą wynosić 0–100 g.';
    }

    if (!nextErrors.protein && !nextErrors.carbs && !nextErrors.fat) {
      if (pNum + cNum + fNum > 100) {
        nextErrors.macroSum = `Suma makroskładników (B + W + T = ${(pNum + cNum + fNum).toFixed(1)} g) nie może przekraczać 100 g.`;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('');

    if (!validate()) return;

    addCustomProduct({
      name: name.trim(),
      calories_100g: Math.round(Number(calories)),
      protein_100g: Math.round(Number(protein) * 10) / 10,
      carbs_100g: Math.round(Number(carbs) * 10) / 10,
      fat_100g: Math.round(Number(fat) * 10) / 10,
    });

    setSuccessMsg(
      `Produkt „${name.trim()}” został zapisany (status: oczekuje na akceptację). Możesz go już wyszukać w dzienniku!`
    );
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setErrors({});
  };

  return (
    <div className="page-container">
      <h2>Dodaj własny produkt (wartości na 100 g)</h2>

      <form className="custom-product-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="custom-name">Nazwa produktu:</label>
          <input
            id="custom-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="np. Twaróg półtłusty"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="custom-kcal">Kalorie (kcal / 100 g):</label>
          <input
            id="custom-kcal"
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="0 - 900"
          />
          {errors.calories && <span className="field-error">{errors.calories}</span>}
        </div>

        <div className="macro-inputs-grid">
          <div className="form-field">
            <label htmlFor="custom-protein">Białko (g):</label>
            <input
              id="custom-protein"
              type="number"
              step="0.1"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="0 - 100"
            />
            {errors.protein && <span className="field-error">{errors.protein}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="custom-carbs">Węglowodany (g):</label>
            <input
              id="custom-carbs"
              type="number"
              step="0.1"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              placeholder="0 - 100"
            />
            {errors.carbs && <span className="field-error">{errors.carbs}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="custom-fat">Tłuszcze (g):</label>
            <input
              id="custom-fat"
              type="number"
              step="0.1"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              placeholder="0 - 100"
            />
            {errors.fat && <span className="field-error">{errors.fat}</span>}
          </div>
        </div>

        {errors.macroSum && (
          <p className="field-error" role="alert">
            {errors.macroSum}
          </p>
        )}

        <button type="submit" className="btn-add">
          Zapisz produkt
        </button>
      </form>

      <div aria-live="polite">
        {successMsg && <p className="status-text success">{successMsg}</p>}
      </div>

      {/* Lista dodanych własnych produktów */}
      <section className="custom-list-section">
        <h3>Twoje dodane produkty</h3>
        <ul className="results-list">
          {customProducts.map((p) => (
            <li key={p.id} className="result-card">
              <div className="result-select-btn" style={{ cursor: 'default' }}>
                <div className="product-header">
                  <strong>{p.name}</strong>
                  <span className="badge custom">Status: {p.status}</span>
                </div>
                <div className="product-macros">
                  <span>🔥 {p.calories_100g} kcal</span>
                  <span>🍗 B: {p.protein_100g}g</span>
                  <span>🍞 W: {p.carbs_100g}g</span>
                  <span>🥑 T: {p.fat_100g}g</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}