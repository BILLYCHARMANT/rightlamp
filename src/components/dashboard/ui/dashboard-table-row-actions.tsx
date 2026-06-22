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
};

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
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {showView && onView ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onView}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink shadow-sm transition hover:border-brand/30 disabled:opacity-50"
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
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink shadow-sm transition hover:border-brand/30 disabled:opacity-50"
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
          className="inline-flex items-center gap-1 rounded-lg border border-danger/25 bg-white px-2.5 py-1.5 text-xs font-semibold text-danger shadow-sm transition hover:border-danger/40 disabled:opacity-50"
        >
          <Trash2 size={13} aria-hidden />
          {deleteLabel}
        </button>
      ) : null}
    </div>
  );
}
