import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionShellProps {
  title: string;
  description: string;
  eyebrow?: string;
  href?: string;
  ctaLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionShell({
  title,
  description,
  eyebrow,
  href,
  ctaLabel = "Open",
  children,
  className,
}: SectionShellProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-fg-muted">
              {eyebrow}
            </p>
          ) : null}
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-medium text-fg-secondary transition hover:text-fg"
          >
            {ctaLabel}
            <ChevronRight className="size-4" />
          </Link>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
