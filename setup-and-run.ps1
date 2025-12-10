# Ryden Project Setup and Run Script
# Run this after Docker Desktop is installed and running

Write-Host @"
================================================================================
              RYDEN PROJECT - SETUP AND RUN SCRIPT
================================================================================
"@ -ForegroundColor Cyan

# Check if Docker is running
Write-Host "`n[1/5] Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Visit: https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
    exit 1
}

# Check Docker daemon
Write-Host "`n[2/5] Checking Docker daemon..." -ForegroundColor Yellow
try {
    docker ps > $null 2>&1
    Write-Host "✓ Docker daemon is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker daemon is not running. Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker.exe"
    Write-Host "Waiting for Docker to start (60 seconds)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 60
}

# Start backend services
Write-Host "`n[3/5] Starting backend services with docker-compose..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot\backend"
docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend services started successfully" -ForegroundColor Green
    Write-Host "  - PostgreSQL: localhost:5432" -ForegroundColor Cyan
    Write-Host "  - MongoDB: localhost:27017" -ForegroundColor Cyan
    Write-Host "  - Redis: localhost:6379" -ForegroundColor Cyan
    Write-Host "  - API Gateway: localhost:3000" -ForegroundColor Cyan
    Write-Host "Waiting for services to initialize (30 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
} else {
    Write-Host "✗ Failed to start backend services" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Display service status
Write-Host "`n[4/5] Backend services status:" -ForegroundColor Yellow
docker-compose -f "$PSScriptRoot\backend\docker-compose.yml" ps

# Start frontend
Write-Host "`n[5/5] Starting Expo development server..." -ForegroundColor Yellow
Write-Host "`nPress CTRL+C to stop the development server at any time" -ForegroundColor Magenta
Push-Location $PSScriptRoot
npm start
Pop-Location
