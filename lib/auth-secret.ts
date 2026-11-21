/**
 * NextAuth signing secret. Required in production; in development a fixed
 * fallback keeps `npm run dev` working without any setup.
 */
export function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
    throw new Error("NEXTAUTH_SECRET is not set. Generate one with: openssl rand -base64 32");
  }
  return "suraksha-dev-only-secret-change-me";
}
