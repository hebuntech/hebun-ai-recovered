import type { EvaluatorDefinition } from "./types";
import { deepFreeze, validText, validVersion } from "./validation";

export type EvaluatorResolution =
  | { readonly status: "resolved"; readonly evaluator: EvaluatorDefinition }
  | { readonly status: "unknown_evaluator"; readonly evaluatorId: string; readonly version: string }
  | { readonly status: "incompatible"; readonly evaluator: EvaluatorDefinition; readonly datasetVersion: string };

export type EvaluatorRegistration =
  | { readonly status: "registered"; readonly registry: EvaluationRegistry }
  | { readonly status: "duplicate" | "invalid"; readonly evaluatorId: string; readonly version: string };

export class EvaluationRegistry {
  readonly #entries: ReadonlyMap<string, EvaluatorDefinition>;

  constructor(entries: readonly EvaluatorDefinition[]) {
    const resolved = new Map<string, EvaluatorDefinition>();
    for (const entry of entries) {
      if (!validText(entry.evaluatorId) || !validVersion(entry.version) || !validText(entry.owner)) {
        throw new TypeError("Invalid evaluator definition.");
      }
      const key = EvaluationRegistry.key(entry.evaluatorId, entry.version);
      if (resolved.has(key)) throw new TypeError("Duplicate evaluator definition.");
      resolved.set(key, deepFreeze({ ...entry, compatibleDatasetVersions: [...entry.compatibleDatasetVersions] }));
    }
    this.#entries = resolved;
    Object.freeze(this);
  }

  resolve(evaluatorId: string, version: string, datasetVersion: string): EvaluatorResolution {
    const evaluator = this.#entries.get(EvaluationRegistry.key(evaluatorId, version));
    if (!evaluator || evaluator.lifecycle === "retired") {
      return Object.freeze({ status: "unknown_evaluator", evaluatorId, version });
    }
    if (!evaluator.compatibleDatasetVersions.includes(datasetVersion)) {
      return Object.freeze({ status: "incompatible", evaluator, datasetVersion });
    }
    return Object.freeze({ status: "resolved", evaluator });
  }

  list(): readonly EvaluatorDefinition[] {
    return Object.freeze([...this.#entries.values()]);
  }

  register(entry: EvaluatorDefinition): EvaluatorRegistration {
    if (this.#entries.has(EvaluationRegistry.key(entry.evaluatorId, entry.version))) {
      return Object.freeze({ status: "duplicate", evaluatorId: entry.evaluatorId, version: entry.version });
    }
    try {
      return Object.freeze({ status: "registered", registry: new EvaluationRegistry([...this.list(), entry]) });
    } catch {
      return Object.freeze({ status: "invalid", evaluatorId: entry.evaluatorId, version: entry.version });
    }
  }

  private static key(evaluatorId: string, version: string): string {
    return `${evaluatorId}@${version}`;
  }
}
