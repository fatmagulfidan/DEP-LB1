require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'weather_db',
});

function logEvent(level, message, data = {}) {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...data }));
}

async function initializeDatabase() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS search_history (
      id SERIAL PRIMARY KEY,
      city VARCHAR(100) NOT NULL,
      searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);
    logEvent('INFO', 'Datenbank erfolgreich initialisiert');
  } catch (error) {
    logEvent('ERROR', 'Datenbankinitialisierung fehlgeschlagen', { error: error.message });
    process.exit(1);
  }
}

app.get('/api/health', (req, res) => res.json({ status: 'healthy' }));

app.get('/api/weather', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'City parameter is required' });
    logEvent('INFO', 'Wetterdaten werden abgefragt', { city });
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
      { timeout: 5000 }
    );
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
    try {
      await pool.query('INSERT INTO search_history (city) VALUES ($1)', [city]);
    } catch (dbError) {
      logEvent('WARN', 'Suchhistorie konnte nicht gespeichert werden', { error: dbError.message });
    }
    logEvent('INFO', 'Wetterdaten erfolgreich abgerufen', { city });
    res.json(weatherData);
  } catch (error) {
    logEvent('ERROR', 'Wetterabfrage fehlgeschlagen', { error: error.message });
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT city, MAX(searched_at) as last_searched FROM search_history GROUP BY city ORDER BY last_searched DESC LIMIT 20'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.use((err, req, res, next) => {
  logEvent('ERROR', 'Unbehandelter Fehler', { error: err.message });
  res.status(500).json({ error: 'Internal server error' });
});

const startServer = async () => {
  await initializeDatabase();
  app.listen(port, () => logEvent('INFO', 'Server gestartet', { port }));
};

startServer().catch(error => {
  logEvent('ERROR', 'Server-Start fehlgeschlagen', { error: error.message });
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
