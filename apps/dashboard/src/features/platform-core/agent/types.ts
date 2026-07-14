/*
 * platform-core / agent — declarative runtime-binding contracts (Spec 42).
 *
 * Structural types only. No runtime logic, no provider/tool resolution, no
 * memory/reasoning/learning implementation.
 */
import type { ActorReference } from "../actor";

export interface CapabilityProfile {
  readonly requiredCapabilities?: readonly string[];
  readonly supportedStrategies?: readonly string[];
  readonly performanceTargets?: Readonly<Record<string, unknown>>;
}

export interface ToolEligibility {
  readonly allowedTools?: readonly string[];
  readonly toolProfile?: Readonly<Record<string, unknown>>;
}

export interface ProviderEligibility {
  readonly executionPosture?: "simulation" | "dry-run" | "read-only" | "blocked" | "live";
  readonly preferredProviders?: readonly string[];
  readonly preferredModels?: readonly string[];
  readonly providerProfile?: Readonly<Record<string, unknown>>;
}

export interface ExecutionDefaults {
  readonly defaults?: Readonly<Record<string, unknown>>;
  readonly costLimits?: Readonly<Record<string, unknown>>;
  readonly telemetryProfile?: Readonly<Record<string, unknown>>;
}

export interface AgentMemoryBinding {
  readonly workingMemoryProfile?: Readonly<Record<string, unknown>>;
  readonly longTermMemoryProfile?: Readonly<Record<string, unknown>>;
  readonly memoryNamespaces?: readonly string[];
}

export interface AgentKnowledgeBinding {
  readonly knowledgeProfile?: Readonly<Record<string, unknown>>;
  readonly knowledgeDomains?: readonly string[];
}

export interface AgentReasoningBinding {
  readonly reasoningProfile?: Readonly<Record<string, unknown>>;
  readonly reasoningPreferences?: Readonly<Record<string, unknown>>;
}

export interface AgentLearningBinding {
  readonly learningProfile?: Readonly<Record<string, unknown>>;
  readonly learningPreferences?: Readonly<Record<string, unknown>>;
}

export interface AgentRuntimeProfile {
  readonly agentRef?: ActorReference;
  readonly capabilityProfile?: CapabilityProfile;
  readonly memoryBinding?: AgentMemoryBinding;
  readonly knowledgeBinding?: AgentKnowledgeBinding;
  readonly reasoningBinding?: AgentReasoningBinding;
  readonly learningBinding?: AgentLearningBinding;
  readonly providerEligibility?: ProviderEligibility;
  readonly toolEligibility?: ToolEligibility;
  readonly executionDefaults?: ExecutionDefaults;
  readonly agentProfileVersion?: number;
}
