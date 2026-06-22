type Props = {
  children: React.ReactNode;
  className?: string;
};

export function DashboardSectionLabel({ children, className = "" }: Props) {
  return (
    <p
      className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground ${className}`}
    >
      {children}
    </p>
  );
}
