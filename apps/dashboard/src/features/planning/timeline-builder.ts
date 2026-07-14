import type { PlanTask, PlanningTimelineItem } from "@/features/planning/types";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysFromDuration(value: string) {
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

export function buildTimeline(tasks: PlanTask[], createdAt: string): PlanningTimelineItem[] {
  const base = new Date(createdAt);
  const firstTask = tasks[0];
  const lastTask = tasks[tasks.length - 1];
  const firstDuration = daysFromDuration(firstTask.estimatedDuration);
  const firstEnd = addDays(base, firstDuration);

  return tasks.map((task, index) => {
    const duration = daysFromDuration(task.estimatedDuration);
    let start = base;

    if (index === 0) {
      start = base;
    } else if (task.id === lastTask.id) {
      const longestParallel = Math.max(
        ...tasks.slice(1, -1).map((candidate) => daysFromDuration(candidate.estimatedDuration))
      );
      start = addDays(firstEnd, longestParallel);
    } else {
      start = firstEnd;
    }

    const end = addDays(start, duration);

    return {
      id: `${task.id}-timeline`,
      taskId: task.id,
      title: task.title,
      startDate: formatDate(start),
      endDate: formatDate(end),
      sequence: index + 1,
    };
  });
}
