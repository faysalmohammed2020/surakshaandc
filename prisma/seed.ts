import "dotenv/config";
import bcrypt from "bcryptjs";

import { db } from "../lib/db";
import { resetDemoBlogs, seedDemoBlogs } from "./seed-blogs";

/**
 * Admin account used to sign in at /auth/signin → /admin.
 * Edit these two values to change the login; the next seed (every `npm run build`)
 * applies the change. They are no longer read from .env.
 */
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

/**
 * Creates (or repairs) the admin account.
 * Re-running is safe: an existing account is promoted to ADMIN, and its password is
 * only rewritten when it no longer matches ADMIN_PASSWORD.
 */
async function seedAdminUser() {
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const password = ADMIN_PASSWORD;

  const existing = await db.user.findUnique({ where: { email } });

  if (!existing) {
    await db.user.create({
      data: {
        email,
        name: "Admin",
        role: "ADMIN",
        passwordHash: await bcrypt.hash(password, 12),
        emailVerified: new Date(),
      },
    });
    console.log("Admin created:", email);
    return;
  }

  const data: { role?: "ADMIN"; passwordHash?: string } = {};
  if (existing.role !== "ADMIN") data.role = "ADMIN";
  const matches = existing.passwordHash ? await bcrypt.compare(password, existing.passwordHash) : false;
  if (!matches) data.passwordHash = await bcrypt.hash(password, 12);
  if (Object.keys(data).length) {
    await db.user.update({ where: { id: existing.id }, data });
    console.log("Admin updated:", email, data.passwordHash ? "(password set from seed)" : "(promoted to ADMIN)");
  } else {
    console.log("Admin already exists:", email);
  }
}

async function main() {
  // `npx prisma db seed -- --reset-blogs` only removes the starter blog posts.
  if (process.argv.includes("--reset-blogs")) {
    await resetDemoBlogs();
    return;
  }

  await seedAdminUser();
  await seedDemoBlogs();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
