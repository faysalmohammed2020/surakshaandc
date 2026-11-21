import { z } from "zod";

/** Bangla digits → ASCII, so "০১৭১২…" validates and is stored consistently. */
export const normalizeDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));

const text = (max: number) => z.string().trim().max(max);

export const ENQUIRY_TYPES = ["Appointment", "Admission", "Assessment"] as const;

export const enquirySchema = z
  .object({
    kind: z.enum(["appointment", "contact"]),
    locale: z.enum(["en", "bn"]).catch("en"),
    parentName: text(120).optional(),
    name: text(120).optional(),
    phone: z
      .string()
      .transform((v) => normalizeDigits(v).replace(/[\s()-]/g, ""))
      .pipe(z.string().regex(/^\+?\d{10,15}$/)),
    email: z.union([z.literal(""), z.email().max(254)]).optional(),
    childName: text(120).optional(),
    childAge: text(40).optional(),
    service: text(120).optional(),
    type: z.enum(ENQUIRY_TYPES).optional().catch(undefined),
    date: z
      .union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])
      .optional()
      .catch(undefined),
    message: text(3000).optional(),
    website: z.string().optional(), // honeypot
  })
  .superRefine((v, ctx) => {
    const who = v.kind === "appointment" ? v.parentName : v.name;
    if (!who) ctx.addIssue({ code: "custom", path: ["name"], message: "required" });
    if (v.kind === "appointment" && (!v.childName || !v.childAge))
      ctx.addIssue({ code: "custom", path: ["childName"], message: "required" });
    if (v.kind === "contact" && !v.message) ctx.addIssue({ code: "custom", path: ["message"], message: "required" });
  });

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const ENQUIRY_STATUSES = ["NEW", "CONTACTED", "SCHEDULED", "CLOSED"] as const;
