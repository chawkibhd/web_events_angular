#!/bin/bash
set -e

# Always operate from the directory where the script lives
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR"

# Track background processes to avoid orphaned services
PIDS=()
SERVICE_NAMES=()

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ Commande requise introuvable : $1" >&2
    exit 1
  fi
}

require_cmd nc
require_cmd npm

cleanup() {
  set +e
  if [ ${#PIDS[@]} -gt 0 ]; then
    echo "🧹 Arrêt des services lancés..."
    for pid in "${PIDS[@]}"; do
      if kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null
      fi
    done
  fi
}
trap cleanup EXIT INT TERM

register_process() {
  local name="$1"
  local pid="$2"
  SERVICE_NAMES+=("$name")
  PIDS+=("$pid")
}

start_service() {
  local name="$1"
  local dir="$2"
  echo "🚀 Démarrage du service ${name}..."
  (cd "$BASE_DIR/$dir" && ./mvnw spring-boot:run) &
  register_process "$name" $!
}

start_frontend() {
  local dir="$1"
  local name="${2:-Frontend Angular}"
  echo "🎨 Démarrage du ${name} (${dir})..."
  (cd "$BASE_DIR/$dir" && npm run start -- --host 0.0.0.0 --port 4200) &
  register_process "$name" $!
}

pid_for_service() {
  local search="$1"
  for i in "${!SERVICE_NAMES[@]}"; do
    if [[ "${SERVICE_NAMES[$i]}" == "$search" ]]; then
      echo "${PIDS[$i]}"
      return 0
    fi
  done
  return 1
}

wait_for_port() {
  local name="$1"
  local port="$2"
  local timeout="${3:-90}"
  local start_ts
  start_ts=$(date +%s)

  echo "⏳ Attente que ${name} soit prêt sur le port ${port} (timeout ${timeout}s)..."

  while true; do
    if nc -z localhost "${port}" >/dev/null 2>&1; then
      echo "✅ ${name} est démarré (port ${port})"
      return 0
    fi

    local pid
    pid=$(pid_for_service "$name" || true)
    if [[ -n "$pid" ]] && ! kill -0 "$pid" 2>/dev/null; then
      echo "❌ ${name} s'est arrêté avant d'ouvrir le port ${port}. Consulte les logs ci-dessus." >&2
      exit 1
    fi

    if (( $(date +%s) - start_ts >= timeout )); then
      echo "⏰ ${name} n'a pas ouvert le port ${port} après ${timeout}s." >&2
      exit 1
    fi

    sleep 1
  done
}

echo "=============================================="
echo "🚀 DÉMARRAGE DES MICRO-SERVICES (BACKEND)"
echo "=============================================="

start_service "Discovery Server" "discovery-server"
start_service "API Gateway" "api-gateway"
start_service "Auth Service" "auth-service"
start_service "Events Service" "events-service"
start_service "Notifications Service" "notifications-service"

echo "=============================================="
echo "⏳ Vérification que tous les backends sont bien démarrés"
echo "=============================================="

wait_for_port "Discovery Server" 8761
wait_for_port "API Gateway" 8080
wait_for_port "Auth Service" 8082
wait_for_port "Events Service" 8081
wait_for_port "Notifications Service" 8083

echo "=============================================="
echo "🎨 DÉMARRAGE DU FRONTEND ANGULAR (EN DERNIER)"
echo "=============================================="

start_frontend "event-manager-frontend" "Frontend Angular"
wait_for_port "Frontend Angular" 4200 120

echo "✅ Tous les services ont été lancés en arrière-plan. Suivi des logs..."
wait "${PIDS[@]}"
