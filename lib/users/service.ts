import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import type {
  CreateUserInput,
  ManagedUser,
  ResetPasswordInput,
  UpdateUserInput,
  UserList,
  UserQuery,
  UserStatusInput,
} from "./validation";

export const PAGE_SIZE = 15;

/** Error with a code the UI translates (`admin.users.errors.<code>`). */
export class UserError extends Error {
  constructor(
    public code: "notFound" | "conflict" | "emailTaken" | "self" | "lastAdmin" | "confirmation",
    public status: number,
  ) {
    super(code);
  }
}

const select = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
} satisfies Prisma.UserSelect;

type Row = Prisma.UserGetPayload<{ select: typeof select }>;

function toManaged(u: Row): ManagedUser {
  return {
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
  };
}

const isUniqueViolation = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

export async function listUsers(query: UserQuery): Promise<UserList> {
  const q = query.q.trim();
  const where: Prisma.UserWhereInput = {
    ...(query.role !== "ALL" ? { role: query.role } : {}),
    ...(query.status !== "ALL" ? { isActive: query.status === "ACTIVE" } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : {}),
  };

  const [rows, total, all, active, admins] = await Promise.all([
    db.user.findMany({
      where,
      select,
      orderBy: [{ role: "desc" }, { createdAt: "desc" }],
      skip: (query.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.user.count({ where }),
    db.user.count(),
    db.user.count({ where: { isActive: true } }),
    db.user.count({ where: { role: "ADMIN" } }),
  ]);

  return {
    users: rows.map(toManaged),
    total,
    page: query.page,
    pageSize: PAGE_SIZE,
    stats: { total: all, active, admins, inactive: all - active },
  };
}

export async function createUser(_actorId: string, input: CreateUserInput): Promise<ManagedUser> {
  try {
    const user = await db.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        role: input.role,
        isActive: input.isActive,
        passwordHash: await bcrypt.hash(input.password, 12),
        emailVerified: new Date(),
      },
      select,
    });
    return toManaged(user);
  } catch (e) {
    if (isUniqueViolation(e)) throw new UserError("emailTaken", 409);
    throw e;
  }
}

type Change = UpdateUserInput | ResetPasswordInput | UserStatusInput;

/**
 * Updates (or, with `data === null`, deletes) a user.
 * - `updatedAt` must match the stored value, so two admins can't overwrite each other.
 * - Admins can't demote, deactivate or delete themselves, and the last active admin is protected.
 * - Password, role, status or email changes sign that user out everywhere (sessionVersion + 1).
 */
export async function changeUser(
  actorId: string,
  id: string,
  updatedAt: string,
  data: Change | null,
  confirmEmail?: string,
): Promise<ManagedUser | null> {
  return db.$transaction(
    async (tx) => {
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) throw new UserError("notFound", 404);
      if (user.updatedAt.toISOString() !== new Date(updatedAt).toISOString()) throw new UserError("conflict", 409);

      const self = id === actorId;
      const activeAdmins = () => tx.user.count({ where: { role: "ADMIN", isActive: true } });
      const isLastAdmin = async () => user.role === "ADMIN" && user.isActive && (await activeAdmins()) <= 1;

      // ---- delete ----
      if (data === null) {
        if (self) throw new UserError("self", 400);
        if ((confirmEmail ?? "").trim().toLowerCase() !== user.email) throw new UserError("confirmation", 400);
        if (await isLastAdmin()) throw new UserError("lastAdmin", 400);
        await tx.user.delete({ where: { id } });
        return null;
      }

      const update: Prisma.UserUpdateInput = {};
      let revoke = false;

      if ("password" in data) {
        update.passwordHash = await bcrypt.hash(data.password, 12);
        revoke = true;
      }

      if ("isActive" in data && data.isActive !== user.isActive) {
        if (self) throw new UserError("self", 400);
        if (!data.isActive && (await isLastAdmin())) throw new UserError("lastAdmin", 400);
        update.isActive = data.isActive;
        revoke = true;
      }

      if ("name" in data) {
        if (data.role !== user.role) {
          if (self) throw new UserError("self", 400);
          if (data.role !== "ADMIN" && (await isLastAdmin())) throw new UserError("lastAdmin", 400);
          update.role = data.role;
          revoke = true;
        }
        if (data.email !== user.email) {
          update.email = data.email;
          revoke = true;
        }
        update.name = data.name;
        update.phone = data.phone;
      }

      if (revoke) update.sessionVersion = { increment: 1 };

      try {
        const saved = await tx.user.update({ where: { id }, data: update, select });
        return toManaged(saved);
      } catch (e) {
        if (isUniqueViolation(e)) throw new UserError("emailTaken", 409);
        throw e;
      }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
