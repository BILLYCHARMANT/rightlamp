"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { BRAND_LOGO, BRAND_LOGO_ALT } from "@/lib/company/brand-assets";

const STAFF_HOME = "/dashboard";

/** Map production post-login paths to local staff routes. */
function staffHomeFromCallback(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return STAFF_HOME;
  if (raw === "/pos" || raw.startsWith("/pos/")) return "/pos";
  if (raw === "/admin" || raw.startsWith("/admin/")) return STAFF_HOME;
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = staffHomeFromCallback(searchParams.get("callbackUrl"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError(
          res.error === "CredentialsSignin"
            ? "Invalid email or password"
            : res.error,
        );
        return;
      }
      if (res?.ok) {
        router.replace(callbackUrl);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-8 shadow-xl shadow-ink/10">
        <h1 className="text-center text-2xl font-bold tracking-tight text-ink">
          Welcome Back
        </h1>
        <div className="mt-4 flex justify-center">
          <Image
            src={BRAND_LOGO}
            alt={BRAND_LOGO_ALT}
            width={220}
            height={88}
            className="h-20 w-auto object-contain"
            priority
          />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error ? (
            <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <label className="block text-sm font-medium text-ink">
            Email Address
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-ink placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
              placeholder="name@example.com"
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-ink placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand/94 py-3 text-sm font-semibold text-ink shadow-md shadow-brand/10 ring-1 ring-brand/15 transition hover:bg-brand-hover disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
