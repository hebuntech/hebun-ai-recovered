import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.ComponentProps<"div"> {
  title: string;
  description: string;
  action?: React.ReactNode;
  eyebrow?: string;
  icon?: React.ReactNode;
}

function EmptyState({
  action,
  className,
  description,
  eyebrow,
  icon,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-48 flex-col items-start justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface-sunken p-5 text-left sm:p-6",
        className
      )}
      {...props}
    >
      {icon ? (
        <span className="flex size-11 items-center justify-center rounded-lg bg-primary-subtle text-primary">
          {icon}
        </span>
      ) : null}
      {eyebrow ? (
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-fg-muted">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold leading-6 text-fg text-balance">{title}</h3>
        <p className="max-w-2xl text-sm leading-6 text-fg-secondary text-pretty">
          {description}
        </p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
