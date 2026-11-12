import { useLog } from '../context/LogContext';
import './DailyLogView.css';

const MEAL_GROUPS = [
  'Śniadanie',
  'Drugie śniadanie',
  'Obiad',
  'Kolacja',
  'Przekąska',
];

const roundOne = (val) => Math.round(val * 10) / 10;

export default function DailyLogView() {
  const { todayKey, dailyGoal, entries, removeEntry } = useLog();

  const totals = entries.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: roundOne(acc.protein + (item.protein_g || 0)),
      carbs: roundOne(acc.carbs + (item.carbs_g || 0)),
      fat: roundOne(acc.fat + (item.fat_g || 0)),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const progressPercent = Math.min(
    Math.round((totals.calories / dailyGoal) * 100),
    100
  );
  const isOverGoal = totals.calories > dailyGoal;

  return (
    <section className="daily-log-section" aria-labelledby="diary-heading">
      <div className="diary-header">
        <h2 id="diary-heading">Dziennik posiłków ({todayKey})</h2>
      </div>

      {/* Pasek postępu i podsumowanie makro */}
      <div className="summary-card">
        <div className="kcal-row">
          <span>Bilans kaloryczny:</span>
          <strong>
            {totals.calories} / {dailyGoal} kcal ({progressPercent}%)
          </strong>
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={totals.calories}
          aria-valuemin={0}
          aria-valuemax={dailyGoal}
        >
          <div
            className={`progress-fill ${isOverGoal ? 'over' : ''}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="macros-summary">
          <span>🍗 Białko: <strong>{totals.protein} g</strong></span>
          <span>🍞 Węglowodany: <strong>{totals.carbs} g</strong></span>
          <span>🥑 Tłuszcze: <strong>{totals.fat} g</strong></span>
        </div>
      </div>

      {/* Wpisy pogrupowane po posiłkach */}
      <div className="meals-grid">
        {MEAL_GROUPS.map((mealName) => {
          const mealEntries = entries.filter((e) => e.meal_type === mealName);
          const mealKcal = mealEntries.reduce((sum, e) => sum + e.calories, 0);

          return (
            <div key={mealName} className="meal-group-card">
              <div className="meal-group-header">
                <h3>{mealName}</h3>
                <span className="meal-kcal">{mealKcal} kcal</span>
              </div>

              {mealEntries.length === 0 ? (
                <p className="empty-meal">Brak wpisów</p>
              ) : (
                <ul className="meal-entries-list">
                  {mealEntries.map((entry) => (
                    <li key={entry.id} className="meal-entry-item">
                      <div className="entry-info">
                        <strong>{entry.product_name}</strong>
                        <span className="entry-details">
                          {entry.weight_g}g • {entry.calories} kcal (B: {entry.protein_g}g, W: {entry.carbs_g}g, T: {entry.fat_g}g)
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-delete"
                        aria-label={`Usuń ${entry.product_name}`}
                        onClick={() => removeEntry(entry.id)}
                      >
                        Usuń
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}