# ========================================
#   Crowd Snap AI - Start Both Servers
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 Starting Crowd Snap AI Application" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend in new window
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\start.ps1"

Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host ''; Write-Host '🎨 Crowd Snap AI Frontend' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Crowd Snap AI is Starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "⚙️  Backend:  http://localhost:8001" -ForegroundColor Yellow
Write-Host "📚 API Docs: http://localhost:8001/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔐 Admin Login:" -ForegroundColor Cyan
Write-Host "   Email:    admin"
Write-Host "   Password: (set in backend/.env)"
Write-Host ""
Write-Host "Press any key to exit this launcher..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
