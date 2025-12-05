# Ryden Project - Frontend Only Setup (No Docker)
# Use this if you want to test the frontend without backend services

Write-Host @"
╔════════════════════════════════════════════════════════════════════════╗
║        RYDEN PROJECT - FRONTEND ONLY (Development Mode)               ║
║               Backend services will use mock data                      ║
╚════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host "`n✓ Frontend dependencies already installed" -ForegroundColor Green

Write-Host "`n[Starting Expo Development Server]" -ForegroundColor Yellow
Write-Host "`nOptions after startup:" -ForegroundColor Magenta
Write-Host "  - Press 'a' to run Android emulator" -ForegroundColor Cyan
Write-Host "  - Press 'i' to run iOS simulator" -ForegroundColor Cyan
Write-Host "  - Press 'w' to run web version" -ForegroundColor Cyan
Write-Host "  - Press 'r' to reload" -ForegroundColor Cyan
Write-Host "  - Press 'q' to quit" -ForegroundColor Cyan
Write-Host "`n" -ForegroundColor Gray

cd $PSScriptRoot
npm start
