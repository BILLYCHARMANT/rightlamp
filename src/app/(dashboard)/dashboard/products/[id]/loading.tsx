export default function DashboardProductDetailLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between gap-3">
        <div className="h-10 w-44 rounded-sm bg-slate-200" />
        <div className="h-10 w-32 rounded-sm bg-slate-200" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="aspect-square rounded-xl bg-slate-200" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded bg-slate-200" />
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="h-24 rounded-xl bg-slate-200" />
        </div>
      </div>
      <div className="h-48 rounded-xl bg-slate-200" />
    </div>
  );
}
