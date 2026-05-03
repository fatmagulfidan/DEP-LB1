# 🔌 API Documentation

## Base URLs

- **Local Development**: `http://localhost:3000/api`
- **Docker Compose**: `http://backend:3000/api` (internal)
- **Frontend Proxy**: `http://localhost:8080/api` (via Nginx)

---

## Endpoints

### 1. Health Check

Check if the backend service is healthy and ready.

```
GET /api/health
```

**Response (200 OK)**
```json
{
  "status": "healthy"
}
```

**Use Cases**:
- Docker health checks
- Load balancer verification
- Application startup validation

**Example**:
```bash
curl http://localhost:3000/api/health
```

---

### 2. Get Weather

Fetch current weather data for a city.

```
GET /api/weather?city=CITY_NAME
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `city` | string | Yes | City name (e.g., "London", "New York") |

**Response (200 OK)**
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

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `city` | string | City name from OpenWeatherMap |
| `country` | string | ISO country code (2 chars) |
| `temperature` | number | Temperature in Celsius |
| `feels_like` | number | Perceived temperature in Celsius |
| `humidity` | integer | Humidity percentage (0-100) |
| `pressure` | integer | Atmospheric pressure in hPa |
| `description` | string | Weather description (lowercase) |
| `icon` | string | Weather icon code |
| `wind_speed` | number | Wind speed in m/s |

**Error Responses**:

```json
// 400 Bad Request - Missing city parameter
{
  "error": "City parameter is required"
}
```

```json
// 404 Not Found - City not found
{
  "error": "city not found"
}
```

```json
// 401 Unauthorized - Invalid API key
{
  "error": "Invalid API key. Please see http://openweathermap.org/faq#error401 for more info."
}
```

**Side Effects**:
- City is recorded in `search_history` table
- Failure to record history doesn't fail the request

**Examples**:

```bash
# Basic request
curl "http://localhost:3000/api/weather?city=London"

# With URL encoding (space in city name)
curl "http://localhost:3000/api/weather?city=New%20York"

# Pretty print with jq
curl -s "http://localhost:3000/api/weather?city=Tokyo" | jq .
```

**Supported Cities**:
- Any city in OpenWeatherMap database
- Major cities: London, New York, Paris, Tokyo, Sydney, Toronto, Dubai, Singapore, etc.
- Smaller cities: Usually supported if spelled correctly

**Rate Limiting**:
- Free tier: 60 calls/minute
- Check your OpenWeatherMap plan for limits

---

### 3. Get Search History

Retrieve the list of previously searched cities.

```
GET /api/history
```

**Response (200 OK)**
```json
[
  {
    "city": "London",
    "last_searched": "2026-05-02T10:35:42.123Z"
  },
  {
    "city": "Paris",
    "last_searched": "2026-05-02T10:30:15.456Z"
  },
  {
    "city": "Tokyo",
    "last_searched": "2026-05-02T10:25:00.789Z"
  }
]
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `city` | string | City name |
| `last_searched` | string | ISO 8601 timestamp of last search |

**Query Behavior**:
- Returns up to 20 most recent searches
- Grouped by city (duplicates merged)
- Ordered by last search time (newest first)
- Empty array if no searches yet

**Examples**:

```bash
# Get history
curl http://localhost:3000/api/history

# Pretty print
curl -s http://localhost:3000/api/history | jq .

# Count unique cities
curl -s http://localhost:3000/api/history | jq 'length'

# Get most recent search
curl -s http://localhost:3000/api/history | jq '.[0]'
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Weather fetched successfully |
| 400 | Bad Request | Missing required parameter |
| 401 | Unauthorized | Invalid API key |
| 404 | Not Found | City not found |
| 500 | Server Error | Database connection failed |

### Error Response Format

All errors return JSON:
```json
{
  "error": "Human-readable error message"
}
```

### Common Issues & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid API key` | OPENWEATHER_API_KEY not set | Add key to .env file |
| `city not found` | Typo in city name | Check spelling |
| `connect ECONNREFUSED` | Backend not running | Run `docker compose up` |
| `connect ENOENT` | Database not ready | Wait 40 seconds |

---

## Request/Response Examples

### JavaScript (Fetch API)

```javascript
// Get weather
fetch('/api/weather?city=London')
  .then(res => res.json())
  .then(data => console.log(`${data.city}: ${data.temperature}°C`))
  .catch(err => console.error('Error:', err.message));

// Get history
fetch('/api/history')
  .then(res => res.json())
  .then(history => history.forEach(h => console.log(h.city)));
```

### cURL (Command Line)

```bash
# Get weather
curl -s "http://localhost:3000/api/weather?city=Paris" | jq .

# Check health
curl http://localhost:3000/api/health

# Get history with pretty print
curl -s http://localhost:3000/api/history | jq 'sort_by(.last_searched) | reverse'
```

### Python (Requests)

```python
import requests
import json

# Get weather
response = requests.get('http://localhost:3000/api/weather', params={'city': 'Berlin'})
weather = response.json()
print(f"{weather['city']}: {weather['temperature']}°C")

# Get history
history = requests.get('http://localhost:3000/api/history').json()
for item in history:
    print(f"{item['city']} - {item['last_searched']}")
```

### Node.js (Axios)

```javascript
const axios = require('axios');

// Get weather
axios.get('http://localhost:3000/api/weather', { params: { city: 'Amsterdam' } })
  .then(res => console.log(res.data))
  .catch(err => console.error(err.response.data));
```

---

## Logging

All API requests are logged as structured JSON:

```json
{
  "timestamp": "2026-05-02T10:35:42.123Z",
  "level": "INFO",
  "message": "Weather data fetched successfully",
  "city": "London"
}
```

View logs:
```bash
docker compose logs backend | jq .
```

---

## Rate Limiting Considerations

**OpenWeatherMap Free Tier**:
- 60 API calls per minute
- 1,000,000 calls per month
- Plan accordingly for production

**Database**:
- Connection pool size: 10 (configurable)
- No built-in rate limiting (consider adding)

---

## Performance Tips

1. **Cache responses** if possible
2. **Batch requests** to reduce API calls
3. **Use indexes** for database queries (already configured)
4. **Monitor API usage** via logs
5. **Set connection timeouts** (5s default)

---

## Security Notes

⚠️ **Do Not**:
- Expose API keys in client code
- Store credentials in version control
- Send API keys in GET parameters
- Skip HTTPS in production

✅ **Do**:
- Use environment variables for secrets
- Implement authentication/authorization
- Enable HTTPS/TLS
- Rate limit API endpoints
- Validate all inputs
- Log security events

---

## Testing

### Test All Endpoints

```bash
make test-api
```

Or manually:

```bash
# Health check
curl http://localhost:3000/api/health

# Weather
curl "http://localhost:3000/api/weather?city=Tokyo"

# History
curl http://localhost:3000/api/history
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/health

# Using hey
hey -n 1000 -c 10 http://localhost:3000/api/health
```

---

## Changelog

### v1.0 (2026-05-02)
- Initial API implementation
- OpenWeatherMap integration
- Search history tracking
- Health check endpoint
- Structured JSON logging
- Error handling
