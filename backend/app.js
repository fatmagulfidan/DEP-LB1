require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection with retry logic
let dbConnected = false;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'weather_db',
  // Connection retry settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Structured JSON Logger
function logEvent(level, message, data = {}) {
  const log = {
    timestamp: new Date().toISOString(),
    level: level,
    message: message,
    ...data,
  };
  console.log(JSON.stringify(log));
}

// Retry logic for database operations
async function retryWithExponentialBackoff(fn, maxRetries = 5, initialDelayMs = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delayMs = initialDelayMs * Math.pow(2, attempt);
      logEvent('WARN', `Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delayMs}ms`, {
        error: error.message,
        attempt: attempt + 1,
      });
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw lastError;
}

// Test database connectivity
async function testDatabaseConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    dbConnected = true;
    logEvent('INFO', 'Database connection successful', { 
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    dbConnected = false;
    logEvent('ERROR', 'Database connection failed', { error: error.message });
    throw error;
  }
}

// Initialize Database
async function initializeDatabase() {
  try {
    // Test connection with retries
    await retryWithExponentialBackoff(testDatabaseConnection, 5, 2000);
    
    // Create table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS search_history (
        id SERIAL PRIMARY KEY,
        city VARCHAR(100) NOT NULL,
        searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    logEvent('INFO', 'Database initialized successfully');
  } catch (error) {
    logEvent('ERROR', 'Database initialization failed', { 
      error: error.message,
      attempts_exhausted: true,
    });
    process.exit(1);
  }
}

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connectivity
    await pool.query('SELECT NOW()');
    dbConnected = true;
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    dbConnected = false;
    logEvent('WARN', 'Health check: Database unavailable', { error: error.message });
    res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// Weather Endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      logEvent('WARN', 'Weather request missing city parameter');
      return res.status(400).json({ error: 'City parameter is required' });
    }

    logEvent('INFO', 'Fetching weather data', { city });

    // Fetch from OpenWeatherMap API
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    const response = await axios.get(weatherUrl, { timeout: 5000 });
    
    const weatherData = {
      city: response.data.name,
      country: response.data.sys.country,
      temperature: response.data.main.temp,
      feels_like: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      wind_speed: response.data.wind.speed,
    };

    // Store search history
    try {
      await pool.query(
        'INSERT INTO search_history (city) VALUES ($1)',
        [city]
      );
      logEvent('INFO', 'Search history recorded', { city });
    } catch (dbError) {
      logEvent('WARN', 'Failed to record search history', { city, error: dbError.message });
    }

    logEvent('INFO', 'Weather data fetched successfully', { city });
    res.json(weatherData);
  } catch (error) {
    logEvent('ERROR', 'Weather fetch failed', { 
      error: error.message,
      city: req.query.city,
      status: error.response?.status,
    });
    res.status(error.response?.status || 500).json({ 
      error: error.message || 'Failed to fetch weather data' 
    });
  }
});

// History Endpoint
app.get('/api/history', async (req, res) => {
  try {
    logEvent('INFO', 'Fetching search history');
    
    const result = await pool.query(
      'SELECT DISTINCT city, MAX(searched_at) as last_searched FROM search_history GROUP BY city ORDER BY last_searched DESC LIMIT 20'
    );
    
    const history = result.rows.map(row => ({
      city: row.city,
      last_searched: row.last_searched,
    }));

    logEvent('INFO', 'Search history retrieved', { count: history.length });
    res.json(history);
  } catch (error) {
    logEvent('ERROR', 'History fetch failed', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logEvent('ERROR', 'Unhandled error', { error: err.message, path: req.path });
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(port, () => {
    logEvent('INFO', 'Server started', { port, environment: process.env.NODE_ENV || 'development' });
  });
};

startServer().catch(error => {
  logEvent('ERROR', 'Failed to start server', { error: error.message });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logEvent('INFO', 'SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});
