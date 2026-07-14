import { programProgress, progressPercent } from "@/config/program-progress";

export function ProgramProgress() {
  const percent = progressPercent(programProgress);

  return (
    <div className="rounded-md border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
        {programProgress.programName}
      </p>

      <div className="mt-3 flex flex-col gap-2 text-xs">
        <div className="flex items-baseline justify-between gap-2">
          <span className="shrink-0 text-fg-secondary">Completed</span>
          <span className="font-semibold tabular-nums text-fg">
            {programProgress.completedModules} / {programProgress.totalModules}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="shrink-0 text-fg-secondary">Current</span>
          <span
            className="min-w-0 truncate font-semibold text-fg"
            title={programProgress.currentModule}
          >
            {programProgress.currentModule}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
          <div
            className="h-full rounded-full bg-(image:--gradient-primary)"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs font-semibold tabular-nums text-fg">
          {percent}%
        </span>
      </div>
    </div>
  );
}
