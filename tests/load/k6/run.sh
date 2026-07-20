#!/usr/bin/env bash
# Lance les tests de charge k6 selon l'environnement cible
# Usage : ./run.sh [env] [scenario]
#   env      : local | dev | staging | prod  (défaut: local)
#   scenario : order | reservation | all     (défaut: all)

set -e

ENV="${1:-local}"
SCENARIO="${2:-all}"

case "$ENV" in
  local)   BASE_URL="http://localhost" ;;
  dev)     BASE_URL="https://dev.restauranthub.fr" ;;
  staging) BASE_URL="https://staging.restauranthub.fr" ;;
  prod)    BASE_URL="https://restauranthub.fr" ;;
  *)       echo "Environnement inconnu : $ENV" && exit 1 ;;
esac

RESULTS_DIR="results/$(date +%Y%m%d_%H%M%S)_${ENV}"
mkdir -p "$RESULTS_DIR"

echo "========================================="
echo "  RestaurantHub — Tests de charge k6"
echo "  Environnement : $ENV"
echo "  Base URL      : $BASE_URL"
echo "  Scénario      : $SCENARIO"
echo "  Résultats     : $RESULTS_DIR"
echo "========================================="

run_k6() {
  local name="$1"
  local file="$2"
  echo ""
  echo "--- Lancement : $name ---"
  k6 run \
    --env BASE_URL="$BASE_URL" \
    --out json="$RESULTS_DIR/${name}.json" \
    --summary-export="$RESULTS_DIR/${name}-summary.json" \
    "$file"
  echo "--- Terminé : $name ---"
}

case "$SCENARIO" in
  order)
    run_k6 "order-flow" "scenarios/order-flow.js"
    ;;
  reservation)
    run_k6 "reservation-flow" "scenarios/reservation-flow.js"
    ;;
  all)
    run_k6 "order-flow" "scenarios/order-flow.js"
    sleep 30
    run_k6 "reservation-flow" "scenarios/reservation-flow.js"
    ;;
  *)
    echo "Scénario inconnu : $SCENARIO (order | reservation | all)" && exit 1
    ;;
esac

echo ""
echo "========================================="
echo "  Tous les tests terminés."
echo "  Résultats : $RESULTS_DIR"
echo "========================================="
