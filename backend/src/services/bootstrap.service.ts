import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { admins, users } from "../db/schema";

export const ensureDefaultAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@interviewace.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
  const firstName = process.env.ADMIN_FIRST_NAME || "System";
  const lastName = process.env.ADMIN_LAST_NAME || "Admin";

  const [existingAdminUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.userType, "admin"))
    .limit(1);

  if (existingAdminUser) {
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const [createdUser] = await db
    .insert(users)
    .values({
      email: adminEmail,
      passwordHash,
      firstName,
      lastName,
      userType: "admin",
      isVerified: true,
      isActive: true,
    })
    .returning({ id: users.id, email: users.email });

  await db.insert(admins).values({
    userId: createdUser.id,
    adminLevel: "super_admin",
    permissions: JSON.stringify(["*"]),
  });

  console.log(`[bootstrap] Default admin created: ${createdUser.email}`);
};

export default {
  ensureDefaultAdmin,
};
