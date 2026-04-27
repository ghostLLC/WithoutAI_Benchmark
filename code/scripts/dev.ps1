# WithoutAI Benchmark - Dev Environment
# Usage: Right-click -> Run with PowerShell, or: powershell -File scripts/dev.ps1

$root = Split-Path -Parent $PSScriptRoot

$pnpm = "$env:APPDATA\npm\pnpm.cmd"
if (-not (Test-Path $pnpm)) {
    Write-Host "[ERROR] pnpm not found. Install: npm install -g pnpm" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "  WithoutAI Benchmark - Dev Environment" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/3] API server (NestJS :3000)" -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k cd /d `"$root\apps\api`" && `"$pnpm`" dev"

Write-Host "[2/3] Web frontend (Next.js :3001)" -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k cd /d `"$root\apps\web`" && `"$pnpm`" dev"

Write-Host "[3/3] AI Core (FastAPI :8000)" -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k cd /d `"$root\services\ai-core`" && python -m uvicorn app.main:app --reload --port 8000"

Write-Host ""
Write-Host "Services starting:" -ForegroundColor Green
Write-Host "  API:     http://localhost:3000"
Write-Host "  Web:     http://localhost:3001"
Write-Host "  AI Core: http://localhost:8000"
Write-Host ""

Start-Sleep -Seconds 3
Start-Process http://localhost:3001
