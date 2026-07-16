$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

if (!(Test-Path (Join-Path $backend "manage.py"))) { throw "backend/manage.py was not found." }
if (!(Test-Path (Join-Path $frontend "package.json"))) { throw "frontend/package.json was not found." }

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backend'; if (Test-Path '.venv\Scripts\Activate.ps1') { . '.venv\Scripts\Activate.ps1' } elseif (Test-Path 'venv\Scripts\Activate.ps1') { . 'venv\Scripts\Activate.ps1' }; python manage.py runserver 127.0.0.1:8000"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontend'; npm run dev"
Write-Host "ApplyFlow backend: http://127.0.0.1:8000/api/health/" -ForegroundColor Green
Write-Host "ApplyFlow frontend: http://localhost:5173" -ForegroundColor Green
