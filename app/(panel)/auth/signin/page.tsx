"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";

function sanitizeCallbackUrl(value: string | null | undefined, fallback = "/admin") {
  const candidate = value?.trim();

  if (!candidate || candidate.startsWith("//") || !candidate.startsWith("/")) {
    return fallback;
  }

  try {
    const parsed = new URL(candidate, "http://localhost");
    if (parsed.origin !== "http://localhost") {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
  } catch {
    return fallback;
  }
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const callbackUrl = sanitizeCallbackUrl(searchParams.get("callbackUrl"));

  const { data: session, status } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    router.replace(session?.user?.role === "ADMIN" ? "/admin" : callbackUrl);
  }, [callbackUrl, router, session?.user?.role, status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
      callbackUrl,
    });

    if (!res || res.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <AuthShell
      badge="Welcome back"
      title="Sign in"
      sub="Sign in to manage appointments, enquiries, chat and blog posts."
      panelTitle="Every child shines in their own colour"
      panelPoints={["Appointment & enquiry tracking", "Live chat with families", "Blog & news publishing"]}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="au-link">
            Sign up
          </Link>
        </>
      }
    >
      {message && (
        <div className="au-alert ok">
          <Check className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="au-fields">
        <div>
          <label htmlFor="email">Email address</label>
          <div className="au-input">
            <Mail className="au-icon" />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@surakshaandc.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <div className="au-input">
            <Lock className="au-icon" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="au-eye"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="au-alert err">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="au-submit">
          {loading ? (
            <>
              <span className="au-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
