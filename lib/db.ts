import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Create PostgreSQL connection with longer timeout
const client = postgres(process.env.DATABASE_URL!, {
  connect_timeout: 30,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

// Create Drizzle ORM instance
export const db = drizzle(client);
