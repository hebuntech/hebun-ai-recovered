/*
 * core-theme.ts — token-driven accent map for the four cores (+ signal/director).
 * Uses design-token color utilities only (no raw hex). Opacity modifiers
 * resolve against the theme colors defined in tokens.css / globals.css.
 */

import type { CoreId } from "@/features/architecture/mock";

export type FlowKind = CoreId | "signal" | "director";

export interface CoreTheme {
  text: string;
  bg: string;
  dot: string;
  border: string;
}

export const coreTheme: Record<FlowKind, CoreTheme> = {
  cognitive: { text: "text-primary", bg: "bg-primary/12", dot: "bg-primary", border: "border-primary/40" },
  execution: { text: "text-accent", bg: "bg-accent/12", dot: "bg-accent", border: "border-accent/40" },
  intelligence: { text: "text-highlight", bg: "bg-highlight/12", dot: "bg-highlight", border: "border-highlight/40" },
  governance: { text: "text-info", bg: "bg-info/12", dot: "bg-info", border: "border-info/40" },
  signal: { text: "text-fg-secondary", bg: "bg-surface-sunken", dot: "bg-fg-muted", border: "border-border-strong" },
  director: { text: "text-success", bg: "bg-success/12", dot: "bg-success", border: "border-success/40" },
};
