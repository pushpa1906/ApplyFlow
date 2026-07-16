#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
(cd "$ROOT/backend" && source .venv/bin/activate && python manage.py runserver) &
(cd "$ROOT/frontend" && npm run dev) &
wait
