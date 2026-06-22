export default function StoreLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 animate-pulse px-4 py-10 sm:px-6">
      <div className="mx-auto h-10 w-64 rounded-lg bg-slate-200" />
      <div className="mx-auto mt-4 h-5 w-96 max-w-full rounded bg-slate-200" />
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="aspect-[4/3] bg-slate-200" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
