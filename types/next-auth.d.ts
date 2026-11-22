import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: "USER" | "ADMIN" } & DefaultSession["user"];
  }
  interface User {
    role?: "USER" | "ADMIN";
    sessionVersion?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "ADMIN";
    /** User.sessionVersion at sign-in; a mismatch ends the session. */
    sv?: number;
    revoked?: boolean;
  }
}
