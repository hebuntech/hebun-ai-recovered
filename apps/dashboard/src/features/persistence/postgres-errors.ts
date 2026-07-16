import type {
  PersistenceCollection,
  PersistenceOperation,
} from "./types";

export type PostgresPersistenceErrorCode =
  | "PERSISTENCE_TENANT_REQUIRED"
  | "PERSISTENCE_TENANT_MISMATCH"
  | "PERSISTENCE_COLLECTION_UNSUPPORTED"
  | "PERSISTENCE_OPERATION_UNSUPPORTED"
  | "PERSISTENCE_RECORD_NOT_FOUND"
  | "PERSISTENCE_LOGICAL_ID_CONFLICT"
  | "PERSISTENCE_INVALID_RECORD_MAPPING"
  | "PERSISTENCE_POSTGRES_UNAVAILABLE"
  | "PERSISTENCE_TRANSACTION_FAILED";

export class PostgresPersistenceError extends Error {
  readonly provider = "postgres";

  constructor(
    readonly code: PostgresPersistenceErrorCode,
    message: string,
    readonly collection: PersistenceCollection,
    readonly operation?: PersistenceOperation,
  ) {
    super(message);
    this.name = "PostgresPersistenceError";
  }
}

export function postgresPersistenceError(params: {
  code: PostgresPersistenceErrorCode;
  collection: PersistenceCollection;
  operation?: PersistenceOperation;
  detail: string;
}): PostgresPersistenceError {
  return new PostgresPersistenceError(
    params.code,
    params.detail,
    params.collection,
    params.operation,
  );
}
