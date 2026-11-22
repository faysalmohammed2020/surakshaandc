"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { assets } from "@/data/assets";

export default function SignUp() {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    router.replace("/admin");
  }, [router, session?.user?.role, status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push(
        "/auth/signin?message=Account created! Please sign in.&callbackUrl=%2Fadmin",
      );
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Join the team"
      title="Create account"
      sub="Set up your staff account. An admin will give you access to the panel."
      panelTitle="Little steps. Beautiful possibilities."
      panelPoints={["One plan for every child", "Families at every step", "A caring, connected team"]}
      image={assets.teamMeeting}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/signin" className="au-link">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="au-fields">
        <div>
          <label htmlFor="name">
            Name <span className="au-opt">(optional)</span>
          </label>
          <div className="au-input">
            <User className="au-icon" />
            <input id="name" name="name" type="text" autoComplete="name" value={form.name} onChange={handleChange} placeholder="Your name" />
          </div>
        </div>

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
          <label htmlFor="password">
            Password <span className="au-opt">(min 8 characters)</span>
          </label>
          <div className="au-input">
            <Lock className="au-icon" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
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
              Creating...
            </>
          ) : (
            <>
              Sign up
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
