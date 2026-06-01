import { db } from "../config/database";
import { packageDeals } from "../db/schema";
import { eq } from "drizzle-orm";

const PACKAGES_DATA = [
  {
    packageName: "Starter",
    sessionCount: 1,
    price: "2500.00",
    validityDays: 30,
    description: "1 live mock interview, Summary feedback, Basic action plan",
    isActive: true,
  },
  {
    packageName: "Growth",
    sessionCount: 5,
    price: "12000.00",
    validityDays: 90,
    description: "Role-focused interview tracks, Detailed feedback after each session, Progress trend view",
    isActive: true,
  },
  {
    packageName: "Career Sprint",
    sessionCount: 10,
    price: "20000.00",
    validityDays: 180,
    description: "Full interview preparation cycle, Priority booking, Comprehensive improvement plan",
    isActive: true,
  },
];

async function seed() {
  console.log("🌱 Seeding package deals...");
  
  for (const pkg of PACKAGES_DATA) {
    const [existing] = await db
      .select()
      .from(packageDeals)
      .where(eq(packageDeals.packageName, pkg.packageName))
      .limit(1);

    if (existing) {
      console.log(`ℹ️ Package '${pkg.packageName}' already exists. Updating details...`);
      await db
        .update(packageDeals)
        .set({
          sessionCount: pkg.sessionCount,
          price: pkg.price,
          validityDays: pkg.validityDays,
          description: pkg.description,
          isActive: pkg.isActive,
        })
        .where(eq(packageDeals.id, existing.id));
    } else {
      console.log(`➕ Creating package '${pkg.packageName}'...`);
      await db.insert(packageDeals).values({
        packageName: pkg.packageName,
        sessionCount: pkg.sessionCount,
        price: pkg.price,
        validityDays: pkg.validityDays,
        description: pkg.description,
        isActive: pkg.isActive,
      });
    }
  }

  console.log("🎉 Seeding package deals complete!");
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding packages failed:", err);
    process.exit(1);
  });
