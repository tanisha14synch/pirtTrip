#!/bin/sh
set -e

export HOST="${HOST:-0.0.0.0}"
export NITRO_HOST="${NITRO_HOST:-0.0.0.0}"
export PORT="${PORT:-3000}"

ENTRY=".output/server/index.mjs"

if [ ! -f "$ENTRY" ]; then
  echo "[pirttrip-admin] FATAL: ${ENTRY} not found — build failed or wrong working directory"
  ls -la .output/server 2>/dev/null || echo "[pirttrip-admin] .output/server directory missing"
  exit 1
fi

echo "[pirttrip-admin] starting node=${NODE_VERSION:-unknown} env=${NODE_ENV:-unknown} host=${HOST} port=${PORT}"
echo "[pirttrip-admin] api_url=${API_URL:-<unset>} cwd=$(pwd)"

exec node "$ENTRY"
