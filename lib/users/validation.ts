import { z } from "zod";

/**
 * Shared by the admin user-management UI (client-side checks) and the API routes.
 * Error paths match the form field names so the dialog can show them inline.
 */

export const ROLES = ["USER", "ADMIN"] as const;
export type UserRole = (typeof ROLES)[number];

/** bcrypt only uses the first 72 bytes, so longer passwords are refused instead of silently cut. */
export const passwordSchema = z
  .string()
  .min(8)
  .refine((v) => new TextEncoder().encode(v).length <= 72);

const name = z.string().trim().min(1).max(100);
const email = z.string().trim().toLowerCase().max(254).pipe(z.email());
const phone = z
  .string()
  .trim()
  .max(40)
  .regex(/^[0-9+()\-\s]*$/)
  .transform((v) => v || null);
const role = z.enum(ROLES);
/** ISO timestamp the client last saw; a mismatch means someone else changed the user meanwhile. */
const updatedAt = z.iso.datetime();

const profile = { name, email, phone, role, isActive: z.boolean() };

export const createUserSchema = z.object({ ...profile, password: passwordSchema }).strict();
export const updateUserSchema = z.object({ ...profile, updatedAt }).strict();
export const resetPasswordSchema = z.object({ password: passwordSchema, updatedAt }).strict();
export const userStatusSchema = z.object({ isActive: z.boolean(), updatedAt }).strict();
export const deleteUserSchema = z.object({ email: z.string().trim().toLowerCase().max(254), updatedAt }).strict();

export const userQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
  role: z.enum(["ALL", ...ROLES]).default("ALL"),
  status: z.enum(["ALL", "ACTIVE", "INACTIVE"]).default("ALL"),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
});

export type UserQuery = z.input<typeof userQuerySchema> & {
  q: string;
  role: "ALL" | UserRole;
  status: "ALL" | "ACTIVE" | "INACTIVE";
  page: number;
};
export type CreateUserInput = z.output<typeof createUserSchema>;
export type UpdateUserInput = z.output<typeof updateUserSchema>;
export type ResetPasswordInput = z.output<typeof resetPasswordSchema>;
export type UserStatusInput = z.output<typeof userStatusSchema>;

/** What the API sends to the browser — never the password hash. */
export type ManagedUser = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export type UserList = {
  users: ManagedUser[];
  total: number;
  page: number;
  pageSize: number;
  stats: { total: number; active: number; admins: number; inactive: number };
};
