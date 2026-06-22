"use client";

type Props = {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export function OrdersProgressCheck({
  checked,
  label,
  disabled = false,
  onChange,
}: Props) {
  return (
    <label className="inline-flex cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 rounded-md border-2 border-slate-300 text-brand accent-brand transition focus:ring-2 focus:ring-brand/25 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={label}
      />
      <span className="sr-only">{label}</span>
    </label>
  );
}
