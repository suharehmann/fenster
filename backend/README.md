# Fenster Backend (FastAPI)

## Start

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## API Highlights

- `POST /api/inquiries` finale Anfrage speichern + E-Mail Event
- `POST /api/inquiries/draft` Zwischenstand speichern
- `GET /api/admin/inquiries` Liste mit Suche/Filter
- `PATCH /api/admin/inquiries/{id}/status` Status pflegen
- `GET /api/admin/inquiries/export` CSV Export
- `POST /api/contact` Kontaktanfrage
