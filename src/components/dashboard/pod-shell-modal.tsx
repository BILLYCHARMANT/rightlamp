"use client";

import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
};

/**
 * Modal shell aligned with Pod Café POS (fixed overlay, brand header bar,
 * scrollable body, footer action row).
 */
export function PodShellModal({
  isOpen,
  title,
  onClose,
  children,
  footer,
  maxWidthClass = "max-w-2xl",
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex max-h-[90vh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pod-shell-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between rounded-t-xl bg-brand px-6 py-4">
          <h2
            id="pod-shell-modal-title"
            className="text-xl font-bold tracking-tight text-white"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>

        {footer ? (
          <div className="flex shrink-0 gap-3 border-t border-border bg-surface p-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
