# Pinaka v2 - Deployment Guide

## Environment Variables

### Backend Environment Variables

**File**: `apps/backend-api/.env`

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname

# JWT
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=https://app.pinaka.com,https://www.pinaka.com

# Optional: S3 for file storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=pinaka-uploads
```

### Frontend Environment Variables

**File**: `apps/web-app/.env.local`

```bash
# API Base URL
NEXT_PUBLIC_API_V2_BASE_URL=https://api.pinaka.com/api/v2

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_TOUR=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Docker Build Flow

### Backend Dockerfile

**File**: `apps/backend-api/Dockerfile`

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run migrations and start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000"]
```

### Frontend Dockerfile

**File**: `apps/web-app/Dockerfile`

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy source
COPY . .

# Build
RUN pnpm build

# Production image
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

CMD ["pnpm", "start"]
```

### Docker Compose

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  backend:
    build: ./apps/backend-api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/pinaka
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db

  frontend:
    build: ./apps/web-app
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_V2_BASE_URL=http://backend:8000/api/v2
    depends_on:
      - backend

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=pinaka
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Database Migrations

### Running Migrations

**Production**:
```bash
cd apps/backend-api
alembic upgrade head
```

**Rollback**:
```bash
alembic downgrade -1
```

### Migration Best Practices

1. **Test migrations** on staging first
2. **Backup database** before running migrations
3. **Run migrations** during maintenance window
4. **Monitor** migration execution
5. **Verify** data integrity after migration

## Storage

### Current Implementation

**Local Storage**: Files stored in `uploads/` directory

```
uploads/
├── {organization_id}/
│   ├── work_order/
│   │   └── {work_order_id}/
│   │       └── {filename}
│   ├── lease/
│   │   └── {lease_id}/
│   │       └── {filename}
│   └── ...
```

### S3 Migration

**Configuration**:
```python
# apps/backend-api/core/config.py
AWS_ACCESS_KEY_ID: str
AWS_SECRET_ACCESS_KEY: str
AWS_REGION: str = "us-east-1"
S3_BUCKET_NAME: str
```

**Implementation**:
```python
# Use S3 client instead of local file system
import boto3

s3_client = boto3.client('s3')
s3_client.upload_fileobj(file, S3_BUCKET_NAME, storage_key)
```

## Logging

### Backend Logging

**File**: `apps/backend-api/core/logger.py`

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
```

**Usage**:
```python
logger.info("User logged in", extra={"user_id": user.id})
logger.error("Failed to create property", exc_info=True)
```

### Frontend Logging

**File**: `lib/logger.js`

```javascript
export const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  navigation: (message, data) => console.log(`[NAV] ${message}`, data),
};
```

### Log Storage

**Production**: 
- Backend: File logs or centralized logging (ELK, CloudWatch)
- Frontend: Error tracking service (Sentry, LogRocket)

## Production Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] API endpoints tested
- [ ] Frontend builds successfully
- [ ] Type generation successful
- [ ] RBAC permissions verified
- [ ] Onboarding flows tested
- [ ] Error handling tested

### Deployment Steps

1. **Backup Database**
   ```bash
   pg_dump -U postgres pinaka > backup_$(date +%Y%m%d).sql
   ```

2. **Run Migrations**
   ```bash
   cd apps/backend-api
   alembic upgrade head
   ```

3. **Build Frontend**
   ```bash
   cd apps/web-app
   pnpm build
   ```

4. **Deploy Backend**
   - Deploy FastAPI application
   - Restart server
   - Verify health endpoint

5. **Deploy Frontend**
   - Deploy Next.js application
   - Verify static assets
   - Test API connectivity

6. **Verify Deployment**
   - Test login flow
   - Test API endpoints
   - Test RBAC enforcement
   - Test organization scoping

### Post-Deployment

- [ ] Monitor error logs
- [ ] Check API response times
- [ ] Verify database connections
- [ ] Test critical user flows
- [ ] Monitor resource usage

## Performance Optimization

### Backend

- **Database Indexes**: Ensure all indexes are created
- **Query Optimization**: Use eager loading to prevent N+1 queries
- **Caching**: Implement Redis for frequently accessed data
- **Connection Pooling**: Configure SQLAlchemy connection pool

### Frontend

- **Code Splitting**: Use dynamic imports for large components
- **Image Optimization**: Use Next.js Image component
- **Caching**: Configure React Query stale times
- **CDN**: Serve static assets from CDN

## Security

### Production Security

1. **HTTPS**: Always use HTTPS in production
2. **Secret Keys**: Use strong, unique secret keys
3. **CORS**: Configure allowed origins
4. **Rate Limiting**: Implement rate limiting on API
5. **Input Validation**: Validate all inputs
6. **SQL Injection**: Use parameterized queries (SQLAlchemy does this)

### Environment Security

- **Secrets Management**: Use environment variables or secret management service
- **Database Credentials**: Never commit credentials to repository
- **API Keys**: Store in secure vault
- **Tokens**: Use httpOnly cookies in production

## Monitoring

### Health Checks

**Backend**: `GET /health`

```json
{
  "status": "healthy",
  "database": "connected",
  "version": "2.0.0"
}
```

**Frontend**: Next.js built-in health checks

### Metrics

**Backend**:
- API response times
- Database query times
- Error rates
- Request counts

**Frontend**:
- Page load times
- API call success rates
- Error rates
- User activity

## Backup Strategy

### Database Backups

**Automated**:
```bash
# Daily backup script
pg_dump -U postgres pinaka | gzip > backup_$(date +%Y%m%d).sql.gz
```

**Retention**: Keep 30 days of daily backups

### File Backups

**S3**: Enable versioning and lifecycle policies
**Local**: Regular backups of `uploads/` directory

## Scaling

### Horizontal Scaling

- **Backend**: Stateless design allows multiple instances
- **Frontend**: CDN for static assets
- **Database**: Read replicas for read-heavy workloads

### Vertical Scaling

- **Database**: Increase resources for large datasets
- **Application**: Increase CPU/memory for high traffic

---

**Related Documentation**:
- [Architecture](01_Architecture.md) - System architecture
- [Backend API](02_Backend_API.md) - API endpoints
- [Development Guide](10_Development_Guide.md) - Development setup

