import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-md flex-1 py-4 text-center sm:py-8">
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        Sign in
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Customer accounts can plug in here. Staff use the dashboard.
      </p>
      <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-8">
        <button
          type="button"
          disabled
          className="rounded-full bg-surface-elevated py-3 text-sm font-semibold text-muted-foreground"
        >
          Coming soon
        </button>
        <Link
          href="/login?callbackUrl=/dashboard"
          className="text-sm font-semibold text-accent hover:text-accent-muted"
        >
          Staff sign in (dashboard)
        </Link>
        <Link href="/shop" className="text-sm text-muted-foreground hover:text-ink">
          â† Back to shop
        </Link>
      </div>
    </main>
  );
}
