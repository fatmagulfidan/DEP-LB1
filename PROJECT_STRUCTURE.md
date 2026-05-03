# 📁 Project Structure Overview

## Complete Weather Dashboard Application

This is a production-ready multi-service application built with Docker Compose, showcasing best practices in containerization, networking, and application architecture.

---

## 🗂️ Directory Structure

```
DEP-LB1/
│
├── 📄 docker-compose.yml          # Main orchestration file (production)
├── 📄 docker-compose.override.yml # Development overrides (auto-loaded)
├── 📄 .env.example                # Environment variables template
├── 📄 .env.development            # Development env preset
├── 📄 .gitignore                  # Git ignore patterns
├── 📄 Makefile                    # Convenient command shortcuts
├── 📄 README.md                   # Comprehensive documentation
├── 📄 QUICKSTART.md              # Quick start guide
├── 📄 PROJECT_STRUCTURE.md        # This file
│
├── 📁 backend/                    # Node.js/Express API service
│   ├── Dockerfile                # Multi-stage build (builder + final)
│   ├── .dockerignore             # Docker build context optimization
│   ├── package.json              # Node.js dependencies
│   └── app.js                    # Express application (400+ lines)
│
├── 📁 frontend/                   # Nginx web server + static files
│   ├── Dockerfile                # Alpine Linux Nginx image
│   ├── .dockerignore             # Docker build context optimization
│   ├── index.html                # Web interface (500+ lines with embedded CSS/JS)
│   └── nginx.conf                # Reverse proxy configuration
│
└── 📁 postgres/                   # Database initialization
    └── init.sql                  # Schema and initial data
```

---

## 📋 File Descriptions

### Root Configuration Files

#### `docker-compose.yml`
- **Purpose**: Orchestrates all three services
- **Features**:
  - Defines database, backend, and frontend services
  - Custom bridge network: `weather_network`
  - Named volume: `postgres_data` for persistent storage
  - Health checks for all services
  - Service dependencies with `condition: service_healthy`
  - Restart policies (`restart: always`)
  - Port mappings (3000, 8080, 5432)
  - Environment variable injection

#### `docker-compose.override.yml`
- **Purpose**: Development-only overrides (auto-loaded)
- **Features**:
  - Mounts local code for hot-reload
  - Sets NODE_ENV to development
  - Relaxed restart policies

#### `.env.example`
- **Purpose**: Template showing required environment variables
- **Variables**:
  ```
  NODE_ENV          → Application environment
  BACKEND_PORT      → Backend service port
  FRONTEND_PORT     → Frontend service port
  DB_USER           → PostgreSQL user
  DB_PASSWORD       → PostgreSQL password
  DB_NAME           → Database name
  OPENWEATHER_API_KEY → External API credentials
  ```

#### `.env.development`
- **Purpose**: Pre-configured development environment
- **Usage**: `docker compose --env-file .env.development up`

#### `Makefile`
- **Purpose**: Convenient command shortcuts
- **Common commands**:
  ```bash
  make setup        # Initial setup
  make up          # Start services
  make logs        # View logs
  make db-shell    # Connect to database
  make test-api    # Test endpoints
  make clean       # Remove everything
  ```

#### `.gitignore`
- **Purpose**: Prevent committing sensitive files
- **Ignores**:
  - `.env` files
  - `node_modules/`
  - OS files (`.DS_Store`, etc.)
  - IDE files (`.vscode/`, `.idea/`)

---

## 🖥️ Backend Service (`backend/`)

### Key Features
- **Framework**: Express.js (4.18.2)
- **Runtime**: Node.js 18 Alpine
- **Database**: PostgreSQL via `pg` library
- **HTTP Client**: Axios for external API calls
- **Security**: Non-root user, no hardcoded secrets

### `Dockerfile`
- **Multi-stage build** (2 stages):
  1. **Builder stage**: Installs dependencies with `npm ci`
  2. **Final stage**: Copies only production artifacts
- **Security**:
  - Non-root user (nodejs:1001)
  - Minimal attack surface
- **Health check**: HTTP GET /api/health every 30s
- **Base image**: `node:18-alpine` (50MB vs 300MB+ standard)

### `app.js` (Express Application)
- **Dependencies**:
  - express: Web framework
  - pg: PostgreSQL connection pool
  - axios: HTTP client for OpenWeatherMap API
  - cors: Cross-origin requests
  - dotenv: Environment variable loading

- **Key Features**:
  1. **Structured JSON Logging**
     ```javascript
     {"timestamp":"2026-05-02T...", "level":"INFO", "message":"...", ...}
     ```
  
  2. **Database Setup**
     - Auto-creates `search_history` table on startup
     - Connection pool with PostgreSQL
     - Graceful shutdown handling

  3. **REST API Endpoints**
     - `GET /api/health` → Service health check
     - `GET /api/weather?city=NAME` → Fetch weather from OpenWeatherMap
     - `GET /api/history` → Search history (top 20)

  4. **Error Handling**
     - Comprehensive try-catch blocks
     - Graceful degradation (history recording failure doesn't break weather fetch)
     - HTTP status codes (400, 500, etc.)

### `package.json`
```json
{
  "dependencies": {
    "express": "^4.18.2",      // Web server
    "axios": "^1.4.0",         // HTTP client
    "pg": "^8.11.0",           // PostgreSQL driver
    "cors": "^2.8.5",          // CORS middleware
    "dotenv": "^16.3.1"        // Env variables
  },
  "devDependencies": {
    "nodemon": "^3.0.1"        // Auto-reload (dev only)
  }
}
```

### `.dockerignore`
```
node_modules
npm-debug.log
.git
.gitignore
.env
.DS_Store
.vscode
```

---

## 🌐 Frontend Service (`frontend/`)

### Key Features
- **Server**: Nginx Alpine (15MB)
- **Interface**: Responsive HTML5 + CSS3 + Vanilla JavaScript
- **Styling**: Modern gradient design, mobile-friendly
- **Functionality**: City search, weather display, history tracking

### `Dockerfile`
- **Base image**: `nginx:alpine` (minimal size)
- **Multi-file copy**: HTML and nginx config
- **Health check**: wget to verify HTTP 200
- **Port**: 80 (exposed)

### `index.html` (Web Interface)
- **Sections**:
  1. **Header**: Application title
  2. **Search Section**: Input field + Search button
  3. **Weather Display**: Responsive grid with:
     - Temperature, Feels Like, Humidity
     - Pressure, Wind Speed
     - Weather icon from OpenWeatherMap
     - City name and description
  
  4. **Search History**: 
     - Clickable list of previous searches
     - Query distinct cities with latest search time
     - One-click re-search

- **Styling**:
  ```css
  - Gradient background (#667eea → #764ba2)
  - Responsive grid (mobile, tablet, desktop)
  - Smooth transitions and hover effects
  - Shadow effects and rounded corners
  - Clean, modern typography
  ```

- **JavaScript Features**:
  ```javascript
  - Fetch API calls to backend
  - Error handling and user feedback
  - Loading indicators
  - History list management
  - Enter key support for search
  - Responsive error messages
  ```

### `nginx.conf` (Reverse Proxy)
```nginx
# Serves static files from /usr/share/nginx/html
location / { root /usr/share/nginx/html; }

# Proxies /api/* to backend:3000
location /api/ { proxy_pass http://backend:3000; }

# Denies access to hidden files
location ~ /\. { deny all; }
```

---

## 🗄️ Database Service (`postgres/`)

### Configuration
- **Image**: `postgres:15-alpine`
- **Port**: 5432 (internal), mapped externally
- **Volume**: Named volume `postgres_data` (persistent)
- **Health Check**: `pg_isready` every 10s

### `init.sql` (Initialization Script)
```sql
-- Creates search_history table with:
-- - id (PRIMARY KEY, auto-increment)
-- - city (VARCHAR 100)
-- - searched_at (TIMESTAMP, defaults to NOW())

-- Creates index for performance:
-- - idx_city_searched_at (for GROUP BY queries)

-- Sample data (London, Paris, Tokyo)
```

### Features
- **Automatic table creation** on first run
- **Persistent data** via named volume
- **Indexed queries** for fast searches
- **Connection pooling** from backend
- **Readonly initialization** (safe to re-run)

---

## 🔌 Docker Compose Architecture

### Services Dependencies
```
frontend (port 8080)
    ↓ depends_on (service_healthy)
backend (port 3000)
    ↓ depends_on (service_healthy)
db (port 5432)
    ↓
    Named Volume: postgres_data
```

### Custom Network
- **Name**: `weather_network`
- **Type**: Bridge
- **Purpose**: Service-to-service communication
- **Features**:
  - Services can reach each other via hostname
  - `backend` → `db` via `db:5432`
  - `frontend` → `backend` via `backend:3000`
  - Isolated from other Docker networks

### Health Checks
```yaml
backend:
  HEALTHCHECK every 30s, timeout 10s, starts after 40s
  Test: HTTP GET /api/health → 200 response

frontend:
  HEALTHCHECK every 30s, timeout 10s, starts after 10s
  Test: wget http://localhost/ → 200 response

db:
  HEALTHCHECK every 10s, timeout 5s, retries 5
  Test: pg_isready -U postgres
```

### Restart Policies
- All services: `restart: always`
- Automatically restarts failed containers
- Ensures high availability

---

## 🔐 Security Features

### Implemented
✅ Non-root user in backend container (nodejs:1001)
✅ No hardcoded secrets (environment variables only)
✅ Service isolation via custom network
✅ Health checks prevent unhealthy traffic
✅ Nginx reverse proxy (backend not directly exposed)
✅ CORS enabled for frontend
✅ .dockerignore files optimize build context
✅ Graceful shutdown handling

### Recommendations for Production
⚠️ Use strong, random DB_PASSWORD
⚠️ Store .env file securely (use secrets manager)
⚠️ Enable HTTPS/TLS
⚠️ Add authentication layer
⚠️ Use private container registry
⚠️ Implement rate limiting
⚠️ Add Web Application Firewall
⚠️ Enable container scanning
⚠️ Regular security audits

---

## 📊 Resource Optimization

### Image Sizes
- **Base images**:
  - nginx:alpine ≈ 15 MB
  - node:18-alpine ≈ 160 MB
  - postgres:15-alpine ≈ 200 MB
  
- **Final sizes**:
  - backend ≈ 180 MB (after multi-stage build)
  - frontend ≈ 20 MB (minimal layers)
  - postgres ≈ 200 MB

### Performance Features
- **Alpine Linux**: Minimal OS footprint
- **Multi-stage builds**: Removes build artifacts
- **Connection pooling**: Database efficiency
- **Nginx caching**: Frontend performance
- **Volume mounts**: Persistent storage
- **Network isolation**: Reduced port exposure

---

## 🚀 Deployment Workflow

### Development
```bash
# Initial setup
cp .env.example .env
nano .env  # Add API key
docker compose up

# code editing → auto-reload (via volume mount)
```

### Testing
```bash
# Run full stack test
docker compose up
curl http://localhost:8080          # Frontend
curl http://localhost:3000/api/health  # Backend
```

### Production
```bash
# Build for production
docker compose build

# Start with production config
docker compose up -d

# Verify health
docker compose ps
```

---

## 📚 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Nginx | Alpine |
| | HTML5/CSS3/JS | Latest |
| **Backend** | Node.js | 18 |
| | Express.js | 4.18.2 |
| | Axios | 1.4.0 |
| **Database** | PostgreSQL | 15 |
| | pg (driver) | 8.11.0 |
| **Orchestration** | Docker | 20.10+ |
| | Docker Compose | 1.29+ |

---

## 🎯 Learning Outcomes

This project demonstrates:
- ✅ Docker multi-stage builds
- ✅ Docker Compose orchestration
- ✅ Custom networks
- ✅ Health checks and dependencies
- ✅ Named volumes
- ✅ Environment configuration
- ✅ Service communication
- ✅ Reverse proxy setup
- ✅ Structured logging
- ✅ Security best practices
- ✅ Production-ready architecture
- ✅ Database initialization
- ✅ API integration

---

## 📞 Support & Documentation

- **Quick Start**: See [QUICKSTART.md](QUICKSTART.md)
- **Full Docs**: See [README.md](README.md)
- **Commands**: Use `make help` or review [Makefile](Makefile)

---

## 📝 Version History

- **v1.0** (2026-05-02): Initial multi-service application
  - Backend API with OpenWeatherMap integration
  - Responsive frontend with search history
  - PostgreSQL database with persistent volume
  - Docker Compose orchestration
  - Production-ready configuration
