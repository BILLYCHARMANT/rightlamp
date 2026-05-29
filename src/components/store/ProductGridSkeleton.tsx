export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-border bg-surface-elevated"
        >
          <div className="aspect-[4/3] bg-surface" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-4/5 rounded-md bg-surface" />
            <div className="h-4 w-full rounded-md bg-surface" />
            <div className="flex justify-between border-t border-border pt-4">
              <div className="h-5 w-16 rounded bg-surface" />
              <div className="h-9 w-16 rounded-full bg-surface" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
