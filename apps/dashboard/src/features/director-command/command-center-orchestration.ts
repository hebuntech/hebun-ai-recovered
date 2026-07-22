import {
  appendCommandAuditEvent,
  type CommandAuditEventBuilder,
  createCommandAuditTimeline,
  type CommandAuditTimeline,
} from "./command-history-audit";
import { type CommandExecutionEngine, type CommandExecutionResult } from "./command-execution-engine";
import { validateCommandRequest } from "./command-validation";
import type { DirectorCommandRegistry } from "./registry";
import { createRecordCommandView, type CommandPresentation, type RecordCommandView } from "./record-commands";
import type { CommandEnvelopeBus } from "./runtime-command-bus";
import { createCommandConfirmationModel, type CommandConfirmationModel } from "./safety";
import type { CommandAuthorityContext, CommandSafetyMetadata } from "./types";
import type { RecordDetailView } from "../director-dashboard-navigation";
import { deepFreeze } from "./validation";

export interface DirectorCommandCenterCommandModel {
  readonly presentation: CommandPresentation;
  readonly safety: CommandSafetyMetadata;
  readonly confirmation: CommandConfirmationModel;
  readonly executionReadiness: "not_ready" | "accepted" | "blocked" | "rejected" | "not_implemented";
  readonly executionResult?: CommandExecutionResult;
}

export interface DirectorCommandCenterModel {
  readonly record: RecordCommandView;
  readonly commands: readonly DirectorCommandCenterCommandModel[];
  readonly auditTimeline: CommandAuditTimeline;
  readonly executable: false;
  readonly authoritative: false;
}

export interface DirectorCommandCenterDependencies {
  readonly registry: DirectorCommandRegistry;
  readonly authority: CommandAuthorityContext;
  readonly commandBus: CommandEnvelopeBus;
  readonly executionEngine: CommandExecutionEngine;
  readonly auditBuilder: CommandAuditEventBuilder;
}

/**
 * Connects the existing immutable layers in their declared order. It builds no
 * runtime behavior: only an envelope is constructed, the engine is consulted,
 * and immutable audit events are appended to a local value timeline.
 */
export function createDirectorCommandCenterModel(
  detail: RecordDetailView,
  dependencies: DirectorCommandCenterDependencies,
): DirectorCommandCenterModel {
  const record = createRecordCommandView({
    registry: dependencies.registry,
    detail,
    authority: dependencies.authority,
  });
  let auditTimeline = createCommandAuditTimeline();
  const commands = dependencies.registry.listForSection(detail.sectionId).map((definition) => {
    const presentation = record.commands.find((command) => command.commandId === definition.commandId)!;
    const confirmation = createCommandConfirmationModel(definition);
    const validation = validateCommandRequest({
      registry: dependencies.registry,
      request: {
        commandId: definition.commandId,
        version: definition.version,
        targetSectionId: detail.sectionId,
        targetRecordId: detail.recordId,
      },
      authority: dependencies.authority,
    });
    if (validation.status !== "accepted") {
      return {
        presentation,
        safety: { ...definition.safety },
        confirmation,
        executionReadiness: "not_ready" as const,
      };
    }
    const envelope = dependencies.commandBus.createEnvelope({
      validation,
      confirmation,
      authority: dependencies.authority,
      origin: "director-dashboard",
    });
    auditTimeline = appendCommandAuditEvent(auditTimeline, dependencies.auditBuilder.requested(envelope));
    const executionResult = dependencies.executionEngine.execute(envelope);
    auditTimeline = appendCommandAuditEvent(auditTimeline, dependencies.auditBuilder.fromExecutionResult(envelope, executionResult));
    return {
      presentation,
      safety: { ...definition.safety },
      confirmation,
      executionReadiness: executionResult.status,
      executionResult,
    };
  });

  return deepFreeze({
    record,
    commands,
    auditTimeline,
    executable: false as const,
    authoritative: false as const,
  });
}
