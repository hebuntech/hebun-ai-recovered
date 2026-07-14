import type { RuntimeProjectionDiagnosticsView } from "./types";
import { runtimeProjectionRegistry } from "./index";

export interface RuntimeProjectionDiagnosticsModel {
  readonly generatedAt: string;
  readonly projections: readonly RuntimeProjectionDiagnosticsView[];
}

export function buildRuntimeProjectionDiagnosticsModel(): RuntimeProjectionDiagnosticsModel {
  return {
    generatedAt: new Date().toISOString(),
    projections: runtimeProjectionRegistry.listDiagnostics(),
  };
}
