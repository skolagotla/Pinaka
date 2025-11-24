# Database Backups

This directory contains database backups for the PT database.

## Backup Files

### Schema-Only Dumps
- `PT_schema_YYYYMMDD_HHMMSS.sql` - Database structure only (no data)
- Use for: Restoring table structure, migrations, schema documentation

### Full Dumps
- `PT_full_YYYYMMDD_HHMMSS.sql` - Complete database (schema + data)
- Use for: Complete backups, disaster recovery, data migration

## Restoring from Backup

### Restore Schema Only
```bash
psql -U skolagot -d PT < PT_schema_YYYYMMDD_HHMMSS.sql
```

### Restore Full Database
```bash
psql -U skolagot -d PT < PT_full_YYYYMMDD_HHMMSS.sql
```

### Restore to Different Database
```bash
# Create new database first
createdb -U skolagot new_database_name

# Restore
psql -U skolagot -d new_database_name < PT_full_YYYYMMDD_HHMMSS.sql
```

## Creating New Backups

### Schema Only
```bash
cd backups
pg_dump -U skolagot -d PT --schema-only --no-owner --no-acl -f "PT_schema_$(date +%Y%m%d_%H%M%S).sql"
```

### Full Backup
```bash
cd backups
pg_dump -U skolagot -d PT --no-owner --no-acl -f "PT_full_$(date +%Y%m%d_%H%M%S).sql"
```

## Notes

- Backups are created with `--no-owner` and `--no-acl` flags for portability
- Timestamps are in format: YYYYMMDD_HHMMSS
- Keep multiple backups for disaster recovery
- Consider automating backups with cron jobs

## Database Information

- **Database Name**: PT
- **User**: skolagot
- **Host**: localhost:5432
- **Schema**: public

