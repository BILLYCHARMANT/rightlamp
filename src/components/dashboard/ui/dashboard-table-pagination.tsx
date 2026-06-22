type Props = {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  itemLabel?: string;
  extra?: string;
  onPage: (page: number) => void;
};

export function DashboardTablePagination({
  page,
  pages,
  total,
  pageSize,
  itemLabel = "rows",
  extra,
  onPage,
}: Props) {
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-6 py-4 text-xs text-slate-500">
      <span>
        {total > 0 ? (
          <>
            Showing{" "}
            <span className="font-bold text-slate-800">
              {from}–{to}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-800">{total}</span> {itemLabel}
            <span className="text-slate-400"> · </span>
            {pageSize} per screen
          </>
        ) : (
          <>No {itemLabel}</>
        )}
        <span className="text-slate-400"> · </span>
        Page {page + 1} of {pages}
        {extra ?? ""}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPage(page - 1)}
          className="rounded-sm border border-slate-200 bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= pages - 1}
          onClick={() => onPage(page + 1)}
          className="rounded-sm border border-slate-200 bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
