/**
 * Shared PostgreSQL pool — enables SSL for Render / managed Postgres.
 */

import pg from 'pg';

function poolNeedsSsl(connectionString: string): boolean {
  return (
    connectionString.includes('render.com') ||
    connectionString.includes('sslmode=require') ||
    connectionString.includes('amazonaws.com') ||
    connectionString.includes('digitalocean.com')
  );
}

export function createPgPool(connectionString: string): pg.Pool {
  return new pg.Pool({
    connectionString,
    ssl: poolNeedsSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  });
}
