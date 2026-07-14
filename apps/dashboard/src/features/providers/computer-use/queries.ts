import { computerUseProviderEvents } from "@/features/providers/computer-use/events";
import { computerUseProvider } from "@/features/providers/computer-use/provider";
import {
  computerUsePrimarySimulationProfile,
  computerUseSimulationProfiles,
} from "@/features/providers/computer-use/simulation";

export function getComputerUseProvider() {
  return computerUseProvider;
}

export function getComputerUseSimulationProfiles() {
  return computerUseSimulationProfiles;
}

export function getPrimaryComputerUseSimulationProfile() {
  return computerUsePrimarySimulationProfile;
}

export function getComputerUseProviderEvents() {
  return computerUseProviderEvents;
}
