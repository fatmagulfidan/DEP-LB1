# 🚀 Quick Start Guide

## 1️⃣ Setup (First Time Only)

```bash
# Navigate to project directory
cd /path/to/DEP-LB1

# Create .env file from template
cp .env.example .env

# Edit .env file and add your OpenWeatherMap API key
# Get a free API key from: https://openweathermap.org/api
nano .env  # or use your preferred editor
```

**Required environment variables:**
```env
OPENWEATHER_API_KEY=your_api_key_here  # REQUIRED
DB_PASSWORD=your_secure_password       # Change from default
```

## 2️⃣ Start Application

### Option A: Using Docker Compose (Recommended)
```bash
docker compose up --build
```

### Option B: Using Make (If installed)
```bash
make quickstart
```

## 3️⃣ Access Application

- **Web Interface**: http://localhost:8080
- **Backend API**: http://localhost:3000/api
- **Database**: localhost:5432 (postgres://postgres@localhost:5432/weather_db)

## ✅ Verify Everything Works

```bash
# Check all services are healthy
docker compose ps

# Test weather API
curl "http://localhost:3000/api/weather?city=London"

# View backend logs
docker compose logs backend
```

## 📋 Common Commands

```bash
# View logs in real-time
docker compose logs -f

# Stop services (keep data)
docker compose down

# Stop and remove all data
docker compose down -v

# Connect to database
docker compose exec db psql -U postgres -d weather_db

# Restart all services
docker compose restart
```

## 🆘 Troubleshooting

**Backend says "Invalid API key"**
- Check your OPENWEATHER_API_KEY in .env file
- Verify key is from https://openweathermap.org/api

**Backend won't start**
```bash
docker compose logs backend  # View error messages
```

**Database connection refused**
- Wait 40 seconds for PostgreSQL to start (first run)
- Check DB_PASSWORD is set correctly in .env

**Frontend can't access API**
- Ensure backend is healthy: `docker compose ps`
- Check logs: `docker compose logs frontend`

## 📚 Full Documentation

See [README.md](README.md) for complete documentation.
