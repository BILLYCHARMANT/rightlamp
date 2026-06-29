import { Eye, Pencil, Trash2 } from "lucide-react";

type Props = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  variant?: "default" | "icons" | "segmented";
};

const segmentedBtn =
  "inline-flex h-7 w-7 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const segmentedNeutral =
  "text-slate-500 hover:bg-white hover:text-[var(--dash-teal)]";
const segmentedDanger = "text-red-500 hover:bg-red-50 hover:text-red-600";

export function DashboardTableRowActions({
  onView,
  onEdit,
  onDelete,
  disabled = false,
  showView = true,
  showEdit = true,
  showDelete = true,
  viewLabel = "View",
  editLabel = "Edit",
  deleteLabel = "Delete",
  variant = "default",
}: Props) {
  if (variant === "icons" || variant === "segmented") {
    return (
      <div
        className="inline-flex items-stretch overflow-hidden rounded-md border border-slate-200/90 bg-slate-100/80"
        role="group"
        aria-label="Row actions"
      >
        {showView && onView ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onView}
            className={`${segmentedBtn} ${segmentedNeutral}`}
            aria-label={viewLabel}
            title={viewLabel}
          >
            <Eye size={13} strokeWidth={2} aria-hidden />
          </button>
        ) : null}
        {showEdit && onEdit ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onEdit}
            className={`${segmentedBtn} border-l border-slate-200/90 ${segmentedNeutral}`}
            aria-label={editLabel}
            title={editLabel}
          >
            <Pencil size={13} strokeWidth={2} aria-hidden />
          </button>
        ) : null}
        {showDelete && onDelete ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className={`${segmentedBtn} border-l border-slate-200/90 ${segmentedDanger}`}
            aria-label={deleteLabel}
            title={deleteLabel}
          >
            <Trash2 size={13} strokeWidth={2} aria-hidden />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-nowrap items-center justify-end gap-1.5">
      {showView && onView ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onView}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-ink shadow-sm transition hover:border-brand/30 disabled:opacity-50"
        >
          <Eye size={13} aria-hidden />
          {viewLabel}
        </button>
      ) : null}
      {showEdit && onEdit ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onEdit}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-ink shadow-sm transition hover:border-brand/30 disabled:opacity-50"
        >
          <Pencil size={13} aria-hidden />
          {editLabel}
        </button>
      ) : null}
      {showDelete && onDelete ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-danger/25 bg-white px-2 py-1 text-[11px] font-semibold text-danger shadow-sm transition hover:border-danger/40 disabled:opacity-50"
        >
          <Trash2 size={13} aria-hidden />
          {deleteLabel}
        </button>
      ) : null}
    </div>
  );
}
