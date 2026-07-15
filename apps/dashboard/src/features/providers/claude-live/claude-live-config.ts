import type { CredentialState } from "@/features/runtime-boundary";
import type { ClaudeLiveCapability, ClaudeLiveMode } from "@/features/providers/claude-live/types";

export interface ClaudeLiveConfig {
  defaultMode: ClaudeLiveMode;
  supportedCapabilities: ClaudeLiveCapability[];
  credentialStatus: CredentialState;
  defaultMaxTokens: number;
  defaultTemperature: number;
  simulationFallbackRequired: boolean;
  auditTrailEnabled: boolean;
}

export const claudeLiveConfig: ClaudeLiveConfig = {
  defaultMode: "Dry Run",
  supportedCapabilities: ["summarization"],
  credentialStatus: "Missing",
  defaultMaxTokens: 512,
  defaultTemperature: 0,
  simulationFallbackRequired: true,
  auditTrailEnabled: true,
};
