"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
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
      });
      if (res?.error) {
        setError(
          res.error === "CredentialsSignin"
            ? "Invalid email or password"
            : res.error,
        );
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-8 shadow-xl shadow-ink/10">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Sign in to manage your inventory and orders — same intent as{" "}
          <a
            href="https://www.rightlamps.com/signin"
            className="font-medium text-accent hover:text-accent-muted"
            target="_blank"
            rel="noreferrer"
          >
            rightlamps.com/signin
          </a>
          , routed here for the renovated staff dashboard (
          <Link
            href="/"
            className="font-medium text-accent hover:text-accent-muted"
          >
            storefront
          </Link>
          ).
        </p>

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

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Need a storefront account flow?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-accent hover:text-accent-muted"
          >
            Customer sign-in (preview)
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          First time? Run{" "}
          <code className="rounded bg-surface px-1 py-0.5 font-mono text-sm text-ink ring-1 ring-border">
            npm run db:seed
          </code>{" "}
          — default admin is{" "}
          <span className="font-medium text-ink">admin@rightlamps.rw</span>{" "}
          unless you set{" "}
          <code className="rounded bg-surface px-1 py-0.5 ring-1 ring-border">
            SEED_ADMIN_*
          </code>{" "}
          in <code className="rounded bg-surface px-1 py-0.5 ring-1 ring-border">.env.local</code>.
        </p>
      </div>
    </div>
  );
}
