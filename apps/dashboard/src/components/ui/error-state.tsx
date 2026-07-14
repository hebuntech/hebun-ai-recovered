import { cn } from "@/lib/utils";

interface ErrorStateProps extends React.ComponentProps<"div"> {
  title: string;
  description: string;
  action?: React.ReactNode;
}

function ErrorState({
  action,
  className,
  description,
  title,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col justify-center gap-3 rounded-xl border border-error/30 bg-error-subtle p-5 sm:p-6",
        className
      )}
      role="alert"
      {...props}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-error">
        Error State
      </p>
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

export { ErrorState };
