/*
 * Command History — in-memory, per-session.
 *
 * Every dispatched command is recorded here. Supports ordering and filtering by
 * status, command type, actor and source. No persistence, no backend.
 */

import type { Command, CommandStatus, CommandSource } from "./types";
import type { CommandType } from "./pipeline";

const history: Command[] = [];

export interface HistoryFilter {
  status?: CommandStatus;
  commandType?: CommandType;
  actor?: string;
  source?: CommandSource;
  order?: "newest" | "oldest";
}

export function recordCommand(command: Command): void {
  history.unshift(command);
}

export function getHistory(filter: HistoryFilter = {}): Command[] {
  let list = history.filter((c) => {
    if (filter.status && c.status !== filter.status) return false;
    if (filter.commandType && c.commandType !== filter.commandType) return false;
    if (filter.actor && c.actor !== filter.actor) return false;
    if (filter.source && c.source !== filter.source) return false;
    return true;
  });
  if (filter.order === "oldest") list = [...list].reverse();
  return list;
}

export function getHistoryCount(): number {
  return history.length;
}

export function clearHistory(): void {
  history.length = 0;
}
