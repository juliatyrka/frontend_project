import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Podaj poprawny adres e-mail.');
      return;
    }
    if (password.length < 4) {
      setError('Hasło musi mieć co najmniej 4 znaki.');
      return;
    }

    if (mode === 'register') {
      if (name.trim().length < 2) {
        setError('Podaj imię lub nazwę użytkownika (min. 2 znaki).');
        return;
      }
      register(name.trim(), email.trim());
      navigate('/dziennik');
    } else {
      login(email.trim(), role);
      navigate(role === 'ADMIN' ? '/admin' : '/dziennik');
    }
  };

  const handleQuickDemo = (demoRole) => {
    if (demoRole === 'ADMIN') {
      login('admin@nutritrack.pl', 'ADMIN', 'Administrator');
      navigate('/admin');
    } else {
      login('julia@nutritrack.pl', 'USER', 'Julia');
      navigate('/dziennik');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>{mode === 'login' ? 'Logowanie do NutriTrack' : 'Rejestracja konta'}</h2>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            Logowanie
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            Rejestracja
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="form-field">
              <label htmlFor="auth-name">Nazwa użytkownika:</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Julia"
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="auth-email">Adres e-mail:</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="np. user@nutritrack.pl"
            />
          </div>

          <div className="form-field">
            <label htmlFor="auth-password">Hasło:</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 4 znaki"
            />
          </div>

          {mode === 'login' && (
            <div className="form-field">
              <label htmlFor="auth-role">Rola konta (tryb testowy):</label>
              <select
                id="auth-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">USER (Użytkownik)</option>
                <option value="ADMIN">ADMIN (Moderator)</option>
              </select>
            </div>
          )}

          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-add">
            {mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
          </button>
        </form>

        <div className="demo-login-box">
          <p>Szybkie logowanie demonstracyjne:</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn-demo user"
              onClick={() => handleQuickDemo('USER')}
            >
              Wejdź jako USER
            </button>
            <button
              type="button"
              className="btn-demo admin"
              onClick={() => handleQuickDemo('ADMIN')}
            >
              Wejdź jako ADMIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}