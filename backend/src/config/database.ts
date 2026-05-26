import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const connectionString = process.env.DATABASE_URL!;

// Singleton pattern to prevent connection exhaustion during hot reloads
const globalForPostgres = globalThis as unknown as {
  postgresClient: postgres.Sql | undefined;
};

const client = globalForPostgres.postgresClient ?? postgres(connectionString, {
  max_lifetime: 60 * 30,
  max: 5,
  prepare: false,
  ssl: { rejectUnauthorized: false },
});

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.postgresClient = client;
}

// Create Drizzle ORM instance with schema
export const db = drizzle(client, { schema });
export const pgClient = client;

export default db;
