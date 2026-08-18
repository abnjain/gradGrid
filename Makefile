.PHONY: help dev-infra up down logs build seed migrate test-ci

help:
	@echo "GradGrid infrastructure commands"
	@echo "  make dev-infra   Start Postgres + Redis for local dev"
	@echo "  make up          Start full production-like stack"
	@echo "  make down        Stop all containers"
	@echo "  make build       Build Docker images"
	@echo "  make logs        Tail compose logs"
	@echo "  make migrate     Run Prisma migrations in API container"
	@echo "  make seed        Seed database in API container"

dev-infra:
	docker compose -f docker-compose.dev.yml up -d

up:
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f --tail=100

migrate:
	docker compose exec api npx prisma migrate deploy

seed:
	docker compose exec api npx prisma db seed

test-ci:
	cd backend && npm ci && npx prisma generate && npx tsc --noEmit
	cd frontend && npm ci && npx tsc --noEmit
