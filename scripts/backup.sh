#!/bin/bash

# Full Backup Script for Pinaka Project
# This script creates a complete backup of the codebase and database

set -e  # Exit on error

# Get timestamp for backup directory
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="../backups/pinaka_backup_${TIMESTAMP}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=========================================="
echo "Pinaka Full Backup Script"
echo "=========================================="
echo "Timestamp: ${TIMESTAMP}"
echo "Backup Directory: ${BACKUP_DIR}"
echo "Project Root: ${PROJECT_ROOT}"
echo ""

# Create backup directory
mkdir -p "${BACKUP_DIR}"
cd "${PROJECT_ROOT}"

# 1. Backup Codebase (excluding node_modules, .next, etc.)
echo "Step 1: Backing up codebase..."
CODEBASE_BACKUP="${BACKUP_DIR}/codebase.tar.gz"

# Create tar archive excluding common build/cache directories
tar -czf "${CODEBASE_BACKUP}" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='out' \
  --exclude='build' \
  --exclude='.vercel' \
  --exclude='coverage' \
  --exclude='.pnp' \
  --exclude='.DS_Store' \
  --exclude='*.log' \
  --exclude='*.tsbuildinfo' \
  --exclude='.env*.local' \
  --exclude='uploads/*' \
  --exclude='tmp/*' \
  --exclude='logs/*' \
  --exclude='prisma/*.db' \
  --exclude='prisma/*.db-journal' \
  --exclude='public/signatures/*' \
  --exclude='backups' \
  .

CODEBASE_SIZE=$(du -h "${CODEBASE_BACKUP}" | cut -f1)
echo "✓ Codebase backup created: ${CODEBASE_BACKUP} (${CODEBASE_SIZE})"

# 2. Backup Database
echo ""
echo "Step 2: Backing up database..."

# Extract DATABASE_URL from .env if it exists
if [ -f .env ]; then
  DATABASE_URL=$(grep -E "^DATABASE_URL=" .env | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
else
  # Try to get from environment
  DATABASE_URL="${DATABASE_URL:-postgresql://skolagot@localhost:5432/nandi?schema=public}"
fi

if [ -z "$DATABASE_URL" ]; then
  echo "⚠ Warning: DATABASE_URL not found. Skipping database backup."
else
  echo "Database URL: ${DATABASE_URL}"
  
  # Parse database connection details
  # Format: postgresql://user@host:port/database?schema=public
  DB_BACKUP="${BACKUP_DIR}/database_backup_${TIMESTAMP}.sql"
  
  # Extract components from DATABASE_URL
  if [[ "$DATABASE_URL" =~ postgresql://([^:]+)@([^:]+):([^/]+)/([^?]+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_HOST="${BASH_REMATCH[2]}"
    DB_PORT="${BASH_REMATCH[3]}"
    DB_NAME="${BASH_REMATCH[4]}"
    
    echo "Connecting to: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    
    # Use pg_dump to backup database
    if command -v pg_dump &> /dev/null; then
      pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        --format=plain \
        > "${DB_BACKUP}" 2>&1 || {
        echo "⚠ Error creating database backup. Trying without password prompt..."
        # Try with PGPASSWORD if available
        if [ -f .env ]; then
          # Try to extract password if it's in the URL
          if [[ "$DATABASE_URL" =~ :([^@]+)@ ]]; then
            export PGPASSWORD="${BASH_REMATCH[1]}"
          fi
        fi
        pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
          --no-owner \
          --no-acl \
          --clean \
          --if-exists \
          --format=plain \
          > "${DB_BACKUP}" 2>&1 || {
          echo "⚠ Database backup failed. Please run manually:"
          echo "   pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} > ${DB_BACKUP}"
        }
      }
      
      if [ -f "${DB_BACKUP}" ] && [ -s "${DB_BACKUP}" ]; then
        DB_SIZE=$(du -h "${DB_BACKUP}" | cut -f1)
        echo "✓ Database backup created: ${DB_BACKUP} (${DB_SIZE})"
      else
        echo "⚠ Database backup file is empty or missing"
      fi
    else
      echo "⚠ pg_dump not found. Please install PostgreSQL client tools."
      echo "   Database backup skipped."
    fi
  else
    echo "⚠ Could not parse DATABASE_URL. Skipping database backup."
    echo "   DATABASE_URL format: postgresql://user@host:port/database"
  fi
fi

# 3. Backup .env file (if exists) - important for configuration
echo ""
echo "Step 3: Backing up configuration files..."
if [ -f .env ]; then
  cp .env "${BACKUP_DIR}/.env.backup"
  echo "✓ .env file backed up"
else
  echo "⚠ .env file not found"
fi

# 4. Create backup manifest
echo ""
echo "Step 4: Creating backup manifest..."
MANIFEST="${BACKUP_DIR}/BACKUP_MANIFEST.txt"
cat > "${MANIFEST}" << EOF
Pinaka Backup Manifest
=======================
Backup Date: $(date)
Timestamp: ${TIMESTAMP}
Project Root: ${PROJECT_ROOT}

Backup Contents:
- Codebase: codebase.tar.gz
- Database: database_backup_${TIMESTAMP}.sql
- Environment: .env.backup (if exists)

Database Information:
- URL: ${DATABASE_URL:-"Not available"}

Backup Location: ${BACKUP_DIR}

To restore:
1. Extract codebase: tar -xzf codebase.tar.gz
2. Restore database: psql -h HOST -p PORT -U USER -d DATABASE < database_backup_${TIMESTAMP}.sql
3. Restore .env: cp .env.backup .env

EOF

echo "✓ Manifest created: ${MANIFEST}"

# 5. Summary
echo ""
echo "=========================================="
echo "Backup Complete!"
echo "=========================================="
echo "Backup Location: ${BACKUP_DIR}"
echo ""
echo "Backup Contents:"
ls -lh "${BACKUP_DIR}"
echo ""
echo "Total Backup Size:"
du -sh "${BACKUP_DIR}"
echo ""
echo "Backup manifest: ${MANIFEST}"
echo "=========================================="

