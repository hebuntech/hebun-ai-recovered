import { makeEvent } from "@/features/adapters";
import type { AdapterEvent } from "@/features/adapters";

export const githubProviderEvents: AdapterEvent[] = [
  makeEvent(
    "Adapter Registered",
    "github-provider-simulation",
    "GitHub provider foundation registered in offline simulation mode.",
    "10:10"
  ),
  makeEvent(
    "Adapter Loaded",
    "github-provider-simulation",
    "GitHub provider contracts loaded from the local Provider Framework.",
    "10:11"
  ),
  makeEvent(
    "Adapter Ready",
    "github-provider-simulation",
    "GitHub simulation profiles are ready for deterministic repository workflow validation.",
    "10:12"
  ),
  makeEvent(
    "Telemetry Updated",
    "github-provider-simulation",
    "Offline GitHub telemetry refreshed after simulation profile validation.",
    "10:14"
  ),
];
