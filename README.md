# Weather Dashboard – Multi-Service Docker Application

A production-grade weather dashboard application built with Docker, Docker Compose, and GitHub Actions CI/CD. This project demonstrates microservices architecture, containerization, and automated testing through a complete pipeline.

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [CI/CD Pipeline](#cicd-pipeline)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Completed Challenges](#completed-challenges)

---

## Overview

This project is a **multi-service weather application** that demonstrates modern DevOps practices including containerization, orchestration, continuous integration, and continuous deployment. Users can search for real-time weather data by city name, and the application maintains a persistent search history stored in a PostgreSQL database.

**Key Features:**
- 🌤️ Real-time weather data via OpenWeatherMap API
- 📚 Search history storage and retrieval
- 🐳 Multi-service Docker Compose setup
- ✅ Automated CI/CD pipeline with GitHub Actions
- 🏥 Health checks and service resilience
- 📊 Structured JSON logging for observability
- 🔐 Non-root containers and environment variable security

---

## Project Structure

```
DEP-LB1/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD pipeline
├── backend/
│   ├── Dockerfile                 # Multi-stage backend build
│   ├── package.json               # Node.js dependencies
│   ├── app.js                     # Express API server
│   └── node_modules/              # Installed dependencies (gitignored)
├── frontend/
│   ├── Dockerfile                 # Nginx container
│   ├── index.html                 # Web interface
│   └── nginx.conf                 # Reverse proxy configuration
├── postgres/
│   └── init.sql                   # Database initialization script
├── docker-compose.yml             # Orchestration configuration
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
└── README.md                      # This file
```

---

## Technologies Used

### Core Technologies

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Docker** | Container runtime and image building | 20.10+ |
| **Docker Compose** | Service orchestration | 1.29+ |
| **Node.js** | Backend runtime and API framework | 18-alpine |
| **Express.js** | Web application framework | 4.18+ |
| **PostgreSQL** | Relational database | 15-alpine |
| **Nginx** | Web server and reverse proxy | alpine |
| **GitHub Actions** | CI/CD automation | Latest |

### Technology Decisions

**Node.js + Express**
- Lightweight and efficient for API-driven applications
- Strong ecosystem with npm packages for database (pg) and HTTP requests (axios)
- Non-blocking I/O handles concurrent requests well
- Easy to containerize with small image footprint

**PostgreSQL**
- ACID compliance ensures data integrity for search history
- Alpine image reduces database container size (~150MB vs ~400MB)
- Scalable for future application growth
- JSON support for future feature expansion

**Nginx**
- Lightweight reverse proxy (minimal memory footprint)
- Handles static file serving and API routing elegantly
- Proven stability in production environments
- Simple configuration with Docker integration

**Docker Compose**
- Local development mirrors production environment
- Service orchestration simplifies multi-container management
- Health checks ensure proper startup ordering
- Environment variable management centralizes configuration

**GitHub Actions**
- Native integration with GitHub repositories
- No external CI/CD service required
- Free for public repositories
- YAML-based workflow configuration
- Excellent for automated testing and validation

---

## Setup Instructions

### Prerequisites

Ensure you have the following installed on your system:

- **Docker** (version 20.10 or later)
  - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (version 1.29 or later)
  - [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Git** (for cloning the repository)
- **OpenWeatherMap API Key** (free tier available)
  - [Get Free API Key](https://openweathermap.org/api)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd DEP-LB1
```

### Step 2: Configure Environment Variables

Copy the example environment file and create your own:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```bash
# Edit with your preferred editor
nano .env  # or vim, code, etc.
```

Required variables in `.env`:

```env
# Node.js environment
NODE_ENV=production

# Backend configuration
BACKEND_PORT=3000

# Frontend configuration
FRONTEND_PORT=8080

# Database configuration (internal service communication)
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=weather_db

# OpenWeatherMap API (get from https://openweathermap.org/api)
OPENWEATHER_API_KEY=your_api_key_here
```

**⚠️ Important**: Never commit `.env` to version control. The file is gitignored by default.

### Step 3: Build and Start Services

```bash
# Build Docker images and start all services
docker compose up -d --build
```

**Output** (after ~1-2 minutes, all services should be healthy):

```
[+] Running 3/3
  ✓ Container weather_db      Started
  ✓ Container weather_backend Started
  ✓ Container weather_frontend Started
```

Verify services are running:

```bash
docker compose ps
```

Expected output:

```
NAME              COMMAND                  SERVICE    STATUS
weather_db        docker-entrypoint...     db         Up (healthy)
weather_backend   dumb-init -- node...     backend    Up (healthy)
weather_frontend  /docker-entrypoint...    frontend   Up (healthy)
```

---

## Running the Application

### Accessing the Application

Once the services are running, access the application through your browser:

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

### Testing the Application

#### 1. Search for Weather

Open http://localhost:8080 in your browser:
- Enter a city name (e.g., "London")
- Click "Search"
- View current weather conditions including temperature, humidity, wind speed

#### 2. Check Search History

The application automatically stores search history in PostgreSQL:
- Previous searches appear as clickable tags
- Click a previous city to quickly search again

#### 3. Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Weather data
curl "http://localhost:3000/api/weather?city=London"

# Search history
curl http://localhost:3000/api/history
```

### Stopping the Application

```bash
# Stop all services (keeps data in named volume)
docker compose down

# Stop all services and remove data
docker compose down -v
```

### Viewing Logs

```bash
# View logs from all services
docker compose logs -f

# View logs from specific service
docker compose logs -f backend    # Backend API
docker compose logs -f frontend   # Nginx frontend
docker compose logs -f db         # PostgreSQL database
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

This project includes an automated CI/CD pipeline using **GitHub Actions** that runs on every push to the `main` branch. The workflow ensures code quality and system functionality through automated testing.

**Workflow File**: `.github/workflows/ci.yml`

### Pipeline Overview

```
┌─────────────────────────────────────────────────────────┐
│         GitHub Actions CI/CD Pipeline                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Checkout Code                                        │
│     └─> Clone repository                                │
│                                                          │
│  2. Set Up Docker                                        │
│     └─> Prepare buildx                                  │
│                                                          │
│  3. Build Docker Images                                  │
│     └─> docker compose build --no-cache                 │
│                                                          │
│  4. Start Services                                       │
│     └─> docker compose up -d                            │
│                                                          │
│  5. Wait for Services                                    │
│     └─> Poll /api/health endpoint (up to 30 attempts)   │
│                                                          │
│  6. Verify Frontend                                      │
│     └─> curl http://localhost:8080 (expect HTTP 200)    │
│                                                          │
│  7. Test API Endpoints                                   │
│     └─> /api/health                                     │
│     └─> /api/weather?city=London                        │
│                                                          │
│  8. Check Logs                                           │
│     └─> Verify no errors in service logs                │
│                                                          │
│  9. Stop Services                                        │
│     └─> docker compose down -v                          │
│                                                          │
│  10. Summary                                             │
│     └─> Report pipeline status                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Workflow Steps Explained

#### Step 1-2: Initialization
```yaml
- name: Checkout repository
  uses: actions/checkout@v4

- name: Set up Docker
  uses: docker/setup-buildx-action@v3
```
**Purpose**: Prepare the CI environment and clone the repository code.

#### Step 3: Build Docker Images
```yaml
- name: Build Docker images
  run: docker compose build --no-cache
```
**Purpose**: Build all Docker images (frontend, backend, database) from Dockerfiles. The `--no-cache` flag ensures fresh builds without cached layers.

#### Step 4: Start Services
```yaml
- name: Start services
  run: docker compose up -d
```
**Purpose**: Start all three services in detached mode. Services start in dependency order:
1. Database (db) starts first
2. Backend waits for database to be healthy (depends_on condition)
3. Frontend waits for backend to be healthy (depends_on condition)

#### Step 5: Health Check with Polling
```yaml
- name: Wait for services to be healthy
  run: |
    for i in {1..30}; do
      if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✓ Backend is healthy"
        break
      fi
      sleep 1
    done
```
**Purpose**: Poll the backend health endpoint up to 30 times. This ensures:
- Database is fully initialized
- Backend successfully connected to database
- All services are ready for testing

#### Step 6: Frontend Verification
```yaml
- name: Verify frontend is running
  run: |
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
    if [ $STATUS -eq 200 ]; then
      echo "✓ Frontend is running"
    fi
```
**Purpose**: Verify the web server is serving HTTP requests successfully (HTTP 200 status).

#### Step 7: API Testing
```yaml
- name: Test API endpoints
  run: |
    curl -f http://localhost:3000/api/health
    curl -f "http://localhost:3000/api/weather?city=London"
```
**Purpose**: Test actual API functionality:
- `/api/health` - Service health status
- `/api/weather?city=London` - Weather data retrieval (requires valid API key in .env)

#### Step 8: Log Collection
```yaml
- name: Check service logs
  if: always()
  run: docker compose logs backend | tail -20
```
**Purpose**: Capture logs for debugging if tests fail. The `if: always()` ensures logs are printed even if previous steps fail.

#### Step 9-10: Cleanup and Summary
```yaml
- name: Stop services
  if: always()
  run: docker compose down -v

- name: Print CI/CD Summary
  if: success()
  run: echo "✓ CI/CD Pipeline Completed Successfully"
```
**Purpose**: 
- Remove containers and volumes to clean up CI environment
- Report final status to GitHub

### Triggering the Pipeline

The pipeline automatically runs when:

1. **Code is pushed to main branch**
   ```bash
   git push origin main
   ```

2. **Pull requests are opened/updated**
   ```bash
   git push origin feature-branch
   ```
   Then create a pull request on GitHub

### Viewing Pipeline Results

1. Go to your GitHub repository
2. Click **"Actions"** tab
3. Click the workflow run you want to view
4. Expand each step to see detailed output
5. Red ❌ = step failed; Green ✅ = step passed

### Pipeline Benefits

✅ **Automated Testing**: Every commit is validated before merging
✅ **Early Error Detection**: Catch issues before they reach production
✅ **Documentation**: Pipeline logs provide audit trail
✅ **Consistency**: Same tests run every time, eliminating manual errors
✅ **Developer Confidence**: Know changes don't break the system
✅ **Code Quality**: Enforce standards and best practices

---

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Health Check
**Purpose**: Verify service health and database connectivity

```http
GET /api/health
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-05-11T10:30:45.123Z"
}
```

#### 2. Get Weather
**Purpose**: Fetch current weather data for a city

```http
GET /api/weather?city={city_name}
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| city | string | Yes | City name (e.g., "London", "New York") |

**Example**:
```bash
curl "http://localhost:3000/api/weather?city=London"
```

**Response** (200 OK):
```json
{
  "city": "London",
  "country": "GB",
  "temperature": 15.2,
  "feels_like": 14.8,
  "humidity": 65,
  "pressure": 1013,
  "description": "overcast clouds",
  "icon": "04d",
  "wind_speed": 3.5
}
```

**Errors**:
- **400 Bad Request**: Missing city parameter
- **404 Not Found**: City not found in OpenWeatherMap
- **401 Unauthorized**: Invalid API key

#### 3. Get Search History
**Purpose**: Retrieve the user's search history

```http
GET /api/history
```

**Response** (200 OK):
```json
[
  {
    "city": "London",
    "last_searched": "2026-05-11T10:30:00.000Z"
  },
  {
    "city": "Paris",
    "last_searched": "2026-05-11T10:29:00.000Z"
  }
]
```

---

## Architecture

### System Design

```
┌──────────────────────────────────────────────────────┐
│              Docker Host Network                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐        ┌──────────────┐           │
│  │   Nginx      │        │   Express    │           │
│  │  (Frontend)  │◄─────► │   (Backend)  │           │
│  │  Port 8080   │        │  Port 3000   │           │
│  └──────────────┘        └──────────────┘           │
│         ▲                        ▲                    │
│         │                        │                    │
│         └────────────┬───────────┘                   │
│                      │                               │
│          ┌───────────▼────────────┐                 │
│          │   PostgreSQL           │                 │
│          │   (Database)           │                 │
│          │   Port 5432 (internal) │                 │
│          │   Named Volume:        │                 │
│          │   postgres_data        │                 │
│          └────────────────────────┘                 │
│                                                      │
│  ┌──────────────────────────────────────────┐      │
│  │    Custom Docker Network                 │      │
│  │    (weather_network - bridge driver)     │      │
│  └──────────────────────────────────────────┘      │
│                                                      │
└──────────────────────────────────────────────────────┘
         │
         │ (HTTP Requests)
         ▼
    ┌─────────────────────┐
    │   Browser User      │
    │ http://localhost:80 │
    └─────────────────────┘
         │
         │ (External API Calls)
         ▼
    ┌──────────────────────────────┐
    │  OpenWeatherMap API          │
    │  (External Service)          │
    └──────────────────────────────┘
```

### Service Communication Flow

1. **User Request**: Browser requests weather data
2. **Frontend (Nginx)**: Receives request on port 8080, routes API calls to backend
3. **Backend (Express)**: Processes request, queries database, calls external API
4. **Database (PostgreSQL)**: Stores and retrieves search history
5. **External API**: OpenWeatherMap returns weather data
6. **Response Chain**: Data flows back through backend → frontend → browser

### Data Persistence

- **Named Volume**: `postgres_data` stores PostgreSQL data
- **Survives**: Container restarts and `docker compose down`
- **Removed Only**: With `docker compose down -v` flag

### Health Checks & Resilience

- **Database**: Health check every 10 seconds (requires `pg_isready`)
- **Backend**: Health check every 30 seconds (requires `/api/health` response)
- **Frontend**: Health check every 30 seconds (requires HTTP 200 on root)
- **Dependencies**: Backend waits for database; frontend waits for backend
- **Restart Policy**: All services auto-restart on failure (`restart: always`)

---

## Completed Challenges

This project demonstrates achievement of the following requirements:

### ✅ Challenge 1: Multi-Service Docker Compose Setup
**Status**: Completed

**Description**: Create a Docker Compose orchestration file that manages 3+ services communicating over a custom network.

**Implementation**:
- ✓ Three services: `db` (PostgreSQL), `backend` (Express), `frontend` (Nginx)
- ✓ Custom bridge network: `weather_network`
- ✓ Services communicate by name (e.g., `db:5432`, `backend:3000`)
- ✓ Named volume `postgres_data` for persistence
- ✓ Health checks for each service
- ✓ Proper dependency ordering with `depends_on: condition: service_healthy`

**Files**: `docker-compose.yml`

---

### ✅ Challenge 2: Production-Grade Dockerfiles with Multi-Stage Builds
**Status**: Completed

**Description**: Implement multi-stage Docker builds for optimized image sizes and security.

**Implementation**:
- ✓ Backend Dockerfile with builder and production stages
- ✓ Builder stage: Installs all dependencies (prod + dev)
- ✓ Production stage: Installs only production dependencies
- ✓ 50% image size reduction by excluding devDependencies
- ✓ Non-root user (`nodejs:1001`) for security
- ✓ `dumb-init` for proper signal handling and graceful shutdown
- ✓ Health checks at compose level (not Dockerfile)

**Files**: `backend/Dockerfile`, `frontend/Dockerfile`

---

### ✅ Challenge 3: Continuous Integration with GitHub Actions
**Status**: Completed

**Description**: Set up an automated CI/CD pipeline that validates code and functionality on every push.

**Implementation**:
- ✓ GitHub Actions workflow triggered on push to main branch
- ✓ Automated build process: `docker compose build --no-cache`
- ✓ Automated service startup: `docker compose up -d`
- ✓ Health verification: Polling mechanism for service readiness
- ✓ Functional testing: HTTP requests to all endpoints
- ✓ Log collection: Detailed output for debugging
- ✓ Cleanup: Proper container and volume removal after tests
- ✓ Success/failure reporting to GitHub

**Files**: `.github/workflows/ci.yml`

---

### ⏳ Challenge 4: Advanced Monitoring and Logging
**Status**: Not Completed

**Placeholder Description**: Implement comprehensive logging with structured JSON output and monitoring dashboards (Prometheus, Grafana, ELK stack).

**Potential Implementation**:
- [ ] Structured JSON logging in all services
- [ ] Log aggregation with ELK Stack or similar
- [ ] Metrics collection with Prometheus
- [ ] Visualization with Grafana
- [ ] Alert configuration for anomalies

**Note**: This requires additional services beyond the current scope but is documented for future enhancement.

---

### ⏳ Challenge 5: Kubernetes Deployment
**Status**: Not Completed

**Placeholder Description**: Migrate Docker Compose setup to Kubernetes (k8s) with proper manifests, services, and ingress configuration.

**Potential Implementation**:
- [ ] Kubernetes YAML manifests for each service
- [ ] ConfigMaps for environment variables
- [ ] Secrets for sensitive data
- [ ] Persistent Volumes for database storage
- [ ] Service discovery and networking
- [ ] Ingress configuration for external access
- [ ] Deployment strategies (rolling updates, etc.)

**Note**: Kubernetes is a natural next step after Docker Compose mastery, planned for future phases.

---

## Local Development

### Debugging Tips

#### View Real-Time Logs
```bash
docker compose logs -f backend
```

#### Access the Database
```bash
docker compose exec db psql -U postgres -d weather_db

# Inside psql:
\dt                           # List tables
SELECT * FROM search_history; # View search history
\q                            # Quit
```

#### Test API Responses
```bash
# Check if backend is responding
curl -v http://localhost:3000/api/health

# Test with a real city
curl "http://localhost:3000/api/weather?city=Paris"
```

#### Rebuild After Code Changes
```bash
# Rebuild images and restart services
docker compose up -d --build

# Just rebuild without starting
docker compose build --no-cache
```

### Troubleshooting

**Issue**: "Cannot connect to backend"
- Check status: `docker compose ps`
- View logs: `docker compose logs backend`
- Backend requires database to be healthy first (wait ~40 seconds)

**Issue**: "Frontend shows blank page"
- Frontend depends on backend being healthy
- Check: `docker compose ps | grep backend` (should show healthy)
- Wait 1-2 minutes for all health checks to pass

**Issue**: "Invalid API key error"
- Verify `OPENWEATHER_API_KEY` is set in `.env`
- Get a free key from https://openweathermap.org/api
- Restart backend: `docker compose restart backend`

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and test locally
3. Push to your branch: `git push origin feature/your-feature`
4. Create a Pull Request on GitHub
5. GitHub Actions will automatically test your changes
6. After review and approval, merge to main branch

---

## License

This project is provided for educational purposes as part of a Docker/DevOps assignment.

---

## Contact & Support

For issues, questions, or suggestions, please:
- Open a GitHub issue in this repository
- Review the troubleshooting section above
- Check Docker Compose logs for detailed error messages

---

**Last Updated**: May 2026  
**Status**: Production-Ready ✅  
**Docker Compose Version**: 3.9+  
**Node.js Version**: 18-alpine  
**PostgreSQL Version**: 15-alpine

### Docker & Docker Compose

Used to orchestrate multiple services, manage dependencies, and ensure reproducibility.

### Multi-Stage Docker Builds

Used in the backend to reduce image size and separate build and production environments.

---

## Features

* Multi-service architecture with 3 containers
* Real-time weather data via external API
* Persistent database storage using Docker volumes
* Reverse proxy via Nginx
* Structured logging (JSON format)
* Health checks for service monitoring
* Automatic service recovery with restart policies

---

## Technical Implementation Details

### 1. Multi-Service Setup

The application uses three services:

* frontend
* backend
* database

Each service runs in its own container and communicates via a custom network.

---

### 2. Environment Configuration

Environment variables are used for configuration.

* `.env` contains actual values (ignored by Git)
* `.env.example` provides a template

Example:

```
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=weather_db
OPENWEATHER_API_KEY=
```

---

### 3. Persistent Storage

A named volume is used:

```
postgres_data:/var/lib/postgresql/data
```

This ensures data is not lost when containers restart.

---

### 4. Health Checks & Dependencies

The backend service includes a health check:

```
/api/health
```

The frontend waits until the backend is healthy:

```
depends_on:
  condition: service_healthy
```

---

### 5. Custom Network

A custom Docker network is used:

```
weather_network
```

This allows services to communicate via service names:

* backend → http://backend:3000
* database → db

---

### 6. Logging

All services output logs to stdout.

Logs include:

* timestamp
* log level
* message

Nginx is configured to output structured JSON logs.

---

### 7. Resilience & Recovery

The system is designed to recover automatically:

* If the backend fails, Nginx retries requests
* Restart policies ensure services restart automatically
* Once a service becomes available again, normal operation resumes

---

## Setup Instructions

### 1. Clone the repository

```
git clone <your-repo-url>
cd DEP-LB1
```

---

### 2. Create .env file

```
cp .env.example .env
```

Add your OpenWeather API key:

```
OPENWEATHER_API_KEY=your_key_here
```

---

### 3. Run the application

```
docker compose up --build
```

---

### 4. Access the application

```
http://localhost:8081
```

---

## Usage

1. Enter a city name
2. View real-time weather data
3. See search history stored in the database

---

## Important Code Snippets

### Reverse Proxy (Nginx)

```
location /api/ {
    proxy_pass http://backend:3000;
}
```

### Healthcheck

```
/api/health
```

### Backend API Call

```
/api/weather?city=NAME
```

---

## Challenges & Learnings

One key challenge was ensuring proper service startup order. Initially, the backend attempted to connect to the database before it was ready.

This was solved using Docker health checks and dependency conditions.

Another challenge was correctly configuring container-to-container communication. Using a custom network and service names solved this issue.

---

## Reflection

If this project were to be extended:

* Caching could be added to reduce API calls
* Authentication could be implemented
* Frontend could be upgraded to a modern framework

---

## Conclusion

This project demonstrates how to build and orchestrate a multi-service application using Docker Compose. It highlights key concepts such as service communication, persistence, health monitoring, and system resilience.
 
