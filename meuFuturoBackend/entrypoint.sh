#!/bin/bash
# =============================================================================
# MeuFuturo Backend - Entrypoint Script
# =============================================================================
# This script runs when the backend container starts
# It connects to AWS RDS (or external database) and runs migrations

set -e

echo "🚀 Starting MeuFuturo Backend..."
echo "📊 Environment: ${ENVIRONMENT:-development}"

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set!"
  echo "   Please set DATABASE_URL to your AWS RDS connection string"
  echo "   Example: postgresql+asyncpg://user:password@host:5432/dbname"
  exit 1
fi

echo "✅ DATABASE_URL is configured"

# Extract database host for logging (sem expor senha)
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p')
echo "📡 Connecting to database at: $DB_HOST"

# Run database migrations (opcional - descomente se quiser auto-migration)
echo "🔄 Running database migrations..."
if alembic upgrade head 2>&1; then
  echo "✅ Migrations completed successfully!"
else
  echo "⚠️  Migration failed or no migrations to apply"
  echo "   You can run migrations manually: docker-compose exec backend alembic upgrade head"
fi

# Start the application
echo "🎉 Starting FastAPI application on port 8000..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --log-level info

