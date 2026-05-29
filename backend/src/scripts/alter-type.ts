import { pgClient } from "../config/database";

async function main() {
  console.log("Starting ALTER TYPE queries...");
  try {
    // Check if values already exist to avoid errors
    const res = await pgClient.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'session_status'::regtype;
    `);
    const existingLabels = res.rows.map(r => r.enumlabel);
    console.log("Existing labels:", existingLabels);

    if (!existingLabels.includes("awaiting_confirmation")) {
      console.log("Adding awaiting_confirmation to session_status enum...");
      await pgClient.query("ALTER TYPE session_status ADD VALUE 'awaiting_confirmation';");
    } else {
      console.log("awaiting_confirmation already exists in session_status enum.");
    }

    if (!existingLabels.includes("disputed")) {
      console.log("Adding disputed to session_status enum...");
      await pgClient.query("ALTER TYPE session_status ADD VALUE 'disputed';");
    } else {
      console.log("disputed already exists in session_status enum.");
    }

    console.log("ALTER TYPE queries finished successfully!");
  } catch (error) {
    console.error("Failed to run ALTER TYPE queries:", error);
  } finally {
    await pgClient.end();
  }
}

main();
