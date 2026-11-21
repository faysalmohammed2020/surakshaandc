import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

import { db } from "../lib/db";
import { resetDemoBlogs, seedDemoBlogs } from "./seed-blogs";

/**
 * Creates (or repairs) the admin account used to sign in at /auth/signin → /admin.
 *
 *   SEED_ADMIN_EMAIL     default: admin@surakshaandc.com
 *   SEED_ADMIN_PASSWORD  min 12 chars. If unset in development a random one is
 *                        generated and printed once. Required in production.
 *
 * Re-running is safe: an existing account is promoted to ADMIN, and its password
 * is only changed when SEED_ADMIN_PASSWORD is set.
 */
async function seedAdminUser() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@surakshaandc.com").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password && process.env.NODE_ENV === "production") {
    console.warn("Skipping admin seed: set SEED_ADMIN_PASSWORD (min 12 chars) to create one.");
    return;
  }
  if (password && password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters.");
  }

  const existing = await db.user.findUnique({ where: { email } });

  if (!existing) {
    const finalPassword = password ?? randomBytes(12).toString("base64url");
    await db.user.create({
      data: {
        email,
        name: "Admin",
        role: "ADMIN",
        passwordHash: await bcrypt.hash(finalPassword, 12),
        emailVerified: new Date(),
      },
    });
    console.log("Admin created:", email);
    if (!password) console.log("Generated dev admin password (shown once):", finalPassword);
    return;
  }

  const data: { role?: "ADMIN"; passwordHash?: string } = {};
  if (existing.role !== "ADMIN") data.role = "ADMIN";
  if (password) data.passwordHash = await bcrypt.hash(password, 12);
  if (Object.keys(data).length) {
    await db.user.update({ where: { id: existing.id }, data });
    console.log("Admin updated:", email, password ? "(password reset)" : "(promoted to ADMIN)");
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
