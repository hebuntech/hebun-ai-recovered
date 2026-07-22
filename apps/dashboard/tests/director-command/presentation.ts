import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RecordCommandPanel } from "../../src/components/director-dashboard/record-command-panel";
import { RecordDetailPanel } from "../../src/components/director-dashboard/record-detail-view";
import { DashboardFoundation } from "../../src/components/director-dashboard/dashboard-foundation";
import { getDirectorDashboardUiModel } from "../../src/features/director-dashboard-ui/adapter.server";
import { createExecutiveOverview } from "../../src/features/director-dashboard-executive-overview";
import {
  createRecordDetailView,
  createSectionListView,
  type RecordDetailView,
} from "../../src/features/director-dashboard-navigation";
import {
  createDefaultCommandRegistry,
  createRecordCommandView,
  UNRESOLVED_COMMAND_AUTHORITY,
  type CommandAuthorityContext,
  type RecordCommandView,
} from "../../src/features/director-command";
import { healthyRuntime, readyState } from "../helpers/director-dashboard-executive-overview";

const PANEL = "src/components/director-dashboard/record-command-panel.tsx";
const DETAIL = "src/components/director-dashboard/record-detail-view.tsx";
const registry = createDefaultCommandRegistry();
const evaluatedAt = new Date("2026-07-21T12:01:00.000Z");
const ALL = ["agent.lifecycle", "workflow.lifecycle", "workflow.recovery", "observability.reevaluate"] as const;

function detailFor(sectionId: string, runtime = healthyRuntime()): RecordDetailView {
  const overview = createExecutiveOverview({ runtime, evaluatedAt });
  const list = createSectionListView({ overview, runtime, sectionId })!;
  return createRecordDetailView({ overview, runtime, sectionId, recordId: list.rows[0]!.id })!;
}

function viewFor(sectionId: string, authority: CommandAuthorityContext = UNRESOLVED_COMMAND_AUTHORITY, runtime = healthyRuntime()): RecordCommandView {
  return createRecordCommandView({ registry, detail: detailFor(sectionId, runtime), authority });
}

const render = (view: RecordCommandView) => renderToStaticMarkup(createElement(RecordCommandPanel, { view }));
const text = (markup: string) => markup.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/** Every declared command renders with its full metadata. */
function rendersEveryCommand(): void {
  const markup = render(viewFor("active-workflows"));
  const body = text(markup);
  assert.equal(body.includes("Commands"), true);
  assert.equal(body.includes("3 declared"), true);
  for (const label of ["Retry Workflow", "Pause Workflow", "Resume Workflow"]) {
    assert.equal(body.includes(label), true, `missing ${label}`);
  }
  for (const field of ["Category", "Required capability", "Required privilege", "Approval required"]) {
    assert.equal(body.includes(field), true, `missing ${field}`);
  }
  assert.equal(body.includes("workflow.recovery"), true);
  assert.equal(body.includes("recovery"), true);
  assert.equal(body.includes("high"), true);
}

/** Availability state is rendered as readable text, not colour alone. */
function rendersAvailabilityStates(): void {
  const unresolved = text(render(viewFor("active-workflows")));
  assert.equal(unresolved.includes("Permission required"), true);

  const authorized = text(render(viewFor("active-workflows", { privilege: "high", capabilities: ALL, approvalGranted: true })));
  assert.equal(authorized.includes("Available"), true);
  assert.equal(authorized.includes("Permission required"), false);
}

/** Approval requirement renders for each command, and drives its own state. */
function rendersApproval(): void {
  const noApproval = text(render(viewFor("active-workflows", { privilege: "high", capabilities: ALL })));
  assert.equal(noApproval.includes("Approval required"), true);
  assert.equal(noApproval.includes("A governance approval must clear first."), true);
  // Resume needs no approval and is available without one.
  assert.equal(noApproval.includes("Available"), true);
  // Yes/No is rendered per command.
  assert.equal(noApproval.includes("Yes"), true);
  assert.equal(noApproval.includes("No"), true);
}

/** A disabled command explains itself. */
function rendersDisabled(): void {
  const runtime = healthyRuntime({
    "active-agents": readyState("active-agents", [{ id: "agent-1", label: "Agent", value: "org-1" }]),
  });
  const view = viewFor("active-agents", UNRESOLVED_COMMAND_AUTHORITY, runtime);
  assert.equal(view.commands[0]?.availability, "disabled");
  const body = text(render(view));
  assert.equal(body.includes("Disabled"), true);
  assert.equal(body.includes("This record reports no status"), true);
}

/** Sections without commands render a concise informational state. */
function rendersUnsupportedSections(): void {
  for (const sectionId of ["platform-status", "runtime-status"]) {
    const view = viewFor(sectionId);
    assert.equal(view.state, "unsupported");
    const body = text(render(view));
    assert.equal(body.includes("None declared"), true);
    assert.equal(body.includes("No commands are declared for"), true);
    // No command rows, and no misleading availability wording.
    for (const forbidden of ["Available", "Permission required", "Approval required", "Required capability"]) {
      assert.equal(body.includes(forbidden), false, `unsupported panel must not show ${forbidden}`);
    }
  }
}

/** The panel is inert: no interactive element of any kind. */
function rendersNoInteractiveElement(): void {
  for (const sectionId of ["active-workflows", "active-agents", "platform-status"]) {
    const markup = render(viewFor(sectionId));
    for (const forbidden of [
      "<button", "<a ", "<input", "<select", "<textarea", "<form",
      "onclick", "onclick=", "onsubmit", "onkeydown", "onmouseover",
      "tabindex", 'role="button"', 'role="link"', 'role="menuitem"', "href=",
    ]) {
      assert.equal(markup.toLowerCase().includes(forbidden.toLowerCase()), false,
        `${sectionId} panel must not render ${forbidden}`);
    }
  }
}

/** The panel source carries no handler or execution path. */
function panelSourceHasNoExecutionPath(): void {
  const source = readFileSync(PANEL, "utf8");
  for (const forbidden of [
    "onClick", "onSubmit", "onKeyDown", "onKeyUp", "onMouseDown", "onPointerDown",
    "useState", "useEffect", "fetch(", "dispatch", "execute", "Button", "Link",
    "\"use client\"",
  ]) {
    assert.equal(source.includes(forbidden), false, `panel must not use ${forbidden}`);
  }
  // It is a server-renderable presentational component only.
  assert.equal(source.includes("export function RecordCommandPanel"), true);
}

/** Accessibility: the panel is a labelled section with a real heading. */
function isAccessible(): void {
  const view = viewFor("active-workflows");
  const markup = render(view);
  assert.equal(markup.includes("<section"), true);
  assert.equal(markup.includes("aria-labelledby="), true);
  const headingId = `commands-${view.sectionId}-${view.recordId}`;
  assert.equal(markup.includes(`aria-labelledby="${headingId}"`), true);
  assert.equal(markup.includes(`id="${headingId}"`), true);
  assert.equal(markup.includes("<h3"), true);
  // Metadata uses description-list semantics, not bare divs.
  assert.equal(markup.includes("<dl"), true);
  assert.equal(markup.includes("<dt"), true);
  assert.equal(markup.includes("<dd"), true);
  // State is conveyed in text, so it does not depend on colour alone.
  assert.equal(text(markup).includes("Permission required"), true);
}

/** The presentation model is not mutated by rendering. */
function renderingDoesNotMutate(): void {
  const view = viewFor("active-workflows");
  const before = JSON.stringify(view);
  render(view);
  render(view);
  assert.equal(JSON.stringify(view), before);
  assert.equal(Object.isFrozen(view), true);
  assert.equal(Object.isFrozen(view.commands[0]), true);
}

/** The detail view renders the panel, and stays valid without it. */
function detailIntegration(): void {
  const detail = detailFor("active-workflows");
  const commands = createRecordCommandView({ registry, detail, authority: UNRESOLVED_COMMAND_AUTHORITY });
  const withPanel = renderToStaticMarkup(createElement(RecordDetailPanel, {
    detail, commands, onBackToList: () => {}, onBackToDashboard: () => {},
  }));
  assert.equal(withPanel.includes("Commands"), true);
  assert.equal(withPanel.includes("Retry Workflow"), true);
  // The existing detail content is untouched.
  for (const field of ["Record ID", "Category", "Description", "Workflow ID", "Back to"]) {
    assert.equal(withPanel.includes(field), true, `missing ${field}`);
  }

  const withoutPanel = renderToStaticMarkup(createElement(RecordDetailPanel, {
    detail, onBackToList: () => {}, onBackToDashboard: () => {},
  }));
  assert.equal(withoutPanel.includes("Retry Workflow"), false, "the panel is optional");
  assert.equal(withoutPanel.includes("Record ID"), true);
}

/** Public contracts are unchanged and no route or contract was modified. */
function noPublicContractRegression(): void {
  const model = getDirectorDashboardUiModel();
  for (const key of ["snapshot", "widgets", "overview", "insights"]) {
    assert.equal(key in model, true, `DirectorDashboardUiModel.${key} must remain`);
  }
  assert.equal("commands" in model, false, "the dashboard model must not gain a commands field");
  const markup = renderToStaticMarkup(createElement(DashboardFoundation, { widgetRuntime: model }));
  for (const title of ["Director Dashboard", "Executive Overview", "Executive Insights", "Refresh"]) {
    assert.equal(markup.includes(title), true, `missing ${title}`);
  }
  // Nothing is drilled into on first render, so no command panel appears.
  assert.equal(markup.includes("Required capability"), false);

  const navigationTypes = readFileSync("src/features/director-dashboard-navigation/types.ts", "utf8");
  assert.equal(navigationTypes.includes("commands"), false, "RecordDetailView must not gain a commands field");
  const dataTypes = readFileSync("src/features/director-dashboard-data/types.ts", "utf8");
  assert.equal(dataTypes.includes("readonly authoritative: false;"), true);
  // The detail panel takes commands as a prop; it never derives them itself.
  const detailSource = readFileSync(DETAIL, "utf8");
  assert.equal(detailSource.includes("createRecordCommandView"), false);
  assert.equal(detailSource.includes("createDefaultCommandRegistry"), false);
}

/** The dashboard presents no authority, so nothing reads as runnable. */
function presentsNoAuthority(): void {
  assert.deepEqual(UNRESOLVED_COMMAND_AUTHORITY.capabilities, []);
  assert.equal(UNRESOLVED_COMMAND_AUTHORITY.privilege, "baseline");
  assert.equal(UNRESOLVED_COMMAND_AUTHORITY.approvalGranted, undefined);
  assert.equal(Object.isFrozen(UNRESOLVED_COMMAND_AUTHORITY), true);
  for (const sectionId of ["active-agents", "active-workflows", "diagnostics-summary", "monitoring-summary"]) {
    for (const command of viewFor(sectionId).commands) {
      assert.notEqual(command.availability, "available",
        "no command may read as available while no authority is established");
    }
  }
  const board = readFileSync("src/components/director-dashboard/widget-runtime-board.tsx", "utf8");
  assert.equal(board.includes("UNRESOLVED_COMMAND_AUTHORITY"), true);
}

function main(): void {
  rendersEveryCommand();
  rendersAvailabilityStates();
  rendersApproval();
  rendersDisabled();
  rendersUnsupportedSections();
  rendersNoInteractiveElement();
  panelSourceHasNoExecutionPath();
  isAccessible();
  renderingDoesNotMutate();
  detailIntegration();
  noPublicContractRegression();
  presentsNoAuthority();
  console.log("director command presentation checks passed");
}

main();
