import { SignalContractError } from "./errors";
import { SIGNAL_TYPES, type CanonicalSignalType } from "./types";

export interface SignalSchemaDefinition {
  readonly signalType: CanonicalSignalType;
  readonly schemaVersion: number;
  readonly owner: "observability" | "audit" | "evaluation" | "monitoring" | "organizational-intelligence";
  readonly lifecycle: "active" | "deprecated" | "retired";
  readonly maxPayloadBytes: number;
}

function freezeDefinition(definition: SignalSchemaDefinition): SignalSchemaDefinition {
  if (!Number.isSafeInteger(definition.schemaVersion) || definition.schemaVersion <= 0) {
    throw new SignalContractError("UNKNOWN_SCHEMA_VERSION");
  }
  if (!Number.isSafeInteger(definition.maxPayloadBytes) || definition.maxPayloadBytes <= 0) {
    throw new SignalContractError("INVALID_PAYLOAD");
  }
  return Object.freeze({ ...definition });
}

export class SignalSchemaRegistry {
  readonly #definitions: ReadonlyMap<string, SignalSchemaDefinition>;

  constructor(definitions: readonly SignalSchemaDefinition[]) {
    const entries = new Map<string, SignalSchemaDefinition>();
    for (const rawDefinition of definitions) {
      const definition = freezeDefinition(rawDefinition);
      const key = SignalSchemaRegistry.key(definition.signalType, definition.schemaVersion);
      if (entries.has(key)) throw new SignalContractError("INVALID_SIGNAL");
      entries.set(key, definition);
    }
    this.#definitions = entries;
    Object.freeze(this);
  }

  resolve(signalType: string, schemaVersion: number): SignalSchemaDefinition {
    if (!(SIGNAL_TYPES as readonly string[]).includes(signalType)) {
      throw new SignalContractError("UNKNOWN_SIGNAL_TYPE");
    }
    const definition = this.#definitions.get(
      SignalSchemaRegistry.key(signalType as CanonicalSignalType, schemaVersion),
    );
    if (!definition || definition.lifecycle === "retired") {
      throw new SignalContractError("UNKNOWN_SCHEMA_VERSION");
    }
    return definition;
  }

  list(): readonly SignalSchemaDefinition[] {
    return Object.freeze([...this.#definitions.values()]);
  }

  private static key(signalType: CanonicalSignalType, schemaVersion: number): string {
    return `${signalType}@${schemaVersion}`;
  }
}

export function validateSignalSchemaVersion(
  registry: SignalSchemaRegistry,
  signalType: string,
  schemaVersion: number,
): SignalSchemaDefinition {
  return registry.resolve(signalType, schemaVersion);
}

export const canonicalSignalSchemaRegistry = new SignalSchemaRegistry(
  SIGNAL_TYPES.map((signalType) => ({
    signalType,
    schemaVersion: 1,
    owner:
      signalType === "audit-event"
        ? "audit"
        : signalType === "evaluation-result"
          ? "evaluation"
          : signalType === "health-signal"
            ? "monitoring"
            : signalType === "business-signal"
              ? "organizational-intelligence"
              : "observability",
    lifecycle: "active",
    maxPayloadBytes: signalType === "audit-event" ? 16_384 : 8_192,
  })),
);
