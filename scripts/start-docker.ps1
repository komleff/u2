#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

Write-Host "[u2] Building Docker images..." -ForegroundColor Cyan
docker compose build

Write-Host "[u2] Starting Docker Compose (server + client)..." -ForegroundColor Cyan
docker compose up -d

Write-Host "[u2] Containers running. Status:" -ForegroundColor Green
docker compose ps

Write-Host ""
Write-Host "Backend:" -ForegroundColor Yellow
Write-Host "  UDP  : 7777 (host)"
Write-Host "  WS   : ws://localhost:8080/"
Write-Host "Client:" -ForegroundColor Yellow
Write-Host "  URL  : http://localhost:5173/"
Write-Host ""
Write-Host "Logs: docker compose logs -f" -ForegroundColor Cyan
Write-Host "Stop: docker compose down" -ForegroundColor Cyan
