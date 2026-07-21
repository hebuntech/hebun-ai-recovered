import assert from "node:assert/strict";
import {
  canonicalSignalSchemaRegistry,
  SignalContractError,
  SignalSchemaRegistry,
  validateSignalSchemaVersion,
} from "../../src/features/observability";

function errorCode(code: SignalContractError["code"]) {
  return (error: unknown) => error instanceof SignalContractError && error.code === code;
}

function main(): void {
  assert.equal(canonicalSignalSchemaRegistry.list().length, 8);
  assert.equal(Object.isFrozen(canonicalSignalSchemaRegistry), true);
  assert.equal(Object.isFrozen(canonicalSignalSchemaRegistry.list()), true);
  assert.equal(Object.isFrozen(canonicalSignalSchemaRegistry.resolve("metric", 1)), true);
  assert.equal(
    validateSignalSchemaVersion(canonicalSignalSchemaRegistry, "trace", 1).signalType,
    "trace",
  );

  assert.throws(
    () => canonicalSignalSchemaRegistry.resolve("unknown", 1),
    errorCode("UNKNOWN_SIGNAL_TYPE"),
  );
  assert.throws(
    () => canonicalSignalSchemaRegistry.resolve("metric", 2),
    errorCode("UNKNOWN_SCHEMA_VERSION"),
  );
  assert.throws(
    () => new SignalSchemaRegistry([
      { signalType: "metric", schemaVersion: 1, owner: "observability", lifecycle: "active", maxPayloadBytes: 10 },
      { signalType: "metric", schemaVersion: 1, owner: "observability", lifecycle: "active", maxPayloadBytes: 10 },
    ]),
    errorCode("INVALID_SIGNAL"),
  );

  console.log("signal schema registry checks passed");
}

main();
