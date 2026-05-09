# Weather Dashboard – Multi-Service Docker Compose Application

## Overview

This project demonstrates a multi-service application using Docker Compose. The application allows users to search for real-time weather data and stores search history persistently.

The system is composed of three services that interact with each other:

* Frontend (Nginx)
* Backend API (Node.js)
* Database (PostgreSQL)

The backend integrates with the OpenWeatherMap API to fetch live weather data.

---

## Architecture

```
Browser → Nginx (Frontend)
           ↓
        Backend API (Node.js)
           ↓
     PostgreSQL Database
           ↓
   External Weather API
```

### Description

* The frontend serves static content and proxies API requests to the backend.
* The backend handles business logic and external API communication.
* The database stores user search history persistently.
* All services communicate over a custom Docker network.

---

## Technologies & Decisions

### Node.js (Backend)

Chosen for its simplicity and strong ecosystem for building REST APIs.

### PostgreSQL (Database)

Used for reliable relational data storage and persistence.

### Nginx (Frontend)

Used to serve static files and act as a reverse proxy for API requests.

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
