interface PageHeaderProps {
  title: string;
  context?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, context, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-border/70 pb-5 sm:mb-8 sm:gap-5 sm:pb-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
      <div className="min-w-0 max-w-3xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-[2rem] sm:leading-10">
          {title}
        </h1>
        {context && (
          <p className="max-w-2xl text-sm leading-6 text-fg-secondary sm:text-base">
            {context}
          </p>
        )}
      </div>
      {action && (
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3 lg:shrink-0 lg:justify-end">
          {action}
        </div>
      )}
    </div>
  );
}
