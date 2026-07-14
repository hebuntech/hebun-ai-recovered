import { cn } from "@/lib/utils";

interface LoadingStateProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
}

function LoadingState({
  className,
  description = "We’re preparing the latest dashboard state.",
  title = "Loading",
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col justify-center gap-3 rounded-xl border border-border bg-surface p-5 sm:p-6",
        className
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      <div className="flex items-center gap-3">
        <span
          className="size-3 rounded-full bg-primary shadow-glow motion-safe:animate-pulse"
          aria-hidden="true"
        />
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-fg-muted">
          {title}
        </p>
      </div>
      <p className="max-w-2xl text-sm leading-6 text-fg-secondary text-pretty">{description}</p>
    </div>
  );
}

export { LoadingState };
