import { pgClient } from "../config/database";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Reading migration SQL file...");
  const sqlPath = path.join(__dirname, "../../drizzle/0001_omniscient_sleeper.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error("Migration file not found at:", sqlPath);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, "utf-8");
  // Split statements by statement-breakpoint comment
  const statements = sqlContent
    .split(/--> statement-breakpoint/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`\n[Stmt ${i + 1}/${statements.length}] Executing:\n${stmt.substring(0, 100)}...`);
    try {
      await pgClient.query(stmt);
      console.log(`[Stmt ${i + 1}/${statements.length}] Success!`);
    } catch (err: any) {
      // Check if it's a "relation already exists" or "column already exists" error
      if (err.code === "42P07" || err.code === "42701" || err.message.includes("already exists")) {
        console.log(`[Stmt ${i + 1}/${statements.length}] Skipped (already exists): ${err.message}`);
      } else {
        console.error(`[Stmt ${i + 1}/${statements.length}] Failed:`, err.message);
      }
    }
  }

  console.log("\nMigration execution finished!");
  await pgClient.end();
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
