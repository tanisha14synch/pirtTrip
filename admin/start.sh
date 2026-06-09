#!/bin/sh
set -e
export HOST="${HOST:-0.0.0.0}"
export NITRO_HOST="${NITRO_HOST:-0.0.0.0}"
export PORT="${PORT:-3000}"
echo "[pirttrip-admin] listening on ${HOST}:${PORT}"
exec node .output/server/index.mjs
