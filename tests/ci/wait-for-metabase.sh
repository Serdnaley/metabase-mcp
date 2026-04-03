#!/bin/bash
set -e

URL="${METABASE_URL:-http://localhost:3000}"
MAX_ATTEMPTS=60
INTERVAL=5

echo "Waiting for Metabase at $URL..."

for i in $(seq 1 $MAX_ATTEMPTS); do
  if curl -sf "$URL/api/health" > /dev/null 2>&1; then
    echo "Metabase is ready!"
    exit 0
  fi
  echo "Attempt $i/$MAX_ATTEMPTS — not ready yet, waiting ${INTERVAL}s..."
  sleep $INTERVAL
done

echo "Metabase did not become ready in time."
exit 1
