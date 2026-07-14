/*
 * AI Systems Architect Program progress.
 * Update after each completed module — the sidebar panel reads from here.
 */

export interface ProgramProgress {
  programName: string;
  completedModules: number;
  totalModules: number;
  currentModule: string;
}

export const programProgress: ProgramProgress = {
  programName: "AI Systems Architect",
  // Legal Department completed — 8 modules (2026-07-04)
  completedModules: 61,
  totalModules: 120,
  currentModule: "Platform Architecture Review",
};

export function progressPercent(p: ProgramProgress): number {
  return Math.round((p.completedModules / p.totalModules) * 100);
}
