import { useState } from 'react';
import { useLog } from '../context/LogContext';
import './AdminModerationPage.css';

export default function AdminModerationPage() {
  const { customProducts, approveCustomProduct, rejectCustomProduct } = useLog();
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const pendingProducts = customProducts.filter((p) => p.status === 'oczekuje');

  const handleApprove = (product) => {
    approveCustomProduct(product.id);
    setFeedbackMsg(`Zatwierdzono produkt „${product.name}” — dodano do bazy publicznej.`);
  };

  const handleReject = (product) => {
    rejectCustomProduct(product.id);
    setFeedbackMsg(`Odrzucono i usunięto zgłoszenie „${product.name}”.`);
  };

  return (
    <div className="page-container">
      <div className="admin-header">
        <h2>Panel moderacji produktów</h2>
        <span className="pending-counter">
          Oczekujące: <strong>{pendingProducts.length}</strong>
        </span>
      </div>

      <p className="admin-subtitle">
        Zweryfikuj poprawność kalorii i makroskładników (na 100 g) zgłoszonych przez użytkowników.
      </p>

      <div aria-live="polite" className="status-region">
        {feedbackMsg && <p className="status-text success">{feedbackMsg}</p>}
      </div>

      {pendingProducts.length === 0 ? (
        <div className="empty-moderation-card">
          <p>🎉 Brak produktów oczekujących na weryfikację!</p>
          <span>Wszystkie zgłoszenia zostały rozpatrzone.</span>
        </div>
      ) : (
        <ul className="moderation-list">
          {pendingProducts.map((product) => (
            <li key={product.id} className="moderation-card">
              <div className="moderation-info">
                <div className="moderation-title-row">
                  <strong>{product.name}</strong>
                  <span className="badge custom">Status: {product.status}</span>
                </div>

                <div className="product-macros">
                  <span>🔥 {product.calories_100g} kcal</span>
                  <span>🍗 B: {product.protein_100g}g</span>
                  <span>🍞 W: {product.carbs_100g}g</span>
                  <span>🥑 T: {product.fat_100g}g</span>
                  <span className="per-100g">(w 100g)</span>
                </div>
              </div>

              <div className="moderation-actions">
                <button
                  type="button"
                  className="btn-approve"
                  onClick={() => handleApprove(product)}
                >
                  ✓ Zatwierdź
                </button>
                <button
                  type="button"
                  className="btn-reject"
                  onClick={() => handleReject(product)}
                >
                  ✕ Odrzuć
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}