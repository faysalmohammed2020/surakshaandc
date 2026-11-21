import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { isAdminRequest } from "@/lib/auth-admin";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ENQUIRY_STATUSES } from "@/lib/enquiries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store" };
const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403, headers });

/** List enquiries (appointments + contact messages), newest first. */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest())) return forbidden();
  const sp = request.nextUrl.searchParams;
  const status = sp.get("status");
  const kind = sp.get("kind");
  const q = sp.get("q")?.trim().slice(0, 100);

  const where: Prisma.EnquiryWhereInput = {
    ...(status && (ENQUIRY_STATUSES as readonly string[]).includes(status)
      ? { status: status as (typeof ENQUIRY_STATUSES)[number] }
      : {}),
    ...(kind === "APPOINTMENT" || kind === "CONTACT" ? { kind } : {}),
    ...(q
      ? {
          OR: [
            { parentName: { contains: q, mode: "insensitive" } },
            { childName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
            { message: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, counts] = await Promise.all([
    db.enquiry.findMany({ where, orderBy: { createdAt: "desc" }, take: 300 }),
    db.enquiry.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  return NextResponse.json(
    {
      items: items.map((e) => ({
        ...e,
        preferredDate: e.preferredDate ? e.preferredDate.toISOString().slice(0, 10) : null,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      })),
      counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])),
    },
    { headers },
  );
}

const patchSchema = z.object({
  id: z.uuid(),
  status: z.enum(ENQUIRY_STATUSES).optional(),
  adminNotes: z.string().max(4000).optional(),
});

export async function PATCH(request: NextRequest) {
  if (!(await isAdminRequest())) return forbidden();
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400, headers });
  const { id, ...data } = parsed.data;
  try {
    const e = await db.enquiry.update({ where: { id }, data });
    return NextResponse.json({ ok: true, status: e.status, updatedAt: e.updatedAt.toISOString() }, { headers });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest())) return forbidden();
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!z.uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid request" }, { status: 400, headers });
  await db.enquiry.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true }, { headers });
}
