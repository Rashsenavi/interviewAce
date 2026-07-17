import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("FATAL: DATABASE_URL environment variable is not set");
}

// Singleton pattern to prevent connection exhaustion during hot reloads
const globalForPostgres = globalThis as unknown as {
  pgPool: Pool | undefined;
};

const pool = globalForPostgres.pgPool ?? new Pool({
  connectionString,
  max: process.env.NODE_ENV === "production" ? 10 : 3,
  ssl: { rejectUnauthorized: false },
  keepAlive: true,
  idleTimeoutMillis: 10000, // Proactively close idle connections to avoid AWS NAT drops
  connectionTimeoutMillis: 30000, // Wait up to 30s to allow Supabase database wake-up
});

// Log pool errors to surface connection issues quickly
pool.on("error", (err) => {
  console.error("[DB Pool] Unexpected error on idle client:", err.message);
});

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.pgPool = pool;
}

// Create Drizzle ORM instance with schema
export const db = drizzle(pool, { schema });
export const pgClient = pool;

export default db;
