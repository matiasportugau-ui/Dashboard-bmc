#!/usr/bin/env bash
set -euo pipefail

echo "[postCreate] Installing global tools..."

# Python tooling
python -m pip install --upgrade pip >/dev/null
pip install --no-cache-dir -r requirements-dev.txt 2>/dev/null || true

# Node tooling
if command -v corepack >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
fi
if [ -f package.json ]; then
  npm install --silent || true
fi

echo "[postCreate] Installing pre-commit hooks..."
if command -v pre-commit >/dev/null 2>&1; then
  pre-commit install --install-hooks || true
fi

echo "[postCreate] Done."

