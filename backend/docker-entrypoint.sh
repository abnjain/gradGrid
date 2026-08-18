#!/bin/sh
set -eu

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: DATABASE_URL is not set — link gradgrid-db to gradgrid-api in Render."
    exit 1
  fi
  echo "Running database migrations..."
  npx prisma migrate deploy
fi

exec "$@"
