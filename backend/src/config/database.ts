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
  max: 1, // Keep connection count low for local dev
  ssl: { rejectUnauthorized: false },
});

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.pgPool = pool;
}

// Create Drizzle ORM instance with schema
export const db = drizzle(pool, { schema });
export const pgClient = pool;

export default db;
