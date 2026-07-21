import type { MonitorRegistryEntry } from "./types";
import { deepFreeze, validText, validVersion } from "./validation";

export type MonitorResolution =
  | { readonly status: "resolved"; readonly monitor: MonitorRegistryEntry }
  | { readonly status: "unknown_monitor"; readonly monitorId: string; readonly version: string }
  | { readonly status: "incompatible"; readonly monitor: MonitorRegistryEntry; readonly signalSchemaVersion: number };

export type MonitorRegistration =
  | { readonly status: "registered"; readonly registry: MonitoringRegistry }
  | { readonly status: "duplicate" | "invalid"; readonly monitorId: string; readonly version: string };

export class MonitoringRegistry {
  readonly #entries: ReadonlyMap<string, MonitorRegistryEntry>;

  constructor(entries: readonly MonitorRegistryEntry[]) {
    const resolved = new Map<string, MonitorRegistryEntry>();
    for (const entry of entries) {
      if (!validText(entry.monitorId) || !validVersion(entry.version) || !validText(entry.owner) ||
          !["active", "deprecated", "retired"].includes(entry.lifecycle) || !["backward-compatible", "breaking"].includes(entry.compatibility) ||
          entry.compatibleSignalSchemaVersions.length === 0 || entry.compatibleSignalSchemaVersions.some((version) => !Number.isSafeInteger(version) || version <= 0)) {
        throw new TypeError("Invalid monitor registry entry.");
      }
      const key = MonitoringRegistry.key(entry.monitorId, entry.version);
      if (resolved.has(key)) throw new TypeError("Duplicate monitor registry entry.");
      resolved.set(key, deepFreeze({ ...entry, compatibleSignalSchemaVersions: [...entry.compatibleSignalSchemaVersions] }));
    }
    this.#entries = resolved;
    Object.freeze(this);
  }

  resolve(monitorId: string, version: string, signalSchemaVersion: number): MonitorResolution {
    const monitor = this.#entries.get(MonitoringRegistry.key(monitorId, version));
    if (!monitor || monitor.lifecycle === "retired") return Object.freeze({ status: "unknown_monitor", monitorId, version });
    if (!monitor.compatibleSignalSchemaVersions.includes(signalSchemaVersion)) {
      return Object.freeze({ status: "incompatible", monitor, signalSchemaVersion });
    }
    return Object.freeze({ status: "resolved", monitor });
  }

  register(entry: MonitorRegistryEntry): MonitorRegistration {
    if (this.#entries.has(MonitoringRegistry.key(entry.monitorId, entry.version))) {
      return Object.freeze({ status: "duplicate", monitorId: entry.monitorId, version: entry.version });
    }
    try {
      return Object.freeze({ status: "registered", registry: new MonitoringRegistry([...this.list(), entry]) });
    } catch {
      return Object.freeze({ status: "invalid", monitorId: entry.monitorId, version: entry.version });
    }
  }

  list(): readonly MonitorRegistryEntry[] {
    return Object.freeze([...this.#entries.values()]);
  }

  private static key(monitorId: string, version: string): string {
    return `${monitorId}@${version}`;
  }
}
