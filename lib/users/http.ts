import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { UserError } from "./service";

export const privateHeaders = { "Cache-Control": "private, no-store" };

const writes = createRateLimiter({ limit: 60, windowMs: 10 * 60_000 });

type Authorized = { response: null; actorId: string } | { response: NextResponse; actorId?: undefined };

/**
 * Admin-only gate for /api/admin/users.
 * Writes must also come from this site (Origin check) and are rate limited per admin.
 */
export async function authorizeUserManagement(request: Request): Promise<Authorized> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { response: NextResponse.json({ error: "forbidden" }, { status: 403, headers: privateHeaders }) };
  }

  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (origin && host && new URL(origin).host !== host) {
      return { response: NextResponse.json({ error: "forbidden" }, { status: 403, headers: privateHeaders }) };
    }
    if (!writes.check(session.user.id).ok) {
      return { response: NextResponse.json({ error: "rateLimited" }, { status: 429, headers: privateHeaders }) };
    }
  }

  return { response: null, actorId: session.user.id };
}

export function userManagementFailure(error: unknown) {
  if (error instanceof UserError) {
    return NextResponse.json({ error: error.code }, { status: error.status, headers: privateHeaders });
  }
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "invalid" }, { status: 400, headers: privateHeaders });
  }
  // Serializable transaction lost a race with another admin: ask them to retry.
  if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "P2034") {
    return NextResponse.json({ error: "conflict" }, { status: 409, headers: privateHeaders });
  }
  console.error("[admin/users]", error);
  return NextResponse.json({ error: "server" }, { status: 500, headers: privateHeaders });
}
