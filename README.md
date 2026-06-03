# Fenster Project

Full-stack Web-App fuer einen deutschen Fenster-/Tuerenanbieter.

## Stack

- Frontend: React (Vite), komponentenbasiert, mobile-first
- Backend: FastAPI + SQLAlchemy
- Datenbank: SQLite standardmaessig, per `DATABASE_URL` auf PostgreSQL umstellbar
- Features: Konfigurator ohne Preise, Anfrageverwaltung, Admin Dashboard, CSV Export, E-Mail Benachrichtigung

## Struktur

- `frontend/` React App mit Seiten + Konfigurator Wizard
- `backend/` FastAPI API mit Modellen, Validierung und Admin-Endpunkten

## Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Optional `.env` in `frontend/`:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

## Backend starten

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Kernfunktionen

- Seiten: Startseite, Konfigurator, Leistungen, Kontakt, Admin
- Fenster-Konfigurator mit Mehrfachfenster und Duplizierung
- Haustuer- und Rollladen-Konfiguration
- Dynamische 2D Fenstervorschau (SVG)
- Zwischenstand lokal speichern + Draft API
- Finale Anfrage speichern und Admin benachrichtigen
- Admin: Suche, Filter, Statuspflege, CSV Export

## 3D Vorschau

- Der Konfigurator enthaelt eine interaktive 3D Fenstervorschau (Three.js via react-three-fiber).
- Umschaltung zwischen `3D` und `2D` ist im Konfigurator verfuegbar.

## Referenz-Crawler (optional)

Wenn du Referenzbilder/Pattern-Codes aus einer bestehenden Website extrahieren willst, nutze:

```bash
cd /home/salmansayani/projects/fenster
python3 tools/crawl_fensterversand.py --url 'https://www.fensterversand.com/?cid=25&t=fenster-kunststoff' --out data/fensterversand
```

Hinweis: In eingeschraenkten Umgebungen kann DNS/Netzwerk blockiert sein.

## Hinweis zu Vision.pdf

`projects/Vision.pdf` konnte in dieser Laufzeitumgebung nicht automatisch geparst werden (keine PDF-Texttools installiert). Die Implementierung folgt den detaillierten Anforderungen aus dem Prompt und ist modular erweiterbar.
# fenster
