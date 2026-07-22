import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DirectorCommandCenterPanel } from "../../src/components/director-dashboard/director-command-center-panel";
import {
  CommandAuditEventBuilder,
  CommandEnvelopeBus,
  CommandExecutionEngine,
  createDefaultCommandRegistry,
  createDirectorCommandCenterModel,
  type CommandAuthorityContext,
} from "../../src/features/director-command";
import { createExecutiveOverview } from "../../src/features/director-dashboard-executive-overview";
import { createRecordDetailView, createSectionListView, type RecordDetailView } from "../../src/features/director-dashboard-navigation";
import { healthyRuntime } from "../helpers/director-dashboard-executive-overview";

const registry = createDefaultCommandRegistry();
const authority: CommandAuthorityContext = Object.freeze({
  privilege: "high",
  capabilities: Object.freeze(["observability.reevaluate"] as const),
  approvalGranted: true,
});

function detail(): RecordDetailView {
  const runtime = healthyRuntime();
  const overview = createExecutiveOverview({ runtime, evaluatedAt: new Date("2026-07-22T12:00:00.000Z") });
  const list = createSectionListView({ overview, runtime, sectionId: "monitoring-summary" })!;
  return createRecordDetailView({ overview, runtime, sectionId: "monitoring-summary", recordId: list.rows[0]!.id })!;
}

function model(inputAuthority: CommandAuthorityContext = authority) {
  return createDirectorCommandCenterModel(detail(), {
    registry,
    authority: inputAuthority,
    commandBus: new CommandEnvelopeBus({ now: () => new Date("2026-07-22T12:01:00.000Z"), createCorrelationId: () => "correlation-4b8-001" }),
    executionEngine: new CommandExecutionEngine({ registry }),
    auditBuilder: new CommandAuditEventBuilder({ now: () => new Date("2026-07-22T12:02:00.000Z"), createEventId: () => "audit-4b8-001" }),
  });
}

/** The immutable order is presentation → confirmation → bus → engine → audit. */
function endToEndOrchestration(): void {
  const integrated = model();
  assert.equal(integrated.commands.length, 1);
  const command = integrated.commands[0]!;
  assert.equal(command.presentation.commandId, "monitoring.refresh");
  assert.equal(command.confirmation.commandId, command.presentation.commandId);
  assert.equal(command.executionReadiness, "not_implemented");
  assert.equal(command.executionResult?.status, "not_implemented");
  assert.deepEqual(integrated.auditTimeline.entries.map(({ event }) => event.eventType), ["command_requested", "command_not_implemented"]);
  assert.deepEqual(integrated.auditTimeline.entries.map(({ event }) => event.correlationId), ["correlation-4b8-001", "correlation-4b8-001"]);
}

/** Missing authority is represented safely and never reaches the bus or engine. */
function noAuthorityNoExecution(): void {
  const integrated = model(Object.freeze({ privilege: "baseline", capabilities: Object.freeze([]) as readonly [] }));
  assert.equal(integrated.commands[0]?.executionReadiness, "not_ready");
  assert.equal(integrated.commands[0]?.executionResult, undefined);
  assert.equal(integrated.auditTimeline.entries.length, 0);
}

/** The model and all nested integration views are immutable. */
function immutableContracts(): void {
  const integrated = model();
  assert.equal(Object.isFrozen(integrated), true);
  assert.equal(Object.isFrozen(integrated.commands), true);
  assert.equal(Object.isFrozen(integrated.commands[0]), true);
  assert.equal(Object.isFrozen(integrated.auditTimeline), true);
  assert.throws(() => { (integrated as unknown as { executable: boolean }).executable = true; });
}

/** The presentation exposes metadata only, without controls or handlers. */
function presentationIntegration(): void {
  const markup = renderToStaticMarkup(createElement(DirectorCommandCenterPanel, { model: model() }));
  for (const expected of ["Command Center", "low risk", "not implemented", "Estimated effect", "Rollback", "Confirm Refresh Monitoring", "immutable audit events"]) {
    assert.equal(markup.includes(expected), true, `missing ${expected}`);
  }
  for (const forbidden of ["<button", "<a ", "onclick", "onClick", "dispatch", "href="]) {
    assert.equal(markup.toLowerCase().includes(forbidden.toLowerCase()), false, `must not render ${forbidden}`);
  }
}

/** The orchestration module has no direct runtime or dashboard dependency. */
function boundaryContract(): void {
  const source = readFileSync("src/features/director-command/command-center-orchestration.ts", "utf8");
  for (const forbidden of ["runtime-projection", "memory", "postgres", "provider", "fetch(", "dispatch", "queue", "getDirectorDashboardUiModel", "WidgetRuntime"]) {
    assert.equal(source.includes(forbidden), false, `orchestration must not use ${forbidden}`);
  }
  assert.equal(source.includes("createEnvelope"), true);
  assert.equal(source.includes("executionEngine.execute"), true);
  assert.equal(source.includes("appendCommandAuditEvent"), true);
}

function main(): void {
  endToEndOrchestration();
  noAuthorityNoExecution();
  immutableContracts();
  presentationIntegration();
  boundaryContract();
  console.log("director command center orchestration checks passed");
}

main();
