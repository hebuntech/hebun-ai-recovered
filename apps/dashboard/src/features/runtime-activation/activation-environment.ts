import type { RuntimeDecision } from "@/features/runtime-boundary";
import type { ActivationEnvironment } from "@/features/runtime-activation/types";

export function assessActivationEnvironment(runtimeDecision: RuntimeDecision): ActivationEnvironment {
  if (runtimeDecision.runtimeMode === "Simulation") {
    return { status: "Simulation", ready: true, note: "Simulation mode remains fully available." };
  }
  if (!runtimeDecision.environment.ready) {
    return { status: "Offline", ready: false, note: runtimeDecision.environment.note };
  }
  if (runtimeDecision.runtimeMode === "Future Live") {
    return {
      status: "Staging",
      ready: false,
      note: "Future live requests are staged for readiness review but live activation remains disabled.",
    };
  }
  if (runtimeDecision.runtimeMode === "Read Only") {
    return { status: "Development", ready: true, note: "Read-only operation is constrained to deterministic environments." };
  }
  return { status: "Offline", ready: true, note: "Offline deterministic runtime environment is available." };
}
