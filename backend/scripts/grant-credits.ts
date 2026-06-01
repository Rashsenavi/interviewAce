/**
 * Emergency script: Manually grant Growth Pack (5 credits) to Rusini Chamathka
 * Run: npx tsx scripts/grant-credits.ts
 */
import { db } from "../src/config/database";
import { packagePurchases, packageDeals, jobSeekers, users } from "../src/db/schema";
import { eq, and } from "drizzle-orm";

async function grantCredits() {
  // Find user by email
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/grant-credits.ts <email> <packageId>");
    console.error("Example: npx tsx scripts/grant-credits.ts rusini@example.com 2");
    process.exit(1);
  }

  const packageId = parseInt(process.argv[3] || "2", 10);

  // Find user
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }
  console.log(`Found user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);

  // Find job seeker
  const [jobSeeker] = await db.select().from(jobSeekers).where(eq(jobSeekers.userId, user.id)).limit(1);
  if (!jobSeeker) {
    console.error("Job seeker profile not found");
    process.exit(1);
  }
  console.log(`Found job seeker ID: ${jobSeeker.id}`);

  // Find package
  const [deal] = await db.select().from(packageDeals).where(eq(packageDeals.id, packageId)).limit(1);
  if (!deal) {
    console.error(`Package not found: ${packageId}`);
    process.exit(1);
  }
  console.log(`Package: ${deal.packageName} (${deal.sessionCount} credits, ${deal.validityDays} days)`);

  // Insert credits
  const now = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(now.getDate() + (deal.validityDays || 30));

  const [created] = await db.insert(packagePurchases).values({
    jobSeekerId: jobSeeker.id,
    packageId: deal.id,
    totalCredits: deal.sessionCount,
    creditsRemaining: deal.sessionCount,
    purchaseDate: now,
    expiryDate,
    isActive: true,
  }).returning();

  console.log(`✅ Credits granted! Purchase ID: ${created.id}`);
  console.log(`   Credits: ${deal.sessionCount} (expires ${expiryDate.toLocaleDateString()})`);
  process.exit(0);
}

grantCredits().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
