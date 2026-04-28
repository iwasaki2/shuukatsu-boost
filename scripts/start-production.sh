#!/bin/sh
set -eu

mkdir -p /app/data
npx prisma db push --url "$DATABASE_URL"
exec npx next start --hostname "${HOSTNAME:-0.0.0.0}" --port "${PORT:-3000}"
