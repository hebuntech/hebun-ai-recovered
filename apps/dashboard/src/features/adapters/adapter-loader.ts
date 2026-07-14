import { canTransition } from "@/features/adapters/adapter-lifecycle";
import type { AdapterLifecycleStage, ExecutionAdapter } from "@/features/adapters/types";

/*
 * Adapter loader — deterministic lifecycle driver. Walks an adapter from
 * Registered → Ready through legal transitions only. No dynamic import, no
 * code execution — the SDK models loading; real providers wire it later.
 */
export interface LoadStep {
  stage: AdapterLifecycleStage;
  ok: boolean;
  note: string;
}

const LOAD_PATH: AdapterLifecycleStage[] = ["Registered", "Loaded", "Initialized", "Ready"];

export function loadSequence(adapter: ExecutionAdapter): LoadStep[] {
  const steps: LoadStep[] = [];
  for (let i = 0; i < LOAD_PATH.length; i += 1) {
    const stage = LOAD_PATH[i];
    const prev = LOAD_PATH[i - 1];
    const ok = i === 0 || canTransition(prev, stage);
    steps.push({
      stage,
      ok,
      note: i === 0 ? `${adapter.metadata.name} registered` : ok ? `Transitioned to ${stage}` : `Illegal transition to ${stage}`,
    });
  }
  return steps;
}
