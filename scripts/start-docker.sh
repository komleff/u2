#!/usr/bin/env bash
set -euo pipefail

echo "[u2] Building Docker images..."
docker compose build

echo "[u2] Starting Docker Compose (server + client)..."
docker compose up -d

echo "[u2] Containers running. Status:"
docker compose ps

echo
echo "Backend:"
echo "  UDP  : 7777 (host)"
echo "  WS   : ws://localhost:8080/"
echo "Client:"
echo "  URL  : http://localhost:5173/"
echo
echo "Logs: docker compose logs -f"
echo "Stop: docker compose down"
