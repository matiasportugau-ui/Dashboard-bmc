#!/usr/bin/env bash
set -euo pipefail

echo "[lint] Python: flake8"
flake8 .
echo "[lint] Python: mypy"
mypy --ignore-missing-imports

if [ -f package.json ]; then
  echo "[lint] JS/TS: eslint"
  eslint . || true
fi

echo "[lint] Done."

