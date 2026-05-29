export function DashboardHomeIntro() {
  return (
    <header className="rounded-2xl border border-border bg-gradient-to-br from-surface-elevated via-surface-elevated to-brand/[0.06] p-6 shadow-sm shadow-ink/[0.04] ring-1 ring-ink/[0.03] md:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Operations floor
      </p>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-ink md:text-2xl">
        Same workflow Rightlamps crews already know — surfaced faster.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Columns in the rail match production admin areas (orders through reports). Use{" "}
        <kbd className="rounded border border-border bg-canvas px-1.5 py-0.5 text-[11px] font-medium text-ink">
          ⌘
        </kbd>{" "}
        <kbd className="rounded border border-border bg-canvas px-1.5 py-0.5 text-[11px] font-medium text-ink">
          K
        </kbd>{" "}
        /{" "}
        <kbd className="rounded border border-border bg-canvas px-1.5 py-0.5 text-[11px] font-medium text-ink">
          Ctrl
        </kbd>{" "}
        <kbd className="rounded border border-border bg-canvas px-1.5 py-0.5 text-[11px] font-medium text-ink">
          K
        </kbd>{" "}
        from anywhere in the terminal to jump without hunting the sidebar.
      </p>
    </header>
  );
}
