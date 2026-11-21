"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { useDict } from "@/i18n/LocaleProvider";

type SessionUser = { name?: string | null; email?: string | null; role?: "USER" | "ADMIN" };

/**
 * Top-bar account area: "Login" for guests, or the signed-in name + Logout.
 * Reads /api/auth/session directly, so the public site needs no SessionProvider.
 */
export function AuthLink({ className = "" }: { className?: string }) {
  const d = useDict().header;
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => alive && setUser(s?.user ?? null))
      .catch(() => {})
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  async function logout() {
    setBusy(true);
    try {
      const { csrfToken } = await (await fetch("/api/auth/csrf")).json();
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ csrfToken, json: "true" }),
      });
      setUser(null);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <span className={`inline-block h-5 w-16 ${className}`} aria-hidden />;

  if (!user)
    return (
      <Link href="/auth/signin" className={`flex items-center gap-2 font-semibold hover:text-white ${className}`}>
        <LogIn className="h-3.5 w-3.5 text-accent" /> {d.login}
      </Link>
    );

  const name = user.name || user.email || "";
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      {user.role === "ADMIN" ? (
        <Link href="/admin" className="flex items-center gap-2 font-semibold hover:text-white" title={d.dashboard}>
          <LayoutDashboard className="h-3.5 w-3.5 text-accent" /> {name}
        </Link>
      ) : (
        <span className="font-semibold">{name}</span>
      )}
      <button onClick={logout} disabled={busy} className="flex items-center gap-1.5 rounded-full border border-white/30 px-2.5 py-0.5 hover:bg-white/10 disabled:opacity-60">
        <LogOut className="h-3.5 w-3.5" /> {d.logout}
      </button>
    </span>
  );
}
