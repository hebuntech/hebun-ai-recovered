import { browserProviderEvents } from "@/features/providers/browser/events";
import { browserProvider } from "@/features/providers/browser/provider";
import {
  browserPrimarySimulationProfile,
  browserSimulationProfiles,
} from "@/features/providers/browser/simulation";

export function getBrowserProvider() {
  return browserProvider;
}

export function getBrowserSimulationProfiles() {
  return browserSimulationProfiles;
}

export function getPrimaryBrowserSimulationProfile() {
  return browserPrimarySimulationProfile;
}

export function getBrowserProviderEvents() {
  return browserProviderEvents;
}
