# ApplyFlow

A focused job-application dashboard with three safe workspace modes:

1. **Demo mode** — public portfolio visitors explore realistic local sample data.
2. **Connect Google Sheet** — visitors may connect a sheet they own after sharing it with the configured Google service account.
3. **Personal workspace** — your private spreadsheet is configured on the backend and protected by an access code.

Google Sheets remains the source of truth for connected workspaces. The Applications sheet supports dynamic columns and CRUD operations.

## Included

- React + TypeScript + Vite + Tailwind CSS + Framer Motion
- Django + Django REST Framework
- Olive green and beige responsive UI
- Demo dashboard and recruiter-safe demo data
- Dynamic Google Sheets Applications table
- Create, edit, delete, search, status filtering, and sorting
- Automatic sync at startup and when returning to the browser tab
- Daily goal (10) and weekly goal (70), editable in Settings
- One-time daily and weekly completion notifications
- Protected personal workspace with automatic spreadsheet reconnection

## Requirements

- Node.js 20 or newer
- Python 3.11 or newer
- A Google Cloud service account with the Google Sheets API enabled

## Fast local setup

On Windows PowerShell, run this once from the project root:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\install.ps1
.\start-dev.ps1
```

The frontend lockfile uses the public npm registry and pinned package versions. `npm ci --no-audit --no-fund` is used to avoid unnecessary audit delays. Demo Mode works without Google credentials.

## 1. Google Cloud setup

1. Create a Google Cloud project.
2. Enable **Google Sheets API**.
3. Create a **Service Account**.
4. Create and download a JSON key.
5. Save it as `backend/service-account.json`.
6. Share the Google spreadsheet with the service account email as **Editor**.
7. Ensure the workbook has a sheet named `Applications`. If it does not exist, ApplyFlow creates it.

Minimum headers:

```text
Company | Role | Status | Applied Date
```

ApplyFlow automatically adds a hidden-style internal column named `__applyflow_id`. Do not delete it; it is used to keep CRUD operations stable even when rows move.

## 2. Backend setup

From the project root:

### Windows PowerShell

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py runserver
```

Edit `backend/.env` before starting personal mode:

```env
GOOGLE_SERVICE_ACCOUNT_FILE=service-account.json
PERSONAL_SPREADSHEET_ID=your_private_spreadsheet_id
PERSONAL_ACCESS_CODE=choose-a-long-private-code
```

Leave the two personal variables empty on the public demo backend when you do not want personal mode offered.

## 3. Frontend setup

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

The included `.npmrc` forces npm to use the official npm registry and increases network timeouts.

## One-command development startup

After installing dependencies once, from the project root run:

```powershell
.\start-dev.ps1
```

## Public and personal deployments

Use the same repository with separate environment configurations.

### Public portfolio deployment

- Do not set `PERSONAL_SPREADSHEET_ID` or `PERSONAL_ACCESS_CODE`.
- Recruiters see Demo Mode and Connect Google Sheet.
- Your private sheet is never available.

### Private personal deployment

- Set `PERSONAL_SPREADSHEET_ID` and a strong `PERSONAL_ACCESS_CODE`.
- The backend remembers your spreadsheet through environment configuration.
- The browser remembers the selected personal mode and only requests the access code again after a new browser session.

For stronger privacy, place the private deployment behind hosting-level password protection, VPN, or an allowlist. The built-in access code is intentionally lightweight and is not a replacement for full authentication.

## Production build

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
python manage.py check
```

Set `DEBUG=False`, use a strong `DJANGO_SECRET_KEY`, configure `ALLOWED_HOSTS`, and configure `CORS_ALLOWED_ORIGINS` for the deployed frontend domain.

## API endpoints

- `GET /api/health/`
- `GET /api/config/`
- `POST /api/sheets/validate/`
- `GET /api/applications/`
- `POST /api/applications/`
- `PUT /api/applications/{row_id}/`
- `DELETE /api/applications/{row_id}/`

## Security notes

- Service-account credentials remain on the backend.
- Never commit `service-account.json` or `.env`.
- Demo Mode never calls Google Sheets.
- A spreadsheet ID alone does not grant access. The sheet must be shared with the service account.

## Frontend/backend version check

After starting the project, open:

- `http://127.0.0.1:8000/api/health/`
- `http://127.0.0.1:8000/api/config/`

Both must return JSON and include `"api_version": "1.0"`. If Django lists only
`health`, `applications`, and `filter-options`, an older backend folder is running.
Stop all Django terminals and run this project's `start-dev.ps1` from the extracted
root folder.
