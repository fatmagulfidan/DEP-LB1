# Weather Dashboard - Multi-Service Docker Application

A complete weather dashboard application demonstrating a multi-service Docker Compose setup with a Node.js/Express backend, Nginx frontend, and PostgreSQL database.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Network                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │   Frontend       │  │   Backend API    │             │
│  │  (Nginx Port 80) │  │  (Express:3000)  │             │
│  └────────┬─────────┘  └────────┬─────────┘             │
│           │                    │                        │
│           │                    │                        │
│           └────────┬───────────┘                        │
│                    │                                    │
│           ┌────────▼────────┐                          │
│           │  PostgreSQL     │                          │
│           │  (Port 5432)    │                          │
│           │  Named Volume   │                          │
│           └─────────────────┘                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📋 Features

- **Frontend**: Responsive HTML/CSS/JavaScript dashboard
  - Search for weather by city name
  - Display current weather conditions
  - View search history
  - Mobile-friendly design

- **Backend**: Node.js/Express API
  - Multi-stage Docker build for optimized image
  - Structured JSON logging with timestamps
  - OpenWeatherMap API integration
  - Search history stored in PostgreSQL
  - Health check endpoint
  - Non-root user for security

- **Database**: PostgreSQL
  - Persistent data storage with named volume
  - Automatic initialization script
  - Indexed queries for performance

- **Docker Compose**: Production-like setup
  - Custom bridge network for service communication
  - Health checks with dependencies (`depends_on`)
  - Restart policies for high availability
  - Environment variable configuration
  - Multi-stage builds for backend

## 🚀 Quick Start

### Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 1.29+)
- OpenWeatherMap API key (free tier available)

### Step 1: Clone/Navigate to Project

```bash
cd /path/to/DEP-LB1
```

### Step 2: Create Environment File

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenWeatherMap API key:

```bash
# Open with your editor
vim .env  # or nano, code, etc.
```

Fill in the required values:
```env
NODE_ENV=production
BACKEND_PORT=3000
FRONTEND_PORT=8080
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=weather_db
OPENWEATHER_API_KEY=your_api_key_here
```

**To get an OpenWeatherMap API key:**
1. Visit https://openweathermap.org/api
2. Sign up for a free account
3. Create an API key (Current Weather Data API)
4. Copy the key to your `.env` file

### Step 3: Build and Start Services

```bash
docker compose up --build
```

This command will:
- Build the backend and frontend images
- Create the custom Docker network
- Start all three services (database, backend, frontend)
- Wait for health checks to pass
- Establish service dependencies

### Step 4: Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000/api
  - Health: http://localhost:3000/api/health
  - Weather: http://localhost:3000/api/weather?city=London
  - History: http://localhost:3000/api/history

## 📚 Project Structure

```
DEP-LB1/
├── docker-compose.yml          # Docker Compose orchestration
├── .env.example                # Environment variables template
├── .env                        # Environment file (create from example)
│
├── backend/
│   ├── Dockerfile              # Multi-stage backend build
│   ├── package.json            # Node.js dependencies
│   └── app.js                  # Express application
│
├── frontend/
│   ├── Dockerfile              # Nginx container
│   ├── index.html              # Web interface
│   └── nginx.conf              # Nginx configuration with API proxy
│
└── postgres/
    └── init.sql                # Database initialization script
```

## 🔧 API Endpoints

### Health Check
```
GET /api/health
Response: { "status": "healthy" }
```

### Get Weather
```
GET /api/weather?city=London
Response: {
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

### Get Search History
```
GET /api/history
Response: [
  {
    "city": "London",
    "last_searched": "2026-05-02T10:30:00.000Z"
  },
  ...
]
```

## 🔍 Monitoring and Debugging

### View Logs

View logs from all services:
```bash
docker compose logs -f
```

View logs from specific service:
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Check Service Health

```bash
docker compose ps
```

Output shows health status of each service:
```
CONTAINER        STATUS
weather_db       healthy
weather_backend  healthy
weather_frontend healthy
```

### Connect to Database

```bash
docker compose exec db psql -U postgres -d weather_db
```

Common PostgreSQL commands:
```sql
-- List tables
\dt

-- View search history
SELECT * FROM search_history;

-- View search statistics
SELECT city, COUNT(*) as searches FROM search_history GROUP BY city ORDER BY searches DESC;

-- Exit
\q
```

### View Backend Logs (Structured JSON)

```bash
docker compose logs backend | grep "INFO"
```

Example log entries:
```json
{"timestamp":"2026-05-02T10:30:45.123Z","level":"INFO","message":"Server started","port":3000,"environment":"production"}
{"timestamp":"2026-05-02T10:31:00.456Z","level":"INFO","message":"Fetching weather data","city":"London"}
{"timestamp":"2026-05-02T10:31:01.789Z","level":"INFO","message":"Search history recorded","city":"London"}
```

## 🛑 Stop and Remove Services

### Stop Services (Keep Data)
```bash
docker compose down
```

### Remove Everything (Including Data)
```bash
docker compose down -v
```

## 🔐 Security Considerations

✅ **Implemented:**
- Non-root user in backend container (nodejs:1001)
- No hardcoded secrets (environment variables)
- Health checks prevent unhealthy services from serving traffic
- PostgreSQL password via environment variable
- Service isolation via custom Docker network
- Nginx reverse proxy protecting backend

⚠️ **For Production:**
- Use strong, random password for DB_PASSWORD
- Store `.env` file securely (use secrets manager)
- Enable HTTPS/TLS for frontend and backend
- Add authentication/authorization layer
- Use private container registry
- Implement rate limiting
- Add WAF (Web Application Firewall)
- Regularly update base images

## 🐛 Troubleshooting

### Backend container keeps restarting
**Problem**: Backend can't connect to database
```bash
docker compose logs backend
```
**Solution**: Wait 40 seconds for database health check to pass, or check POSTGRES_PASSWORD in `.env`

### API requests fail with 502
**Problem**: Nginx can't reach backend
```bash
# Check backend is running and healthy
docker compose ps

# Check network connectivity
docker compose exec frontend ping backend
```
**Solution**: Ensure backend service is healthy before making requests

### "Invalid API key" error
**Problem**: OpenWeatherMap API key is invalid or missing
```bash
# Check environment variable
docker compose exec backend env | grep OPENWEATHER
```
**Solution**: Verify API key in `.env` file is correct

### Database connection refused
**Problem**: PostgreSQL service not ready
```bash
docker compose logs db
```
**Solution**: Check logs, wait for service_healthy status

### Frontend can't access backend
**Problem**: CORS or networking issue
**Solution**: Verify nginx.conf proxy_pass points to correct backend URL

## 📊 Performance Tips

1. **Use Alpine images**: Already implemented (postgres:15-alpine, node:18-alpine, nginx:alpine)
2. **Multi-stage builds**: Backend uses multi-stage for smaller image size
3. **Named volume**: PostgreSQL data persists efficiently
4. **Health checks**: Prevent requests to failing services
5. **Connection pooling**: Backend uses pg connection pool (default 10 connections)

## 🔄 Deployment Considerations

This setup is suitable for:
- ✅ Development environments
- ✅ Testing and staging
- ✅ Docker learning
- ⚠️ Small production deployments (with security hardening)

For production, consider:
- Kubernetes instead of Docker Compose
- Managed database services (AWS RDS, Azure Database)
- CDN for frontend
- Load balancing
- Monitoring and alerting (Prometheus, Grafana)
- Centralized logging (ELK, Splunk)

## 📖 Useful Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 📝 License

This project is provided as an educational example.

## ✨ Features Demonstrated

This application showcases Docker Compose best practices:
- ✅ Multi-stage builds
- ✅ Custom networks
- ✅ Health checks
- ✅ Service dependencies
- ✅ Named volumes
- ✅ Environment configuration
- ✅ Restart policies
- ✅ Structured logging
- ✅ Security best practices
- ✅ Production-like architecture
