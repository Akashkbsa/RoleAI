@echo off
title RoleAI — AI Role-Based Response Generator
color 0C

echo.
echo  ============================================
echo       RoleAI — Starting Application
echo  ============================================
echo.

:: Install dependencies if needed
echo  [1/3] Installing Python dependencies...
cd /d "%~dp0backend"
pip install -r requirements.txt --quiet >nul 2>&1
echo        Done.
echo.

:: Start Backend Server
echo  [2/3] Starting Backend (FastAPI) on port 8000...
start "RoleAI Backend" cmd /k "cd /d "%~dp0backend" && uvicorn main:app --reload --port 8000"
timeout /t 3 >nul

:: Start Frontend Server
echo  [3/3] Starting Frontend on port 3000...
start "RoleAI Frontend" cmd /k "cd /d "%~dp0frontend" && python -m http.server 3000"
timeout /t 2 >nul

:: Open browser
echo.
echo  ============================================
echo       Opening http://localhost:3000
echo  ============================================
echo.
start http://localhost:3000

echo  Both servers are running. Close this window anytime.
echo  To stop: close the Backend and Frontend terminal windows.
echo.
pause
