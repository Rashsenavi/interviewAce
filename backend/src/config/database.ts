import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";

// Create PostgreSQL connection
const client = postgres(process.env.DATABASE_URL!, {
  connect_timeout: 30,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  ssl: { rejectUnauthorized: false },
});

// Create Drizzle ORM instance with schema
export const db = drizzle(client, { schema });

export default db;
