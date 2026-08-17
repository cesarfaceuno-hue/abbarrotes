#!/usr/bin/env bash
# healthcheck.sh — comprueba la ruta local 127.0.0.1:3000/api/health
# - Salida 0 si HTTP 200
# - Salida !=0 si otro código o error
# - Requiere curl

set -euo pipefail

URL="http://127.0.0.1:3000/api/health"
TIMEOUT=5

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl required but not found" >&2
  exit 2
fi

# Usar -sS para silencio pero mostrar errores, -o /dev/null y -w para obtener el código HTTP.
HTTP_CODE="$(curl -sS -o /dev/null -w '%{http_code}' --max-time "$TIMEOUT" "$URL" || echo "000")"

if [ "$HTTP_CODE" = "200" ]; then
  echo "OK: $URL respondió 200"
  exit 0
else
  echo "UNHEALTHY: $URL devolvió $HTTP_CODE" >&2
  exit 1
fi
