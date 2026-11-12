import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogProvider } from './context/LogContext';
import ProtectedRoute from './components/ProtectedRoute';
import DiaryPage from './pages/DiaryPage';
import NewProductPage from './pages/NewProductPage';
import CalculatorPage from './pages/CalculatorPage';
import AdminModerationPage from './pages/AdminModerationPage';
import AuthPage from './pages/AuthPage';
import './AppLayout.css';

function AppShell() {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <span className="brand-logo">🥗 NutriTrack</span>

          {user && (
            <nav aria-label="Główna nawigacja" className="main-nav">
              <NavLink
                to="/dziennik"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Dziennik
              </NavLink>
              <NavLink
                to="/produkty/nowy"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                + Nowy produkt
              </NavLink>
              <NavLink
                to="/kalkulator"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Kalkulator
              </NavLink>
              {user.role === 'ADMIN' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  Moderacja
                </NavLink>
              )}
            </nav>
          )}

          {user && (
            <div className="user-controls">
              <span className={`role-badge ${user.role.toLowerCase()}`}>
                {user.name} ({user.role})
              </span>
              <button type="button" className="btn-logout" onClick={logout}>
                Wyloguj
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<AuthPage />} />

          <Route
            path="/dziennik"
            element={
              <ProtectedRoute>
                <DiaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/produkty/nowy"
            element={
              <ProtectedRoute>
                <NewProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kalkulator"
            element={
              <ProtectedRoute>
                <CalculatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminModerationPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to={user ? '/dziennik' : '/login'} replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LogProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </LogProvider>
    </AuthProvider>
  );
}