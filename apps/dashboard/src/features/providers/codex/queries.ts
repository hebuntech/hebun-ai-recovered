import { codexProvider } from "@/features/providers/codex/provider";
import {
  codexPrimarySimulationProfile,
  codexSimulationProfiles,
} from "@/features/providers/codex/simulation";
import { codexProviderEvents } from "@/features/providers/codex/events";

export function getCodexProvider() {
  return codexProvider;
}

export function getCodexSimulationProfiles() {
  return codexSimulationProfiles;
}

export function getPrimaryCodexSimulationProfile() {
  return codexPrimarySimulationProfile;
}

export function getCodexProviderEvents() {
  return codexProviderEvents;
}
