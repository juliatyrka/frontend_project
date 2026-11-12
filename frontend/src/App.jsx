import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { LogProvider } from './context/LogContext';
import DiaryPage from './pages/DiaryPage';
import NewProductPage from './pages/NewProductPage';
import './AppLayout.css';

export default function App() {
  return (
    <LogProvider>
      <BrowserRouter>
        <header className="app-header">
          <div className="header-inner">
            <span className="brand-logo">🥗 NutriTrack</span>
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
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dziennik" replace />} />
            <Route path="/dziennik" element={<DiaryPage />} />
            <Route path="/produkty/nowy" element={<NewProductPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </LogProvider>
  );
}