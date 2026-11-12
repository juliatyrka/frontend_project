# 🥗 NutriTrack

Dla osób dbających o zdrowie i sylwetkę, które chcą precyzyjnie kontrolować dzienny bilans kaloryczny i makroskładniki bez marnowania czasu na skomplikowane interfejsy.

## O projekcie

NutriTrack to intuicyjna aplikacja webowa służąca do kompleksowego prowadzenia dziennika odżywiania. Użytkownik może wyznaczyć swój dzienny cel kaloryczny i cele makroskładników (białka, węglowodany, tłuszcze), przeliczać wartości odżywcze posiłków oraz na bieżąco monitorować, ile kalorii pozostało mu do końca dnia. W odróżnieniu od komercyjnych alternatyw (jak MyFitnessPal), aplikacja oferuje przejrzysty interfejs bez reklam oraz unikalną możliwość zgłaszania własnych produktów do ogólnodostępnej bazy po weryfikacji przez administratora.

**Temat:** B (własny pomysł)

## Zespół

| Osoba | GitHub | Część projektu | Issues |
| :--- | :--- | :--- | :--- |
| **Julia Tyrka** | [@juliatyrka](https://github.com/juliatyrka) | Frontend, API integration, Backend FastAPI, Baza danych PostgreSQL (+Docker), Panel Admina | [lista](../../issues?q=assignee:juliatyrka) |


## Technologia

* **Frontend:** React 19+ (Vite) / HTML5 & Modern JavaScript
* **Backend:** Python (FastAPI 0.110+) + SQLAlchemy 2.0
* **Baza Danych:** PostgreSQL 15 (Konteneryzacja: Docker & Docker Compose)
* **Zarządzanie stanem i routing:** React Router / Context API / Axios
* **Dokumentacja API:** Swagger UI (`/docs` generowane automatycznie z FastAPI)

## Funkcjonalności

| # | Funkcja | Issue | Assignee | Etap 
| :---: | :--- | :---: | :---: | :---: 
| 1 | Wyszukiwanie produktów | #3 | M1 – MVP | ✅ Zrobione 
| 2 | Dziennik posiłków i bilans dnia | #4 | M1 – MVP | ✅ Zrobione 
| 3 | Dodawanie własnych produktów przez użytkownika | #5 | M1 – MVP | ✅ Zrobione 
| 4 | Kalkulator zapotrzebowania kalorycznego (BMR / TDEE) | #6 | M2 – Rozszerzenie | ✅ Zrobione 
| 5 | Panel moderacji administratora | #7 | M2 – Rozszerzenie | ✅ Zrobione 
| 6 | Rejestracja, logowanie i role użytkowników (JWT) | #8 | M3 – Bezpieczeństwo | ✅ Zrobione 

### Szczegóły funkcji:
1. **Wyszukiwanie produktów ([#3](../../issues/3)):** Wyszukiwarka z opóźnieniem (debounce 300 ms) oraz `AbortController` łącząca lokalne API, własne produkty oraz Open Food Facts. Obsługuje przeliczanie kcal i B/W/T na bieżąco dla podanej gramatury.
2. **Dziennik posiłków i bilans dnia ([#4](../../issues/4)):** Widok dzienny grupujący wpisy według posiłków (Śniadanie, II śniadanie, Obiad, Kolacja, Przekąska), zliczający sumę kalorii i makroskładników oraz wizualizujący cel na pasku postępu.
3. **Dodawanie własnych produktów ([#5](../../issues/5)):** Formularz dodawania nowych produktów (wartości na 100 g) z walidacją zakresów liczbowych (`B + W + T ≤ 100 g`) i statusem oczekiwania na akceptację.
4. **Kalkulator zapotrzebowania kalorycznego ([#6](../../issues/6)):** Obliczanie BMR i TDEE na podstawie wzoru Mifflin-St Jeor oraz współczynnika aktywności (PAL) z możliwością zapisu jako dzienny cel.
5. **Panel moderacji administratora ([#7](../../issues/7)):** Widok zatwierdzania i odrzucania produktów zgłoszonych przez użytkowników.
6. **Rejestracja, logowanie i role użytkowników ([#8](../../issues/8)):** Obsługa kont użytkowników (`USER` / `ADMIN`), formularze logowania/rejestracji oraz ochrona tras (`ProtectedRoute`).

---

## Architektura

**Widoki (Adresy podstron):**
* `/` – Strona startowa / Logowanie i Rejestracja
* `/dziennik` – Główny dashboard z podsumowaniem dnia i listą posiłków
* `/produkty/nowy` – Formularz dodawania własnego produktu do bazy
* `/admin` – Panel moderacji produktów (dostępny tylko dla roli `ADMIN`)

**Dane i Stan:**
* **Stan globalny:** Dane zalogowanego użytkownika, wybrana data w dzienniku, stan podsumowania makroskładników.
* **Baza danych:** PostgreSQL pod zarządzaniem SQLAlchemy (tabele: `users`, `products`, `daily_logs`, `log_entries`).
* **Komunikacja:** Zapytania `HTTP/REST` realizowane za pomocą biblioteki Axios z backendem FastAPI na porcie `8000`.

**📁Struktura Katalogów:**
```text
frontend_project/
├── backend/            # Kod źródłowy API w FastAPI
│   ├── main.py         # Punkty końcowe REST API
│   ├── models.py       # Modele tabel ORM (SQLAlchemy)
│   ├── schemas.py      # Schematy walidacji Pydantic
│   └── database.py     # Konfiguracja połączenia z bazą
├── init-scripts/       # Skrypty startowe PostgreSQL
│   ├── 01-schema.sql   # Struktura tabel
│   └── 02-seed.sql     # Dane początkowe
├── src/                # Kod źródłowy aplikacji Frontend
│   ├── components/     # Komponenty UI (Wykresy, Paski makro, Modale)
│   ├── pages/          # Widoki (Dashboard, Admin, Formularze)
│   └── services/       # Komunikacja z API (Axios)
├── docker-compose.yml  # Konteneryzacja bazy PostgreSQL
└── README.md           # Dokumentacja projektu
```

## 🚀 Uruchomienie projektu lokalnie
### Wymagania wstępne
- **Docker** i **Docker Compose**
- **Python 3.11+**
- **Node.js 18+** oraz **npm**

### 1. Konfiguracja zmiennych środowiskowych

Utwórz plik `.env` w głównym katalogu repozytorium:
```env
DB_HOST=localhost
DB_PORT=5435
DB_NAME=fit_tracker_db
DB_USER=fit_user
DB_PASSWORD=fit_password
```

Utwórz plik `.env` w katalogu `frontend/`:
```env
VITE_API_URL=http://localhost:8000
```

### 2. Uruchomienie bazy danych (PostgreSQL)

W głównym katalogu projektu uruchom kontener z bazą danych:
```bash
docker-compose up -d
```

### 3. Uruchomienie backendu (FastAPI)

Przejdź do katalogu `backend`, utwórz i aktywuj środowisko wirtualne, zainstaluj zależności i uruchom serwer API:
```bash
cd backend
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\activate
# Linux / macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Dokumentacja interaktywna API (Swagger UI) jest dostępna pod adresem: `http://localhost:8000/docs`.

### 4. Uruchomienie frontendu (React + Vite)

W osobnym terminalu przejdź do katalogu `frontend`, zainstaluj pakiety i uruchom serwer deweloperski:
```bash
cd frontend
npm install
npm run dev
```
Aplikacja jest dostępna w przeglądarce pod adresem: `http://localhost:5173`.

