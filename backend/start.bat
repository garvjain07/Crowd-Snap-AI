@echo off
cd /d "%~dp0"
echo ========================================
echo   Starting Crowd Snap AI Backend Server
echo ========================================
echo.
if not exist "venv\Scripts\python.exe" (
  echo Creating a virtual environment...
  py -3.12 -m venv venv
)
if not exist "venv\Scripts\python.exe" (
  echo Failed to create the virtual environment.
  exit /b 1
)
echo Installing/updating dependencies...
venv\Scripts\python.exe -m pip install --upgrade pip
venv\Scripts\python.exe -m pip install -r requirements.txt
if errorlevel 1 (
  echo Dependency installation failed.
  exit /b 1
)
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
