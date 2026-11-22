import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store" };

/** New activity since this admin last visited each inbox. */
export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers });
  }

  try {
    const seen = await db.adminInboxSeen.findUnique({ where: { userId: user.id } });
    const [liveChat, enquiries] = await Promise.all([
      db.chatConversation.count({
        where: seen?.chatSeenAt ? {
          OR: [
            { createdAt: { gt: seen.chatSeenAt } },
            { messages: { some: { senderType: "VISITOR", createdAt: { gt: seen.chatSeenAt } } } },
          ],
        } : {},
      }),
      db.enquiry.count({ where: seen?.enquiriesSeenAt ? { createdAt: { gt: seen.enquiriesSeenAt } } : {} }),
    ]);
    return NextResponse.json({ liveChat, enquiries }, { headers });
  } catch (error) {
    console.error("[admin/sidebar-counts] could not load totals:", error);
    return NextResponse.json({ error: "Could not load counts" }, { status: 500, headers });
  }
}

/** Visiting a section clears only its sidebar badge, for this admin. */
export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403, headers });
  const body = await request.json().catch(() => null);
  if (body?.section !== "liveChat" && body?.section !== "enquiries") {
    return NextResponse.json({ error: "Invalid section" }, { status: 400, headers });
  }

  try {
    // Use the application clock, like Prisma's createdAt values for new activity.
    // GREATEST keeps concurrent visits from moving the watermark backwards.
    const seenAt = new Date();
    if (body.section === "liveChat") {
      await db.$executeRaw`
        INSERT INTO "admin_inbox_seen" ("user_id", "chat_seen_at") VALUES (${user.id}, ${seenAt})
        ON CONFLICT ("user_id") DO UPDATE SET "chat_seen_at" = GREATEST("admin_inbox_seen"."chat_seen_at", EXCLUDED."chat_seen_at")`;
    } else {
      await db.$executeRaw`
        INSERT INTO "admin_inbox_seen" ("user_id", "enquiries_seen_at") VALUES (${user.id}, ${seenAt})
        ON CONFLICT ("user_id") DO UPDATE SET "enquiries_seen_at" = GREATEST("admin_inbox_seen"."enquiries_seen_at", EXCLUDED."enquiries_seen_at")`;
    }
    return NextResponse.json({ ok: true }, { headers });
  } catch (error) {
    console.error("[admin/sidebar-counts] could not mark inbox seen:", error);
    return NextResponse.json({ error: "Could not mark inbox seen" }, { status: 500, headers });
  }
}
