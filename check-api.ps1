Write-Host "Checking ApplyFlow backend..." -ForegroundColor Cyan
try {
  $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health/"
  $config = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/config/"
  Write-Host "Backend health: $($health.status)" -ForegroundColor Green
  Write-Host "API version: $($config.api_version)" -ForegroundColor Green
  Write-Host "Service account: $($config.service_account_email)"
} catch {
  Write-Host "Backend check failed: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Start this project's backend using .\start-dev.ps1, not an older ApplyFlow folder." -ForegroundColor Yellow
}
