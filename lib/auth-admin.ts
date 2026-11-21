import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/** Admin pages: redirect to sign-in unless the visitor is a signed-in ADMIN. */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}

/** API routes: true only for a signed-in ADMIN. */
export async function isAdminRequest(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function getAdminUser() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return null;
  return { id: session.user.id, name: session.user.name ?? "Admin" };
}
