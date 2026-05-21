import { db, pgClient } from "../config/database";
import { sql } from "drizzle-orm";

async function run() {
  try {
    await db.execute(sql`ALTER TABLE interviewers ADD COLUMN verification_notes TEXT;`);
    console.log("Successfully added verification_notes column.");
  } catch (err: any) {
    if (err.message.includes("already exists")) {
      console.log("Column verification_notes already exists.");
    } else {
      console.error("Failed:", err);
    }
  } finally {
    process.exit(0);
  }
}

run();
