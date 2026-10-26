# 🥗 NutriTrack

Dla osób dbających o zdrowie i sylwetkę, które chcą precyzyjnie kontrolować dzienny bilans kaloryczny i makroskładniki bez marnowania czasu na skomplikowane interfejsy.

## O projekcie

NutriTrack to intuicyjna aplikacja webowa służąca do kompleksowego prowadzenia dziennika odżywiania. Użytkownik może wyznaczyć swój dzienny cel kaloryczny i cele makroskładników (białka, węglowodany, tłuszcze), przeliczać wartości odżywcze posiłków oraz na bieżąco monitorować, ile kalorii pozostało mu do końca dnia. W odróżnieniu od komercyjnych alternatyw (jak MyFitnessPal), aplikacja oferuje przejrzysty interfejs bez reklam oraz unikalną możliwość zgłaszania własnych produktów do ogólnodostępnej bazy po weryfikacji przez administratora.

**Temat:** B (własny pomysł)

## Zespół

| Osoba | GitHub | Część projektu | Issues |
| :--- | :--- | :--- | :--- |
| **Julia Tyrka** | [@juliatyrka](https://github.com/jkowalski) | Frontend, API integration, Backend FastAPI, Baza danych PostgreSQL (+Docker), Panel Admina | [lista](../../issues?q=assignee:juliatyrka) |


## Technologia

* **Frontend:** React 19+ (Vite) / HTML5 & Modern JavaScript
* **Backend:** Python (FastAPI 0.110+) + SQLAlchemy 2.0
* **Baza Danych:** PostgreSQL 15 (Konteneryzacja: Docker & Docker Compose)
* **Zarządzanie stanem i routing:** React Router / Context API / Axios
* **Dokumentacja API:** Swagger UI (`/docs` generowane automatycznie z FastAPI)

## Funkcjonalności

| # | Funkcja | Issue | Assignee | Etap | Stan |
| :---: | :--- | :---: | :---: | :---: | :---: |
| 1 | Dziennik spożycia i podsumowanie kalorii | #1 | @juliatyrka | M1 | do zrobienia |
| 2 | Wyszukiwanie produktów z bazy globalnej | #2 | @juliatyrka | M1 | do zrobienia |
| 3 | Dodawanie własnego produktu / napoju | #3 | @juliatyrka | M2 | do zrobienia |
| 4 | Panel Moderacji i Akceptacji Admina | #4 | @juliatyrka | M2 | do zrobienia |
| 5 | Kalkulator BMR / TDEE i ustawianie celów | #5 | @juliatyrka | M3 | do zrobienia |


## Opisy Funkcji (Szczegóły / Wzór do GitHub Issues)

### 1. Dziennik spożycia i podsumowanie kalorii
* **Co robi użytkownik:** Wybiera dzień z kalendarza, przegląda zjedzone posiłki z podziałem na pory dnia (śniadanie, obiad, kolacja, przekąski) oraz widzi dynamiczny wskaźnik pozostałych kalorii i makroskładników.
* **Widok:** `/dziennik` (Główny Dashboard)
* **Dane:** Stan globalny zasilany z REST API (`GET /api/summary/{user_id}`).
* **Najtrudniejsze:** Dynamiczne przeliczanie makroskładników w czasie rzeczywistym i aktualizacja paska postępu po usunięciu/dodaniu wpisu.
* **Gotowe, gdy:** Użytkownik po zalogowaniu od razu widzi poprawny stan pozostałych kalorii na dany dzień, a dodanie produktu aktualizuje wskaźniki.

### 2. Wyszukiwanie produktów z bazy globalnej
* **Co robi użytkownik:** Wpisuje nazwę produktu w oknie wyszukiwania (np. "pierś z kurczaka"), widzi listę podpowiedzi z przelicznikiem na $100\text{ g}$, określa masę w gramach i dodaje produkt do wybranego posiłku.
* **Widok:** Modale / Formularz dodawania posiłku na `/dziennik`
* **Dane:** REST API (`GET /api/products?search=...`), dane zapisane w tabeli `products` w PostgreSQL.
* **Najtrudniejsze:** Live search z debouncem ($300\text{ ms}$ delay) oraz automatyczne przeliczanie wartości odżywczych na podstawie wprowadzonej wagi w gramach.
* **Gotowe, gdy:** Wpisanie frazy wyszukuje produkt z bazy, a podanie wagi $200\text{ g}$ podwaja wartości makro dodawane do dziennika.

### 3. Dodawanie własnego produktu
* **Co robi użytkownik:** Wypełnia formularz dodawania nowego produktu (nazwa, kalorie, białko, węglowodany, tłuszcze na $100\text{ g}$) np. nowego napoju energetycznego.
* **Widok:** `/produkty/nowy`
* **Dane:** Formularz wysyła żądanie `POST /api/products` ze flagą `is_approved = false`.
* **Najtrudniejsze:** Walidacja formularza (brak wartości ujemnych, sprawdzanie sumy makroskładników).
* **Gotowe, gdy:** Produkt pojawia się na prywatnej liście użytkownika, a w bazie ląduje w kolejce oczekujących dla Administratora.

### 4. Panel Moderacji i Akceptacji Admina
* **Co robi użytkownik:** Administrator przegląda zgłoszone przez społeczność produkty i jednym kliknięciem akceptuje je (przenosząc do bazy globalnej) lub odrzuca.
* **Widok:** `/admin`
* **Dane:** Zapytania REST API (`GET /api/admin/pending` oraz `PUT /api/admin/approve/{id}`).
* **Najtrudniejsze:** Ograniczenie dostępu do widoku tylko dla kont z rolą `ADMIN` (Protected Route).
* **Gotowe, gdy:** Po zatwierdzeniu przez admina nowy produkt staje się widoczny w wyszukiwarce dla wszystkich pozostałych użytkowników.

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

**Struktura Katalogów:**
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

## Uruchomienie

### Wymagania
* Docker Desktop & Python 3.10+ & Node.js

### 1. Baza Danych (Docker)
```bash
# Uruchomienie bazy danych PostgreSQL na porcie 5435
docker-compose up -d
```

### 2. Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Aktywacja środowiska:
# Linux/macOS: source venv/bin/activate | Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*Dokumentacja Swagger UI dostępna pod adresem: `http://localhost:8000/docs`*

### 3. Frontend
```bash
npm install
npm run dev
```

## Wdrożenie

* Aplikacja zostanie wdrożona na platformie Vercel / Render: *(link zostanie dodany w etapie M2)*
