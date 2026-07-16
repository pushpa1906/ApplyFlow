$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host 'Installing ApplyFlow frontend dependencies...' -ForegroundColor Cyan
Set-Location "$root\frontend"
npm config set registry https://registry.npmjs.org/
npm ci --no-audit --no-fund

Write-Host 'Installing ApplyFlow backend dependencies...' -ForegroundColor Cyan
Set-Location "$root\backend"
if (-not (Test-Path '.venv')) { python -m venv .venv }
& .\.venv\Scripts\python.exe -m pip install --disable-pip-version-check -r requirements.txt
if (-not (Test-Path '.env')) { Copy-Item .env.example .env }
& .\.venv\Scripts\python.exe manage.py migrate
& .\.venv\Scripts\python.exe manage.py check

Write-Host 'Installation complete. Run .\start-dev.ps1' -ForegroundColor Green
