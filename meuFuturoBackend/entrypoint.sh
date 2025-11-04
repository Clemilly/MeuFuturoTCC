#!/bin/bash
# =============================================================================
# MeuFuturo Backend - Entrypoint Script
# =============================================================================
# This script runs when the backend container starts
# It waits for PostgreSQL and runs migrations automatically

set -e

echo "🚀 Starting MeuFuturo Backend..."
echo "📊 Environment: ${ENVIRONMENT:-development}"

# Extract database connection details from DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

echo "⏳ Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."

# Wait for PostgreSQL to be ready
MAX_RETRIES=30
RETRY_COUNT=0

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U postgres > /dev/null 2>&1 || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT+1))
  echo "⏳ Waiting for database... (Attempt $RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Error: Could not connect to PostgreSQL after $MAX_RETRIES attempts"
  exit 1
fi

echo "✅ PostgreSQL is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
if alembic upgrade head; then
  echo "✅ Migrations completed successfully!"
else
  echo "⚠️  Migration failed or no migrations to apply"
fi

# Start the application
echo "🎉 Starting FastAPI application on port 8000..."
# Use apenas 1 worker para economizar memória
exec uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 --log-level warning

