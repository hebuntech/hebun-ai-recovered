export { UNRESOLVED_COMMAND_AUTHORITY } from "./authority";
export { RUNTIME_APPROVAL_DECISIONS, RUNTIME_APPROVAL_STATUSES, RUNTIME_HUMAN_APPROVAL_ERROR_CODES, RUNTIME_HUMAN_APPROVAL_VERSION, createRuntimeHumanApproval, validateRuntimeHumanApproval, validateRuntimeHumanApprovalResult, type RuntimeApprovalActor, type RuntimeApprovalDecision, type RuntimeApprovalEvidence, type RuntimeApprovalMetadata, type RuntimeApprovalRecord, type RuntimeApprovalTimestamp, type RuntimeApprovalValidation, type RuntimeApprovalValidationError, type RuntimeApprovalValidationResult, type RuntimeApprovalVersion, type RuntimeHumanApproval } from "./runtime-human-approval";
export { RUNTIME_APPROVAL_CONSTRAINTS, RUNTIME_APPROVAL_MODES, RUNTIME_BLAST_RADII, RUNTIME_DATA_SENSITIVITIES, RUNTIME_IMPACT_SCOPES, RUNTIME_REVERSIBILITY, RUNTIME_RISK_DOMAINS, RUNTIME_RISK_ERROR_CODES, RUNTIME_RISK_LEVELS, RUNTIME_RISK_VERSION, RUNTIME_SIDE_EFFECT_PROFILES, createRuntimeRiskClassification, validateRuntimeRiskClassification, validateRuntimeRiskClassificationResult, type RuntimeApprovalConstraint, type RuntimeApprovalMode, type RuntimeApprovalQuorum, type RuntimeApprovalRequirement, type RuntimeApprovalRoleRequirement, type RuntimeBlastRadius, type RuntimeDataSensitivity, type RuntimeImpactScope, type RuntimeReversibility, type RuntimeRiskClassification, type RuntimeRiskDomain, type RuntimeRiskFactor, type RuntimeRiskLevel, type RuntimeRiskMetadata, type RuntimeRiskProfile, type RuntimeRiskValidation, type RuntimeRiskValidationError, type RuntimeRiskValidationResult, type RuntimeRiskVersion, type RuntimeSideEffectProfile } from "./runtime-risk-classification";
export { RUNTIME_POLICY_EFFECTS, RUNTIME_POLICY_ERROR_CODES, RUNTIME_POLICY_VERSION, createRuntimePolicy, validateRuntimePolicy, validateRuntimePolicyResult, type Policy, type PolicyAction, type PolicyCondition, type PolicyEnvironment, type PolicyMetadata, type PolicyObligation, type PolicyResource, type PolicySubject, type PolicyValidation, type PolicyValidationResult, type PolicyVersion } from "./runtime-policy";
export { RUNTIME_AUTHORITY_IDENTITY_ERROR_CODES, RUNTIME_AUTHORITY_IDENTITY_VERSION, RUNTIME_AUTHORITY_PRINCIPAL_TYPES, bindAuthorityIdentityChain, createAuthorityIdentityChain, validateAuthorityIdentityChain, type AuthorityAgentIdentity, type AuthorityDelegation, type AuthorityExecutionIdentityBinding, type AuthorityIdentityBindingResult, type AuthorityIdentityChain, type AuthorityPrincipal, type AuthoritySubject, type AuthorityTenant, type AuthorityWorkspace, type IdentityBindingValidation } from "./runtime-authority-identity";
export { RUNTIME_AUTHORITY_ERROR_CODES, RUNTIME_AUTHORITY_REASON_CODES, RUNTIME_AUTHORITY_STATUSES, RUNTIME_AUTHORITY_VERSION, createRuntimeAuthorityRequest, validateRuntimeAuthorityRequest, type RuntimeAuthorityAction, type RuntimeAuthorityContext, type RuntimeAuthorityDecision, type RuntimeAuthorityRequest, type RuntimeAuthorityResource, type RuntimeAuthoritySubject, type RuntimeAuthorityValidation } from "./runtime-authority";
export { RUNTIME_EXECUTION_INTEGRATION_VERSION, RUNTIME_INTEGRATION_ERROR_CODES, RUNTIME_INTEGRATION_GATES, RUNTIME_INTEGRATION_STAGES, createRuntimeExecutionIntegrationInput, integrateRuntimeExecution, type RuntimeExecutionIntegrationInput, type RuntimeExecutionIntegrationResult } from "./runtime-execution-integration";
export { RUNTIME_COMPENSATION_STRATEGIES, RUNTIME_FAILURE_CLASSIFICATIONS, RUNTIME_RECOVERY_ELIGIBILITY, RUNTIME_RECOVERY_ERROR_CODES, RUNTIME_RECOVERY_READINESS, RUNTIME_RECOVERY_STRATEGIES, RUNTIME_TERMINALITY, createRuntimeRecoveryPlan, validateRuntimeRecoveryPlan, type RuntimeRecoveryPlan, type RuntimeRecoveryValidation } from "./runtime-recovery";
export { RUNTIME_EXECUTION_OUTCOMES, RUNTIME_OUTCOME_ERROR_CODES, RUNTIME_PROJECTION_TARGETS, RUNTIME_RESULT_CLASSIFICATIONS, createRuntimeOutcomeProjection, validateRuntimeOutcomeProjection, type RuntimeOutcomeProjection } from "./runtime-outcome";
export { RUNTIME_CANCELLATION_POLICIES, RUNTIME_EXECUTION_READINESS_STATES, RUNTIME_ROLLBACK_CLASSIFICATIONS, RUNTIME_SAFETY_CLASSIFICATIONS, RUNTIME_SAFETY_ERROR_CODES, RUNTIME_TIMEOUT_CLASSES, createRuntimeSafetyPolicy, validateRuntimeSafetyPolicy, type RuntimeSafetyClassification, type RuntimeSafetyPolicy, type RuntimeSafetyValidation } from "./runtime-safety";
export {
  RUNTIME_CONCURRENCY_SCOPES, RUNTIME_CONFLICT_CLASSIFICATIONS, RUNTIME_FRESHNESS_CLASSIFICATIONS,
  RUNTIME_IDEMPOTENCY_ERROR_CODES, RUNTIME_REPLAY_CLASSIFICATIONS,
  createRuntimeExecutionIdentity, createRuntimeIdempotencyIdentity, validateRuntimeExecutionReadiness,
  type RuntimeConcurrencyScope, type RuntimeConflictClassification, type RuntimeExecutionIdentity,
  type RuntimeExecutionLease, type RuntimeExecutionReadiness, type RuntimeFreshnessClassification,
  type RuntimeIdempotencyError, type RuntimeIdempotencyErrorCode, type RuntimeIdempotencyIdentity,
  type RuntimeReplayClassification,
} from "./runtime-idempotency";
export {
  RUNTIME_ADAPTER_AVAILABILITY_STATES,
  RUNTIME_ADAPTER_DESCRIPTORS,
  RUNTIME_ADAPTER_ERROR_CODES,
  createRuntimeAdapterConstructionPlan,
  type RuntimeAdapterAvailability,
  type RuntimeAdapterConstructionPlan,
  type RuntimeAdapterDescriptor,
  type RuntimeAdapterError,
  type RuntimeAdapterErrorCode,
  type RuntimeAdapterSelectionResult,
} from "./runtime-adapter-framework";
export { RuntimeAdapterRegistry } from "./runtime-adapter-registry";
export { selectRuntimeAdapter } from "./runtime-adapter-selection";
export {
  RUNTIME_TARGET_RESOLUTION_ERROR_CODES,
  RUNTIME_TARGET_RESOLUTION_MAPPING,
  RUNTIME_TARGET_RESOLUTION_SOURCES,
  RUNTIME_TARGET_RESOLUTION_VERSION,
  createRuntimeTargetResolutionError,
  unresolvedRuntimeTargetResolution,
  type CanonicalRuntimeTarget,
  type RuntimeTargetResolutionError,
  type RuntimeTargetResolutionErrorCode,
  type RuntimeTargetResolutionInput,
  type RuntimeTargetResolutionMapping,
  type RuntimeTargetResolutionResult,
  type RuntimeTargetResolutionSource,
} from "./runtime-target-resolution";
export { RuntimeTargetResolver } from "./runtime-target-resolver";
export {
  validateRuntimeTargetResolutionRequest,
  validateRuntimeTargetResolutionResult,
  type RuntimeTargetResolutionValidation,
} from "./runtime-target-resolution-validator";
export {
  RUNTIME_ADAPTER_FAMILIES,
  RUNTIME_EXECUTION_ARCHITECTURE,
  RUNTIME_EXECUTION_ERROR_CODES,
  RUNTIME_EXECUTION_LIFECYCLE_STATES,
  RUNTIME_TARGET_KINDS,
  UNRESOLVED_RUNTIME_EXECUTION_AUTHORITY,
  createRuntimeExecutionAdapterResult,
  type RuntimeAdapterFamily,
  type RuntimeExecutionAdapter,
  type RuntimeExecutionAdapterResult,
  type RuntimeExecutionArchitecture,
  type RuntimeExecutionAuthority,
  type RuntimeExecutionContext,
  type RuntimeExecutionError,
  type RuntimeExecutionErrorCode,
  type RuntimeExecutionLifecycleState,
  type RuntimeExecutionPolicy,
  type RuntimeExecutionRequest,
  type RuntimeTargetDescriptor,
  type RuntimeTargetKind,
} from "./runtime-execution-contracts";
export { RuntimeExecutionGateway } from "./runtime-execution-gateway";
export {
  createRuntimeExecutionRequest,
  validateRuntimeExecutionArchitecture,
  type RuntimeExecutionArchitectureValidation,
} from "./runtime-execution-validator";
export {
  createDirectorCommandCenterModel,
  type DirectorCommandCenterCommandModel,
  type DirectorCommandCenterDependencies,
  type DirectorCommandCenterModel,
} from "./command-center-orchestration";
export {
  appendCommandAuditEvent,
  COMMAND_AUDIT_EVENT_TYPES,
  CommandAuditEventBuilder,
  createCommandAuditTimeline,
  serializeCommandAuditTimeline,
  type CommandAuditEvent,
  type CommandAuditEventBuilderDependencies,
  type CommandAuditEventType,
  type CommandAuditExecutionResult,
  type CommandAuditTimeline,
  type CommandHistoryEntry,
} from "./command-history-audit";
export {
  COMMAND_EXECUTION_ERROR_CODES,
  CommandExecutionEngine,
  NOT_IMPLEMENTED_COMMAND_EXECUTION_ADAPTER,
  type CommandExecutionAdapter,
  type CommandExecutionAdapterResult,
  type CommandExecutionError,
  type CommandExecutionErrorCode,
  type CommandExecutionResult,
} from "./command-execution-engine";
export { validateCommandRequest } from "./command-validation";
export { COMMAND_DEFINITION_VERSION, DIRECTOR_COMMAND_DEFINITIONS } from "./definitions";
export {
  evaluateCommandPermission,
  satisfiesPrivilege,
  type PermissionDecision,
} from "./permissions";
export {
  COMMAND_AVAILABILITY_STATES,
  COMMAND_DISABLED_REASONS,
  createRecordCommandView,
  type CommandAvailabilityState,
  type CommandDisabledReason,
  type CommandPresentation,
  type RecordCommandView,
} from "./record-commands";
export {
  createDefaultCommandRegistry,
  DirectorCommandRegistry,
  type CommandResolution,
} from "./registry";
export {
  COMMAND_REQUEST_ORIGINS,
  CommandEnvelopeBus,
  serializeRuntimeCommandEnvelope,
  type CommandRequestOrigin,
  type RuntimeCommandBusDependencies,
  type RuntimeCommandBusRequest,
  type RuntimeCommandEnvelope,
  type RuntimeCommandEnvelopeMetadata,
} from "./runtime-command-bus";
export {
  createCommandConfirmationModel,
  type CommandConfirmationModel,
} from "./safety";
export {
  COMMAND_CAPABILITIES,
  COMMAND_CATEGORIES,
  COMMAND_PRIVILEGES,
  COMMAND_REJECTION_CODES,
  COMMAND_RISK_LEVELS,
  COMMAND_ROLLBACK_AVAILABILITY,
  COMMAND_SAFETY_CATEGORIES,
  COMMAND_SAFETY_RISK_LEVELS,
  COMMAND_SYSTEM_IMPACTS,
  COMMAND_USER_IMPACTS,
  DIRECTOR_COMMAND_IDS,
  type CommandAuthorityContext,
  type CommandCapability,
  type CommandCategory,
  type CommandPermission,
  type CommandPrivilege,
  type CommandRejectionCode,
  type CommandRequest,
  type CommandRiskLevel,
  type CommandRollbackAvailability,
  type CommandSafetyCategory,
  type CommandSafetyMetadata,
  type CommandSafetyRiskLevel,
  type CommandSystemImpact,
  type CommandUserImpact,
  type CommandValidationResult,
  type DirectorCommandDefinition,
  type DirectorCommandId,
} from "./types";
