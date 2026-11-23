@echo off
echo ========================================
echo   Starting Crowd Snap AI Backend Server
echo ========================================
echo.
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
