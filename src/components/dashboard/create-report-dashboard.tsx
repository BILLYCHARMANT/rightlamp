"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilePlus } from "lucide-react";
import { createOperationalReport } from "@/lib/dashboard/report-actions";

export function CreateReportDashboard() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [periodStart, setPeriodStart] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10),
  );
  const [periodEnd, setPeriodEnd] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [publish, setPublish] = useState(false);

  const submit = (asDraft: boolean) => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      const res = await createOperationalReport({
        title,
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString(),
        summary: summary || null,
        body: body || null,
        publish: asDraft ? false : publish,
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setSuccess(asDraft ? "Draft saved." : "Report published.");
      setTitle("");
      setSummary("");
      setBody("");
      router.refresh();
    });
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="max-w-2xl">
        <p className="text-sm text-muted-foreground">
          Author an operational report — same intent as production{" "}
          <code className="rounded bg-surface px-1 py-0.5 text-xs">POST /api/report</code>.
          Save as draft or publish to the summary rollup.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {success}
        </p>
      ) : null}

      <form
        className="mx-auto max-w-3xl space-y-6 rounded-xl border border-border bg-surface-elevated p-6 shadow-sm md:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
      >
        <div className="flex items-center gap-2 text-ink">
          <FilePlus size={20} className="text-brand" aria-hidden />
          <h2 className="text-lg font-bold">New report</h2>
        </div>

        <label className="block text-sm font-medium text-ink">
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. May 2026 operations close"
            className="mt-1.5 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-ink">
            Period start
            <input
              type="date"
              required
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Period end
            <input
              type="date"
              required
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm"
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-ink">
          Executive summary
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            placeholder="Headline numbers and narrative for leadership…"
            className="mt-1.5 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm"
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Full report body
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder="Detailed notes, variances, follow-ups…"
            className="mt-1.5 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
            className="rounded border-border"
          />
          Publish immediately (visible in report summary)
        </label>

        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <button
            type="button"
            disabled={pending}
            onClick={() => submit(true)}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
          >
            Save draft
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
          >
            {pending ? "Saving…" : publish ? "Publish report" : "Save report"}
          </button>
        </div>
      </form>
    </div>
  );
}
