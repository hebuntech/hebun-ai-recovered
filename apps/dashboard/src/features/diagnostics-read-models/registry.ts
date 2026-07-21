import type { ReadModelRegistryEntry } from "./types";

function validText(value: string): boolean {
  return Boolean(value.trim()) && value.length <= 256;
}

function freezeEntry(entry: ReadModelRegistryEntry): ReadModelRegistryEntry {
  const kinds = ["component", "service", "tenant", "platform", "evaluation", "health"];
  if (!validText(entry.readModelId) || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(entry.version) || !validText(entry.owner) ||
      !["active", "deprecated", "retired"].includes(entry.lifecycle) || !["backward-compatible", "breaking"].includes(entry.compatibility) ||
      entry.compatibleSignalSchemaVersions.length === 0 || entry.compatibleSignalSchemaVersions.some((version) => !Number.isSafeInteger(version) || version <= 0) ||
      entry.projectionKinds.length === 0 || entry.projectionKinds.some((kind) => !kinds.includes(kind))) {
    throw new TypeError("Invalid read model registry entry.");
  }
  return Object.freeze({ ...entry, compatibleSignalSchemaVersions: Object.freeze([...entry.compatibleSignalSchemaVersions]), projectionKinds: Object.freeze([...entry.projectionKinds]) });
}

export type ReadModelResolution =
  | { readonly status: "resolved"; readonly readModel: ReadModelRegistryEntry }
  | { readonly status: "unknown_read_model"; readonly readModelId: string; readonly version: string }
  | { readonly status: "incompatible"; readonly readModel: ReadModelRegistryEntry; readonly signalSchemaVersion: number };

export type ReadModelRegistration =
  | { readonly status: "registered"; readonly registry: DiagnosticsReadModelRegistry }
  | { readonly status: "duplicate" | "invalid"; readonly readModelId: string; readonly version: string };

export class DiagnosticsReadModelRegistry {
  readonly #entries: ReadonlyMap<string, ReadModelRegistryEntry>;

  constructor(entries: readonly ReadModelRegistryEntry[]) {
    const map = new Map<string, ReadModelRegistryEntry>();
    for (const raw of entries) {
      const entry = freezeEntry(raw);
      const key = DiagnosticsReadModelRegistry.key(entry.readModelId, entry.version);
      if (map.has(key)) throw new TypeError("Duplicate read model registry entry.");
      map.set(key, entry);
    }
    this.#entries = map;
    Object.freeze(this);
  }

  resolve(readModelId: string, version: string, signalSchemaVersion: number): ReadModelResolution {
    const readModel = this.#entries.get(DiagnosticsReadModelRegistry.key(readModelId, version));
    if (!readModel || readModel.lifecycle === "retired") return Object.freeze({ status: "unknown_read_model", readModelId, version });
    if (!readModel.compatibleSignalSchemaVersions.includes(signalSchemaVersion)) return Object.freeze({ status: "incompatible", readModel, signalSchemaVersion });
    return Object.freeze({ status: "resolved", readModel });
  }

  list(): readonly ReadModelRegistryEntry[] {
    return Object.freeze([...this.#entries.values()]);
  }

  register(entry: ReadModelRegistryEntry): ReadModelRegistration {
    if (this.#entries.has(DiagnosticsReadModelRegistry.key(entry.readModelId, entry.version))) {
      return Object.freeze({ status: "duplicate", readModelId: entry.readModelId, version: entry.version });
    }
    try {
      return Object.freeze({ status: "registered", registry: new DiagnosticsReadModelRegistry([...this.list(), entry]) });
    } catch {
      return Object.freeze({ status: "invalid", readModelId: entry.readModelId, version: entry.version });
    }
  }

  private static key(id: string, version: string): string {
    return `${id}@${version}`;
  }
}
