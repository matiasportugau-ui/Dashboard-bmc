.PHONY: setup lint format test check clean

SHELL := /usr/bin/bash

setup:
	python -m pip install --upgrade pip
	pip install -r requirements-dev.txt
	if [ -f package.json ]; then npm install; fi
	pre-commit install --install-hooks || true

lint:
	@if [ -d . ]; then echo "[lint] Python"; fi
	flake8 . || true
	mypy --ignore-missing-imports || true
	@if [ -f package.json ]; then echo "[lint] JS/TS"; eslint . || true; fi

format:
	black .
	isort .
	@if [ -f package.json ]; then prettier -w .; fi

test:
	pytest -q --disable-warnings --maxfail=1 --cov --cov-report=term-missing
	@if [ -f package.json ]; then npm test --silent || true; fi

check: lint test

clean:
	rm -rf .pytest_cache .mypy_cache .coverage htmlcov dist build node_modules || true

