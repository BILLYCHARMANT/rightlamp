export default function DashboardHomeLoading() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="flex items-center justify-between px-4 py-4 sm:px-8">
        <div className="h-8 w-36 rounded-lg bg-slate-200" />
        <div className="h-9 w-64 rounded-lg bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 px-4 pb-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-12 lg:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-xl bg-slate-200 ${
              i < 3 ? "h-36 lg:col-span-3" : i === 3 ? "h-72 lg:col-span-3 lg:row-span-2" : "h-52 lg:col-span-3"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
