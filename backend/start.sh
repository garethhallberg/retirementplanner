#!/bin/sh
set -e

echo "Waiting for database..."
while ! python -c "
import os, sqlalchemy
engine = sqlalchemy.create_engine(os.environ['DATABASE_URL'])
engine.connect().close()
" 2>/dev/null; do
  sleep 1
done
echo "Database ready."

echo "Running migrations..."
alembic upgrade head

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
