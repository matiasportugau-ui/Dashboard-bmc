#!/usr/bin/env bash
set -euo pipefail

echo "[format] Python: black + isort"
black .
isort .

if [ -f package.json ]; then
  echo "[format] JS/TS: prettier"
  prettier -w .
fi

echo "[format] Done."

