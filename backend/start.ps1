# ========================================
#   Crowd Snap AI Backend Server Startup
# ========================================

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 Starting Crowd Snap AI Backend Server" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Server: http://localhost:8001" -ForegroundColor Yellow
Write-Host "📚 API Docs: http://localhost:8001/docs" -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path "venv\Scripts\python.exe")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    py -3.12 -m venv venv
}

& "venv\Scripts\python.exe" -m pip install --upgrade pip
& "venv\Scripts\python.exe" -m pip install -r requirements.txt
& "venv\Scripts\python.exe" -m pip install face-recognition==1.3.0 face_recognition_models --no-deps
if ($LASTEXITCODE -ne 0) {
    throw "Dependency installation failed."
}

& "venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
