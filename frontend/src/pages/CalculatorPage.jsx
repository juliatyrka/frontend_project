import { useState } from 'react';
import { useLog } from '../context/LogContext';
import './CalculatorPage.css';

const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Siedzący (brak treningów, praca biurowa)' },
  { value: 1.375, label: 'Lekka aktywność (1–3 treningi w tygodniu)' },
  { value: 1.55, label: 'Umiarkowana aktywność (3–5 treningów w tygodniu)' },
  { value: 1.725, label: 'Wysoka aktywność (6–7 treningów w tygodniu)' },
  { value: 1.9, label: 'Bardzo wysoka aktywność (praca fizyczna + sport)' },
];

const GOAL_MODIFIERS = [
  { id: 'cut', label: 'Redukcja (-300 kcal)', offset: -300 },
  { id: 'maintain', label: 'Utrzymanie wagi (0 kcal)', offset: 0 },
  { id: 'bulk', label: 'Budowa masy (+300 kcal)', offset: 300 },
];

export default function CalculatorPage() {
  const { dailyGoal, updateDailyGoal } = useLog();

  const [gender, setGender] = useState('female');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [pal, setPal] = useState(1.55);
  const [goalType, setGoalType] = useState('maintain');

  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [savedMsg, setSavedMsg] = useState('');

  const validate = () => {
    const nextErrors = {};
    const ageNum = Number(age);
    const weightNum = Number(weight);
    const heightNum = Number(height);

    if (!age || Number.isNaN(ageNum) || ageNum < 14 || ageNum > 100) {
      nextErrors.age = 'Podaj wiek z przedziału 14–100 lat.';
    }
    if (!weight || Number.isNaN(weightNum) || weightNum < 35 || weightNum > 250) {
      nextErrors.weight = 'Podaj wagę z przedziału 35–250 kg.';
    }
    if (!height || Number.isNaN(heightNum) || heightNum < 120 || heightNum > 230) {
      nextErrors.height = 'Podaj wzrost z przedziału 120–230 cm.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    setSavedMsg('');

    if (!validate()) return;

    const ageNum = Number(age);
    const weightNum = Number(weight);
    const heightNum = Number(height);

    // Wzór Mifflin-St Jeor
    const baseBmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum;
    const bmr = Math.round(gender === 'male' ? baseBmr + 5 : baseBmr - 161);
    const tdee = Math.round(bmr * Number(pal));

    const modifier = GOAL_MODIFIERS.find((g) => g.id === goalType)?.offset || 0;
    const targetCalories = Math.max(1200, tdee + modifier);

    setResult({ bmr, tdee, targetCalories });
  };

  const handleApplyGoal = () => {
    if (!result) return;
    updateDailyGoal(result.targetCalories);
    setSavedMsg(
      `Zaktualizowano Twój dzienny cel kaloryczny na ${result.targetCalories} kcal!`
    );
  };

  return (
    <div className="page-container">
      <h2>Kalkulator zapotrzebowania (BMR / TDEE)</h2>
      <p className="calc-subtitle">
        Obliczenia oparte o wzór <strong>Mifflin-St Jeor</strong>. Aktualny cel w dzienniku:{' '}
        <strong>{dailyGoal} kcal</strong>.
      </p>

      <form className="calc-form" onSubmit={handleCalculate} noValidate>
        <div className="calc-grid">
          <div className="form-field">
            <label htmlFor="calc-gender">Płeć:</label>
            <select
              id="calc-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="female">Kobieta</option>
              <option value="male">Mężczyzna</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="calc-age">Wiek (lata):</label>
            <input
              id="calc-age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="np. 25"
            />
            {errors.age && <span className="field-error">{errors.age}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="calc-weight">Waga (kg):</label>
            <input
              id="calc-weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="np. 60"
            />
            {errors.weight && <span className="field-error">{errors.weight}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="calc-height">Wzrost (cm):</label>
            <input
              id="calc-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="np. 168"
            />
            {errors.height && <span className="field-error">{errors.height}</span>}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="calc-pal">Poziom aktywności (PAL):</label>
          <select
            id="calc-pal"
            value={pal}
            onChange={(e) => setPal(Number(e.target.value))}
          >
            {ACTIVITY_LEVELS.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>
                {lvl.label} (×{lvl.value})
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="calc-goal-type">Cel sylwetkowy:</label>
          <select
            id="calc-goal-type"
            value={goalType}
            onChange={(e) => setGoalType(e.target.value)}
          >
            {GOAL_MODIFIERS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-add">
          Oblicz zapotrzebowanie
        </button>
      </form>

      {result && (
        <section className="calc-result-card" aria-live="polite">
          <h3>Twoje wyniki</h3>
          <div className="result-metrics">
            <div className="metric-box">
              <span className="metric-label">BMR (podstawowe)</span>
              <strong className="metric-value">{result.bmr} kcal</strong>
            </div>
            <div className="metric-box">
              <span className="metric-label">TDEE (całkowite)</span>
              <strong className="metric-value">{result.tdee} kcal</strong>
            </div>
            <div className="metric-box highlight">
              <span className="metric-label">Sugerowany cel</span>
              <strong className="metric-value">{result.targetCalories} kcal</strong>
            </div>
          </div>

          <button
            type="button"
            className="btn-apply-goal"
            onClick={handleApplyGoal}
          >
            Ustaw {result.targetCalories} kcal jako mój cel
          </button>

          {savedMsg && <p className="status-text success">{savedMsg}</p>}
        </section>
      )}
    </div>
  );
}