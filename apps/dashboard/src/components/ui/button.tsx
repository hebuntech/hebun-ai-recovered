import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "success" | "danger";
type ButtonSize = "sm" | "md";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary shadow-xs hover:bg-primary-hover active:bg-primary-press",
  outline:
    "border border-border-strong bg-transparent text-fg hover:bg-surface-raised",
  ghost: "bg-transparent text-fg-secondary hover:bg-surface-raised hover:text-fg",
  success: "bg-success-subtle text-success hover:bg-success/20",
  danger: "bg-error-subtle text-error hover:bg-error/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
};

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border border-transparent px-4 text-sm font-medium whitespace-nowrap",
        "transition-colors duration-(--dur-fast)",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ring",
        "disabled:cursor-not-allowed disabled:pointer-events-none disabled:border-border disabled:bg-surface-sunken disabled:text-fg-muted disabled:shadow-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

export { Button };
