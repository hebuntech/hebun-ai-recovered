import { cn } from "@/lib/utils";

type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border border-border bg-surface-raised text-fg-secondary",
  primary: "bg-primary-subtle text-primary",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  error: "bg-error-subtle text-error",
  info: "bg-info-subtle text-info",
};

interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em]",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, type BadgeVariant };
