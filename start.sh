#!/usr/bin/env bash
set -e
PORT="${PORT:-8080}"
echo "Serving Dungeon Rift on port ${PORT}..."
exec python3 -m http.server "${PORT}" --bind 0.0.0.0
