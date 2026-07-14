import { communicationProviderEvents } from "@/features/providers/communication/events";
import { communicationProvider } from "@/features/providers/communication/provider";
import {
  communicationPrimarySimulationProfile,
  communicationSimulationProfiles,
} from "@/features/providers/communication/simulation";

export function getCommunicationProvider() {
  return communicationProvider;
}

export function getCommunicationSimulationProfiles() {
  return communicationSimulationProfiles;
}

export function getPrimaryCommunicationSimulationProfile() {
  return communicationPrimarySimulationProfile;
}

export function getCommunicationProviderEvents() {
  return communicationProviderEvents;
}
