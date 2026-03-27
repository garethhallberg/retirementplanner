.PHONY: test test-backend test-frontend install install-backend install-frontend

test: test-backend test-frontend

test-backend:
	cd backend && uv run --extra test pytest -v

test-frontend:
	cd frontend && npm test -- --watchAll=false

install: install-backend install-frontend

install-backend:
	cd backend && uv sync --extra test

install-frontend:
	cd frontend && npm install
