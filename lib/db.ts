import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const connectionString = process.env.DATABASE_URL!;

// Singleton pattern to prevent connection exhaustion during hot reloads (Next.js)
const globalForPostgres = globalThis as unknown as {
  pgPool: Pool | undefined;
};

const pool = globalForPostgres.pgPool ?? new Pool({
  connectionString,
  max: 1, // Keep connection count low
  ssl: { rejectUnauthorized: false },
});

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.pgPool = pool;
}

// Create Drizzle ORM instance
export const db = drizzle(pool);
