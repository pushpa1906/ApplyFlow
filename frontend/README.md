# ApplyFlow Frontend

A complete React + TypeScript + Vite frontend for the ApplyFlow Django backend.

## Run

```powershell
npm install --no-audit --no-fund
npm run dev
```

The Django backend should run at `http://127.0.0.1:8000`.

## Expected backend endpoints

- `GET /api/config/`
- `POST /api/sheets/validate/`
- `GET /api/applications/`
- `POST /api/applications/`
- `PUT /api/applications/{id}/`
- `DELETE /api/applications/{id}/`

The Vite proxy forwards `/api` requests to Django.
