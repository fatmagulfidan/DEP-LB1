.PHONY: help setup build up down logs ps clean

help:
	@echo "Weather Dashboard - Docker Compose Commands"
	@echo ""
	@echo "Setup and Running:"
	@echo "  make setup          - Setup environment and create .env file from .env.example"
	@echo "  make build          - Build Docker images"
	@echo "  make up             - Start all services"
	@echo "  make down           - Stop all services (keep data)"
	@echo "  make restart        - Restart all services"
	@echo ""
	@echo "Development:"
	@echo "  make logs           - View logs from all services"
	@echo "  make logs-backend   - View backend logs only"
	@echo "  make logs-frontend  - View frontend logs only"
	@echo "  make logs-db        - View database logs only"
	@echo "  make ps             - Show running services status"
	@echo ""
	@echo "Database:"
	@echo "  make db-shell       - Connect to PostgreSQL shell"
	@echo "  make db-clean       - Remove database volume (WARNING: loses data)"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean          - Remove all containers and volumes (WARNING: loses data)"
	@echo "  make clean-images   - Remove all built images"
	@echo ""
	@echo "Utilities:"
	@echo "  make health         - Check health status of all services"
	@echo "  make test-api       - Test API endpoints"

setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✓ Created .env file from .env.example"; \
		echo "⚠️  Please edit .env and add your OpenWeatherMap API key"; \
	else \
		echo "✓ .env file already exists"; \
	fi

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f db

ps:
	docker compose ps

db-shell:
	docker compose exec db psql -U postgres -d weather_db

db-clean:
	docker compose down -v
	@echo "✓ Database volume removed"

health:
	@echo "Service Health Status:"
	@docker compose ps --format "table {{.Names}}\t{{.Status}}"

test-api:
	@echo "Testing API endpoints..."
	@echo ""
	@echo "1. Health Check:"
	@curl -s http://localhost:3000/api/health | jq . || echo "✗ Backend not responding"
	@echo ""
	@echo "2. Weather (London):"
	@curl -s "http://localhost:3000/api/weather?city=London" | jq . || echo "✗ API call failed (check API key)"
	@echo ""
	@echo "3. History:"
	@curl -s http://localhost:3000/api/history | jq . || echo "✗ History endpoint failed"
	@echo ""
	@echo "4. Frontend:"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8080 || echo "✗ Frontend not responding"

clean:
	docker compose down -v
	@echo "✓ All containers and volumes removed"

clean-images:
	docker rmi weather-dashboard-backend weather-dashboard-frontend 2>/dev/null || true
	@echo "✓ Images removed"

# Alternative quick start
quickstart: setup build up
	@echo ""
	@echo "✓ Weather Dashboard is starting!"
	@echo ""
	@echo "Access the application:"
	@echo "  Frontend:  http://localhost:8080"
	@echo "  Backend:   http://localhost:3000"
	@echo ""
	@echo "View logs:  make logs"
	@echo "Check health: make health"
