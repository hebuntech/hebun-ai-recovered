import { githubProvider } from "@/features/providers/github/provider";
import {
  githubPrimarySimulationProfile,
  githubSimulationProfiles,
} from "@/features/providers/github/simulation";
import { githubProviderEvents } from "@/features/providers/github/events";

export function getGitHubProvider() {
  return githubProvider;
}

export function getGitHubSimulationProfiles() {
  return githubSimulationProfiles;
}

export function getPrimaryGitHubSimulationProfile() {
  return githubPrimarySimulationProfile;
}

export function getGitHubProviderEvents() {
  return githubProviderEvents;
}
