/**
 * List all job seekers and their package credits
 * Run: npx tsx scripts/list-users.ts
 */
import { db } from "../src/config/database";
import { packagePurchases, packageDeals, jobSeekers, users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function listUsers() {
  const seekers = await db
    .select({
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      jobSeekerId: jobSeekers.id,
    })
    .from(users)
    .innerJoin(jobSeekers, eq(jobSeekers.userId, users.id));

  console.log("\n=== Job Seekers ===");
  for (const s of seekers) {
    console.log(`  ${s.firstName} ${s.lastName} | ${s.email} | jobSeekerId: ${s.jobSeekerId}`);
  }

  const purchases = await db
    .select({
      id: packagePurchases.id,
      jobSeekerId: packagePurchases.jobSeekerId,
      packageId: packagePurchases.packageId,
      totalCredits: packagePurchases.totalCredits,
      creditsRemaining: packagePurchases.creditsRemaining,
      isActive: packagePurchases.isActive,
      expiryDate: packagePurchases.expiryDate,
    })
    .from(packagePurchases);

  console.log("\n=== Package Purchases ===");
  if (purchases.length === 0) {
    console.log("  (none)");
  } else {
    for (const p of purchases) {
      console.log(`  ID: ${p.id} | jobSeekerId: ${p.jobSeekerId} | pkgId: ${p.packageId} | credits: ${p.creditsRemaining}/${p.totalCredits} | active: ${p.isActive} | expires: ${p.expiryDate}`);
    }
  }

  const deals = await db.select().from(packageDeals);
  console.log("\n=== Package Deals ===");
  for (const d of deals) {
    console.log(`  ID: ${d.id} | ${d.packageName} | ${d.sessionCount} sessions | LKR ${d.price} | ${d.validityDays} days`);
  }

  process.exit(0);
}

listUsers().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
