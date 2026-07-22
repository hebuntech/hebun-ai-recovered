import type {
  ExecutiveOverview,
  ExecutiveSection,
} from "../director-dashboard-executive-overview";
import type { WidgetRuntimeSnapshot, WidgetRuntimeState } from "../director-dashboard-widget-runtime";
import {
  NAVIGABLE_SECTION_IDS,
  type NavigableSectionId,
  type NavigationTarget,
  type NavigationTargetState,
} from "./types";
import { deepFreeze } from "./validation";

export function isNavigableSection(sectionId: string): sectionId is NavigableSectionId {
  return (NAVIGABLE_SECTION_IDS as readonly string[]).includes(sectionId);
}

/**
 * Whether a section can currently be opened, derived from the canonical widget
 * runtime state. A section without a producer is `unsupported`; a readable one
 * with no records is `empty`; an unreadable one is `unavailable`.
 */
function targetState(section: ExecutiveSection, widget: WidgetRuntimeState | undefined): NavigationTargetState {
  if (!isNavigableSection(section.sectionId)) return "unsupported";
  if (!widget || widget.state === "unavailable" || widget.state === "failed") return "unavailable";
  if (widget.state === "loading") return "unavailable";
  return widget.viewModel && widget.viewModel.items.length > 0 ? "available" : "empty";
}

function targetOf(section: ExecutiveSection, runtime: WidgetRuntimeSnapshot): NavigationTarget {
  const widget = runtime.states[section.widgetId];
  const state = targetState(section, widget);
  const snapshotId = widget?.viewModel?.sourceSnapshotId;
  return {
    sectionId: section.sectionId,
    widgetId: section.widgetId,
    label: section.label,
    health: section.health,
    recordCount: section.recordCount,
    state,
    ...(snapshotId ? { sourceSnapshotId: snapshotId } : {}),
  };
}

/**
 * Navigation targets for every Executive Overview section, in the overview's
 * own priority order so the most severe section is offered first.
 *
 * Derives strictly from the overview and the widget runtime snapshot it was
 * built from — no runtime authority, memory, or control-plane access.
 */
export function createNavigationTargets(input: {
  readonly overview: ExecutiveOverview;
  readonly runtime: WidgetRuntimeSnapshot;
}): readonly NavigationTarget[] {
  return deepFreeze(input.overview.sections.map((section) => targetOf(section, input.runtime)));
}

/** The target for one section, or undefined when the section does not exist. */
export function findNavigationTarget(input: {
  readonly overview: ExecutiveOverview;
  readonly runtime: WidgetRuntimeSnapshot;
  readonly sectionId: string;
}): NavigationTarget | undefined {
  const section = input.overview.sections.find((candidate) => candidate.sectionId === input.sectionId);
  return section ? deepFreeze(targetOf(section, input.runtime)) : undefined;
}
