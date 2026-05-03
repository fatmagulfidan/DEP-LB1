# 🔧 Troubleshooting & Deployment Guide

## ✅ Pre-Deployment Checklist

### Local Development

- [ ] Docker is installed (`docker --version`)
- [ ] Docker Compose is installed (`docker compose --version`)
- [ ] Project files are complete (see PROJECT_STRUCTURE.md)
- [ ] `.env` file is created from `.env.example`
- [ ] OpenWeatherMap API key is added to `.env`
- [ ] No syntax errors in YAML files
- [ ] Port 3000, 8080, 5432 are available
- [ ] Tested with `docker compose up --build`
- [ ] Frontend loads at http://localhost:8080
- [ ] Backend health check passes

### Docker Repository (if pushing to registry)

- [ ] Docker credentials configured
- [ ] Registry URL correct in docker-compose.yml
- [ ] Image names tagged with version
- [ ] Registry has write permissions
- [ ] Network allows registry access

---

## 🚀 Deployment Checklist

### Pre-Production

- [ ] Security audit completed
- [ ] `.env` file contains production values
- [ ] Database password is strong (16+ chars, mixed case, numbers, symbols)
- [ ] OpenWeatherMap API key is for production tier
- [ ] HTTPS/TLS certificates configured
- [ ] Domain name is correct
- [ ] DNS records are updated
- [ ] Backup strategy is in place
- [ ] Monitoring/logging is configured
- [ ] Disaster recovery plan exists

### Deployment

- [ ] Production server is running Docker 20.10+
- [ ] Docker Compose 1.29+ is installed
- [ ] Server has sufficient disk space (>5GB)
- [ ] Network is configured correctly
- [ ] Firewall rules allow required ports
- [ ] `docker compose pull` succeeds
- [ ] `docker compose up -d` succeeds
- [ ] Health checks pass within 60 seconds
- [ ] All services are running (`docker compose ps`)
- [ ] Application is accessible

### Post-Deployment

- [ ] Frontend is accessible and responsive
- [ ] API endpoints respond correctly
- [ ] Search history is persisting
- [ ] Logs are being generated correctly
- [ ] Monitoring is alerting on failures
- [ ] Backups are executing
- [ ] Performance is acceptable

---

## 🆘 Troubleshooting Guide

### Issue: Container won't start

**Symptoms**:
```
docker compose up
# containers exit immediately
docker compose ps
# shows "Exited (1)" status
```

**Diagnosis**:
```bash
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Missing environment variables | Check `.env` file exists and is complete |
| Invalid API key | Verify OpenWeatherMap API key in `.env` |
| Port already in use | `lsof -i :3000` to find conflicting process |
| Disk space full | `df -h` to check available space |
| Docker daemon not running | `docker ps` should work; restart Docker |
| Corrupted image | `docker system prune` and rebuild |

---

### Issue: Backend can't connect to database

**Symptoms**:
```
backend logs show: "connect ECONNREFUSED 172.18.0.2:5432"
curl http://localhost:3000/api/weather?city=London → Error 500
```

**Diagnosis**:
```bash
# Check if database service is running
docker compose ps db

# Check database logs
docker compose logs db

# Try connecting directly (requires psql installed)
docker compose exec db psql -U postgres -d weather_db -c "SELECT 1;"

# Check network connectivity from backend
docker compose exec backend ping db
```

**Solutions**:

1. **Database not healthy yet**:
   - Wait 40+ seconds on first start
   - Docker Compose waits for health check
   - Check `docker compose ps` status

2. **Wrong credentials**:
   ```bash
   # Verify DB_USER and DB_PASSWORD in .env
   docker compose logs db | grep "creating"
   ```

3. **Network issues**:
   ```bash
   # Verify custom network exists
   docker network ls | grep weather_network
   
   # Inspect network
   docker network inspect weather_network
   ```

4. **Port conflict**:
   ```bash
   # Check if 5432 is already in use
   lsof -i :5432
   ```

---

### Issue: Frontend can't reach backend API

**Symptoms**:
```
Browser console: "Failed to fetch /api/weather"
Network tab shows 502 Bad Gateway
```

**Diagnosis**:
```bash
# Check if backend is healthy
docker compose ps backend

# Check logs
docker compose logs frontend
docker compose logs backend

# Test from browser console
curl http://localhost:3000/api/health

# Test from frontend container
docker compose exec frontend curl http://backend:3000/api/health
```

**Solutions**:

1. **Backend not healthy**:
   ```bash
   docker compose ps
   # Shows backend as "unhealthy"?
   docker compose logs backend
   ```

2. **Port mapping issue**:
   ```bash
   # Verify port 3000 is exposed
   docker compose ps backend
   # Should show 0.0.0.0:3000->3000/tcp
   ```

3. **Nginx configuration error**:
   ```bash
   # Check nginx.conf syntax
   docker compose exec frontend nginx -t
   
   # Test proxy manually
   docker compose exec frontend curl http://backend:3000/api/health
   ```

4. **Network issues**:
   ```bash
   # Check service communication
   docker compose exec frontend ping backend
   docker compose exec backend ping db
   ```

---

### Issue: API returns "Invalid API key" error

**Symptoms**:
```json
{
  "error": "Invalid API key. Please see http://openweathermap.org/faq#error401 for more info."
}
```

**Diagnosis**:
```bash
# Check if API key is set
docker compose exec backend env | grep OPENWEATHER_API_KEY

# Check API key validity
curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY"
```

**Solutions**:

1. **API key not set**:
   ```bash
   # Edit .env file
   nano .env
   # Add: OPENWEATHER_API_KEY=your_key_here
   
   # Restart services
   docker compose down
   docker compose up -d
   ```

2. **Invalid/expired API key**:
   - Visit https://openweathermap.org/api
   - Log in and check active API keys
   - Generate new key if needed
   - Update `.env` and restart

3. **Typo in API key**:
   - Copy directly from OpenWeatherMap (avoid copy-paste errors)
   - No spaces or special characters
   - Check length (should be ~32 characters)

4. **Free tier exceeded**:
   - Check API usage limits
   - Upgrade account if needed
   - Or wait for quota reset

---

### Issue: Database volume not persisting data

**Symptoms**:
```
Stop container, start again → search history is gone
```

**Diagnosis**:
```bash
# Check if volume exists
docker volume ls | grep weather

# Check volume mount in container
docker inspect weather_db | grep Mounts -A 10

# Check volume contents
docker run -v weather_db:/data alpine ls -la /data
```

**Solutions**:

1. **Volume not properly mounted**:
   - Check `docker-compose.yml`:
     ```yaml
     volumes:
       postgres_data:  # Named volume must exist
     ```
   - And service config:
     ```yaml
     volumes:
       - postgres_data:/var/lib/postgresql/data
     ```

2. **Volume deleted accidentally**:
   ```bash
   # Recreate volume (WARNING: loses data)
   docker volume rm weather_db
   docker volume create weather_db
   docker compose up -d
   ```

3. **Wrong volume path**:
   ```bash
   # Verify correct PostgreSQL data directory
   # Should be: /var/lib/postgresql/data
   # Check with: docker compose exec db echo $PGDATA
   ```

---

### Issue: High memory/CPU usage

**Symptoms**:
```
docker compose stats
# Shows high %MEM or %CPU
```

**Diagnosis**:
```bash
# Monitor in real-time
docker compose stats

# Check individual container
docker stats weather_backend

# Check process inside container
docker compose exec backend ps aux
docker compose exec backend node -e "console.log(process.memoryUsage())"
```

**Solutions**:

1. **Memory leak in Node.js**:
   ```bash
   # Restart services
   docker compose restart backend
   
   # Check logs for errors
   docker compose logs backend --tail 50
   ```

2. **Database query slow**:
   ```bash
   # Connect to DB and analyze
   docker compose exec db psql -U postgres -d weather_db
   
   # Check table size
   SELECT pg_size_pretty(pg_total_relation_size('search_history'));
   
   # Analyze slow queries
   EXPLAIN ANALYZE SELECT * FROM search_history;
   ```

3. **Too many connections**:
   ```sql
   -- Check active connections
   SELECT count(*) FROM pg_stat_activity;
   
   -- Adjust pool size if needed
   -- In app.js: new Pool({ max: 10 })
   ```

---

### Issue: Slow API responses

**Symptoms**:
```
Weather API takes 5-10 seconds to respond
Database queries are slow
```

**Diagnosis**:
```bash
# Check response times
time curl "http://localhost:3000/api/weather?city=London"

# Monitor database performance
docker compose exec db psql -U postgres -d weather_db
# SELECT * FROM search_history;
# \timing  -- Shows query execution time
```

**Solutions**:

1. **Network timeout to OpenWeatherMap**:
   ```javascript
   // In app.js: increase timeout
   await axios.get(url, { timeout: 10000 }); // 10 seconds
   ```

2. **Database query inefficiency**:
   ```bash
   # Add indexes if missing
   docker compose exec db psql -U postgres -d weather_db -c \
     "CREATE INDEX idx_city_searched_at ON search_history(city, searched_at);"
   ```

3. **Connection pool exhausted**:
   ```bash
   # Monitor connections
   docker compose exec db psql -U postgres -d weather_db \
     -c "SELECT count(*) FROM pg_stat_activity;"
   ```

---

### Issue: Docker Compose won't start

**Symptoms**:
```
docker compose up
# Error: yaml: line X: mapping values are not allowed in this context
```

**Diagnosis**:
```bash
# Validate YAML syntax
docker compose config > /dev/null

# Show specific error
docker compose config
```

**Solutions**:

1. **YAML syntax error**:
   - Check indentation (must be 2 or 4 spaces)
   - No tabs allowed
   - Quotes needed for strings with special chars
   - Colons in values need quotes

2. **Missing required field**:
   ```yaml
   # Bad (missing "image" or "build")
   services:
     db:
   
   # Good
   services:
     db:
       image: postgres:15-alpine
   ```

3. **Environment variable in YAML**:
   ```yaml
   # Bad (variables not expanded in YAML)
   database_url: $DATABASE_URL
   
   # Good (use in docker-compose.yml or .env file)
   environment:
     - DATABASE_URL=${DATABASE_URL}
   ```

---

## 📊 Monitoring & Health Checks

### Check Service Health

```bash
# Quick status
docker compose ps

# Detailed health
docker compose ps --format "{{.Names}}: {{.Status}}"

# Real-time stats
docker compose stats

# Historical logs
docker compose logs --tail 100 backend
```

### Monitor API Health

```bash
# One-time check
curl http://localhost:3000/api/health

# Continuous monitoring (every 5s)
watch -n 5 'curl -s http://localhost:3000/api/health | jq .'

# With timeout
timeout 5 curl http://localhost:3000/api/health || echo "Failed"
```

### Database Health

```bash
# Quick check
docker compose exec db pg_isready -U postgres

# Detailed status
docker compose exec db psql -U postgres -c "\l"

# Connection count
docker compose exec db psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 🔄 Backup & Recovery

### Database Backup

```bash
# Backup database
docker compose exec db pg_dump -U postgres weather_db > backup.sql

# Backup with compression
docker compose exec db pg_dump -U postgres weather_db | gzip > backup.sql.gz

# Backup data directory
docker run -v weather_db:/data --rm -v $(pwd):/backup alpine \
  tar -czf /backup/postgres_backup.tar.gz /data
```

### Database Restore

```bash
# Restore from SQL dump
cat backup.sql | docker compose exec -T db psql -U postgres -d weather_db

# Restore from compressed dump
gunzip -c backup.sql.gz | docker compose exec -T db psql -U postgres -d weather_db
```

### Volume Backup

```bash
# List volumes
docker volume ls

# Backup volume
docker run -v weather_db:/data --rm -v $(pwd):/backup alpine \
  tar -czf /backup/weather_data.tar.gz -C /data .

# Restore volume
docker volume create weather_db_restored
docker run -v weather_db_restored:/data --rm -v $(pwd):/backup alpine \
  tar -xzf /backup/weather_data.tar.gz -C /data
```

---

## 📈 Performance Optimization

### Image Size

```bash
# Check image sizes
docker images | grep weather

# Reduce image size
# - Already using Alpine
# - Already using multi-stage builds
# - Consider build cache optimization
```

### Network Performance

```bash
# Test service-to-service communication
docker compose exec backend curl -w "Time: %{time_total}s\n" -o /dev/null http://db:5432

# Monitor network
docker compose exec backend iftop  # if installed
```

### Database Optimization

```bash
# Analyze query plans
docker compose exec db psql -U postgres -d weather_db
# EXPLAIN ANALYZE SELECT * FROM search_history;

# Vacuum database
docker compose exec db psql -U postgres -d weather_db -c "VACUUM ANALYZE;"

# Check index usage
# SELECT * FROM pg_stat_user_indexes;
```

---

## 🔐 Security Hardening

### For Production

1. **Change default passwords**:
   ```bash
   # Edit .env
   DB_PASSWORD=generate_strong_password_here
   ```

2. **Enable HTTPS**:
   - Get SSL certificate (Let's Encrypt)
   - Configure Nginx SSL
   - Update frontend to use https://

3. **Limit network exposure**:
   ```yaml
   # Don't expose database port
   # ports: "5432:5432"  # Remove this
   
   # Restrict backend port
   ports:
     - "127.0.0.1:3000:3000"  # Only localhost
   ```

4. **Add authentication**:
   - Implement user login
   - Add API key validation
   - Use JWT tokens

5. **Rate limiting**:
   ```bash
   # Install express-rate-limit
   npm install express-rate-limit
   
   # Add to app.js
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   app.use(limiter);
   ```

---

## 📚 Additional Resources

- [Docker Compose Troubleshooting](https://docs.docker.com/compose/faq/)
- [PostgreSQL Common Issues](https://www.postgresql.org/docs/current/runtime.html)
- [Express.js Debugging](https://expressjs.com/en/guide/debugging.html)
- [Nginx Troubleshooting](https://nginx.org/en/docs/debugging_log.html)

---

## 📞 Getting Help

1. **Check logs**: `docker compose logs [service]`
2. **Verify configuration**: `docker compose config`
3. **Test components**: `curl http://localhost:3000/api/health`
4. **Reset everything**: `docker compose down -v && docker compose up --build`
5. **Read documentation**: See README.md and API_DOCUMENTATION.md
