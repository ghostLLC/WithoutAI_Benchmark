@echo off
setlocal enabledelayedexpansion
title WithoutAI Benchmark

set ROOT=%~dp0
set PNPM=%APPDATA%\npm\pnpm.cmd

if not exist "%PNPM%" (
    echo [ERROR] pnpm not found. Run: npm install -g pnpm
    pause
    exit /b 1
)

echo.
echo   WithoutAI Benchmark
echo   ==================
echo.
echo   Starting services (minimized)...
echo.

start /min "" cmd /c "cd /d "%ROOT%apps\api" && "%PNPM%" dev"
start /min "" cmd /c "cd /d "%ROOT%apps\web" && "%PNPM%" dev"
start /min "" cmd /c "cd /d "%ROOT%services\ai-core" && python -m uvicorn app.main:app --reload --port 8000"

echo   Waiting for API to be ready...

:: Poll until API responds
for /l %%i in (1,1,20) do (
    timeout /t 2 > nul
    curl -s http://localhost:3000/api/assessment/scenes > nul 2>&1
    if not errorlevel 1 goto ready
)

echo   [WARN] API did not start within 40s. Check minimized windows.
pause
exit /b 1

:ready
echo   API online. Opening browser...
start http://localhost:3001

echo.
echo   All services running. You can close this window.
echo   (Stop services from the minimized taskbar windows)
echo.

timeout /t 5 > nul
endlocal
