import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { enquirySchema } from "@/lib/enquiries";
import { getClientIp } from "@/lib/security/client-ip";
import { createRateLimiter } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ limit: 6, windowMs: 60 * 60_000 });

const MSG = {
  en: {
    invalid: "Please check the highlighted details and try again.",
    phone: "Please enter a valid phone number (e.g. 01XXXXXXXXX).",
    rate: "Too many requests. Please try again later.",
    server: "We could not save your request right now. Please call us instead.",
  },
  bn: {
    invalid: "অনুগ্রহ করে তথ্যগুলো যাচাই করে আবার চেষ্টা করুন।",
    phone: "সঠিক ফোন নম্বর দিন (যেমন ০১XXXXXXXXX)।",
    rate: "অনেক বেশি অনুরোধ হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
    server: "এই মুহূর্তে আপনার অনুরোধ সংরক্ষণ করা যায়নি। অনুগ্রহ করে আমাদের কল করুন।",
  },
} as const;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: MSG.en.invalid }, { status: 400 });
  }
  const loc: "en" | "bn" = (body as { locale?: string } | null)?.locale === "bn" ? "bn" : "en";
  const m = MSG[loc];

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    const phoneBad = parsed.error.issues.some((i) => i.path[0] === "phone");
    return NextResponse.json({ error: phoneBad ? m.phone : m.invalid }, { status: 400 });
  }
  const v = parsed.data;

  // Honeypot: bots fill the hidden field. Pretend success, store nothing.
  if (v.website) return NextResponse.json({ ok: true });

  const ip = getClientIp(request.headers);
  if (ip && !limiter.check(ip).ok) {
    return NextResponse.json({ error: m.rate }, { status: 429, headers: { "Retry-After": "3600" } });
  }

  try {
    await db.enquiry.create({
      data: {
        kind: v.kind === "appointment" ? "APPOINTMENT" : "CONTACT",
        parentName: (v.kind === "appointment" ? v.parentName : v.name) ?? "",
        phone: v.phone,
        email: v.email || null,
        childName: v.childName || null,
        childAge: v.childAge || null,
        service: v.service || null,
        requestType: v.type ?? null,
        preferredDate: v.date ? new Date(`${v.date}T00:00:00.000Z`) : null,
        message: v.message || null,
        locale: v.locale,
        ipHash: ip ? createHash("sha256").update(ip).digest("hex") : null,
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("[enquiry] save failed:", e);
    return NextResponse.json({ error: m.server }, { status: 500 });
  }
}
