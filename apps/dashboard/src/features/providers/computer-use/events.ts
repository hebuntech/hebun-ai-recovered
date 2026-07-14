import { makeEvent } from "@/features/adapters";
import type { AdapterEvent } from "@/features/adapters";

export const computerUseProviderEvents: AdapterEvent[] = [
  makeEvent(
    "Adapter Registered",
    "computer-use-provider-simulation",
    "Computer Use provider foundation registered in offline simulation mode.",
    "11:05"
  ),
  makeEvent(
    "Adapter Loaded",
    "computer-use-provider-simulation",
    "Computer Use provider contracts loaded from the local Provider Framework.",
    "11:06"
  ),
  makeEvent(
    "Adapter Ready",
    "computer-use-provider-simulation",
    "Computer Use simulation profiles are ready for deterministic desktop-workflow validation.",
    "11:07"
  ),
  makeEvent(
    "Telemetry Updated",
    "computer-use-provider-simulation",
    "Offline Computer Use telemetry refreshed after simulation profile validation.",
    "11:09"
  ),
];
