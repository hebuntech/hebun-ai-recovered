import { claudeProvider } from "@/features/providers/claude/provider";
import { claudeSimulationProfile } from "@/features/providers/claude/simulation";
import { claudeProviderEvents } from "@/features/providers/claude/events";

export function getClaudeProvider() {
  return claudeProvider;
}

export function getClaudeSimulationProfile() {
  return claudeSimulationProfile;
}

export function getClaudeProviderEvents() {
  return claudeProviderEvents;
}
