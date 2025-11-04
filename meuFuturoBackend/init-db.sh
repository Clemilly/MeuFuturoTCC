#!/bin/bash
# =============================================================================
# MeuFuturo - Database Initialization Script
# =============================================================================
# This script is executed when the PostgreSQL container starts for the first time
# It creates the database and user if they don't exist

set -e

echo "🚀 Initializing MeuFuturo database..."

# Create database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-EOSQL
    SELECT 'CREATE DATABASE $POSTGRES_DB'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$POSTGRES_DB')\gexec
EOSQL

echo "✅ Database '$POSTGRES_DB' is ready!"

# Connect to the database and create extensions
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create UUID extension if not exists
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Create pg_trgm extension for text search (opcional, útil para buscas)
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOSQL

echo "✅ Database extensions and privileges configured!"
echo "📊 Database is ready for migrations!"

