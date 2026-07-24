# ApplyFlow

ApplyFlow is a modern job application tracker built with **React, TypeScript, Django, and Google Sheets**. It helps organize job applications, track interview progress, monitor application goals, and manage the entire job search from a single dashboard.

## Features

- Dashboard with application insights and analytics
- Create, edit, update, and delete applications
- Search, sorting, and filtering
- Application status tracking
- Daily and weekly application goals
- Google Sheets integration
- Demo mode for recruiters and portfolio visitors
- Personal workspace protected by an access code
- Responsive design for desktop and tablet

## Workspace Modes

### Demo Mode
Explore ApplyFlow using realistic sample data without connecting a Google Sheet.

### Connect Google Sheet
Connect your own Google Sheet after sharing it with the configured service account.

### Personal Workspace
Access a private spreadsheet configured on the backend using an access code.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion

### Backend

- Django
- Django REST Framework

### Database

- Google Sheets API

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Google Cloud Service Account with Google Sheets API enabled

### Clone the Repository

```bash
git clone https://github.com/pushpa1906/ApplyFlow.git
cd ApplyFlow
```

### Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Open:

```
http://localhost:5173
```

## Google Sheets Setup

1. Create a Google Cloud project.
2. Enable the Google Sheets API.
3. Create a Service Account.
4. Download the JSON credentials.
5. Save the credentials in the backend.
6. Share your spreadsheet with the service account email.
7. Ensure the spreadsheet contains an **Applications** sheet.

Minimum required columns:

```
Company
Role
Application Status
Applied Date
```

## Project Structure

```
ApplyFlow
│
├── frontend
│   ├── components
│   ├── pages
│   ├── hooks
│   ├── constants
│   └── utils
│
├── backend
│   ├── api
│   ├── config
│   └── requirements.txt
│
└── README.md
```

## License

This project is available under the MIT License.
