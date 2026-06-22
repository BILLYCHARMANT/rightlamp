export default function LoginLoading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-16">
      <div className="w-full max-w-md animate-pulse rounded-2xl border border-border bg-surface-elevated p-8 shadow-xl shadow-ink/10">
        <div className="mx-auto mb-6 h-20 w-44 rounded-lg bg-surface" />
        <div className="mx-auto h-7 w-40 rounded bg-surface" />
        <div className="mx-auto mt-3 h-4 w-full max-w-xs rounded bg-surface" />
        <div className="mt-8 space-y-4">
          <div className="h-12 rounded-xl bg-surface" />
          <div className="h-12 rounded-xl bg-surface" />
          <div className="h-11 rounded-full bg-surface" />
        </div>
      </div>
    </div>
  );
}
