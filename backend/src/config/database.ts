import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const connectionString = process.env.DATABASE_URL!;

// Singleton pattern to prevent connection exhaustion during hot reloads
const globalForPostgres = globalThis as unknown as {
  pgPool: Pool | undefined;
};

const pool = globalForPostgres.pgPool ?? new Pool({
  connectionString,
  max: 10,
  ssl: { rejectUnauthorized: false },
  // Keep TCP connections alive — prevents remote DB (Supabase/Neon) from
  // silently dropping idle connections, which causes "Connection terminated unexpectedly"
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  // Release idle connections after 10s — before the remote DB can drop them
  idleTimeoutMillis: 10000,
  // Wait up to 30s for a free pool slot before failing
  connectionTimeoutMillis: 30000,
});

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.pgPool = pool;
}

// Log pool errors to surface connection issues quickly
pool.on("error", (err) => {
  console.error("[DB Pool] Unexpected error on idle client:", err.message);
});

// Gracefully close pool on shutdown to prevent connection leaks
// This is critical because tsx watch restarts create zombie connections on Supabase
const shutdown = async () => {
  console.log("Shutting down database pool...");
  await pool.end();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.pgPool = pool;
}

// Create Drizzle ORM instance with schema
export const db = drizzle(pool, { schema });
export const pgClient = pool;

export default db;
