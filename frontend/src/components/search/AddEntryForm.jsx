import { useState } from 'react';
import { localApi } from '../../services/api';
import { useLog } from '../../context/LogContext';

const roundToOneDecimal = (val) => Math.round(Number(val) * 10) / 10;

export default function AddEntryForm({ product, onSuccess, onCancel }) {
  const { addEntry } = useLog();
  const [weight, setWeight] = useState('100');
  const [mealType, setMealType] = useState('Śniadanie');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedWeight = Number(weight);
  const isWeightEmpty = weight.trim() === '';

  let weightError = null;
  if (isWeightEmpty) {
    weightError = 'Podaj wagę produktu.';
  } else if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
    weightError = 'Waga musi być większa od 0 g.';
  } else if (parsedWeight > 2000) {
    weightError = 'Maksymalna waga to 2000 g.';
  }

  const isFormValid = !weightError && !isSubmitting;

  const calcMacro = (valPer100g) => {
    if (valPer100g === null || weightError) return '—';
    return roundToOneDecimal((valPer100g * parsedWeight) / 100);
  };

  const calcKcal = (kcalPer100g) => {
    if (kcalPer100g === null) return 'brak danych';
    if (weightError) return '—';
    return `${Math.round((kcalPer100g * parsedWeight) / 100)} kcal`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    const finalWeight = Math.round(parsedWeight);
    const factor = finalWeight / 100;

    const entryPayload = {
      product_name: product.name,
      meal_type: mealType,
      weight_g: finalWeight,
      calories: product.calories_100g !== null ? Math.round(product.calories_100g * factor) : 0,
      protein_g: roundToOneDecimal(product.protein_100g * factor),
      carbs_g: roundToOneDecimal(product.carbs_100g * factor),
      fat_g: roundToOneDecimal(product.fat_100g * factor),
    };

    // Zapis do stanu lokalnego (działa zawsze, nawet bez odpalonego backendu)
    addEntry(entryPayload);

    // Opcjonalna synchronizacja z backendem w tle
    try {
      await localApi.post('/api/logs/entry', {
        user_id: 1,
        product_name: product.name,
        calories_100g: product.calories_100g ?? 0,
        protein_100g: product.protein_100g,
        carbs_100g: product.carbs_100g,
        fat_100g: product.fat_100g,
        meal_type: mealType,
        weight_g: finalWeight,
      });
    } catch {
      console.info('Zapisano lokalnie (backend offline).');
    }

    setIsSubmitting(false);
    onSuccess(`Dodano ${finalWeight}g „${product.name}” (${mealType}).`);
  };

  return (
    <form className="add-meal-box" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`meal-select-${product.uniqueKey}`}>Posiłek:</label>
          <select
            id={`meal-select-${product.uniqueKey}`}
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            disabled={isSubmitting}
          >
            <option>Śniadanie</option>
            <option>Drugie śniadanie</option>
            <option>Obiad</option>
            <option>Kolacja</option>
            <option>Przekąska</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor={`weight-input-${product.uniqueKey}`}>Waga (g):</label>
          <input
            id={`weight-input-${product.uniqueKey}`}
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            min="1"
            max="2000"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {weightError && (
        <p className="field-error" role="alert">
          {weightError}
        </p>
      )}

      <div className="calculated-macros">
        <span>Wartość dla {weightError ? '—' : `${Math.round(parsedWeight)}g`}:</span>
        <strong>{calcKcal(product.calories_100g)}</strong>
        <span>• B: {calcMacro(product.protein_100g)}g</span>
        <span>• W: {calcMacro(product.carbs_100g)}g</span>
        <span>• T: {calcMacro(product.fat_100g)}g</span>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-add" disabled={!isFormValid}>
          {isSubmitting ? 'Zapisywanie...' : 'Dodaj do dziennika'}
        </button>
        <button
          type="button"
          className="btn-cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Anuluj
        </button>
      </div>
    </form>
  );
}