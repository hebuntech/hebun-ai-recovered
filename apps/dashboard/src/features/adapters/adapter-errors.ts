import {
  errorCodeDefinition,
  type AdapterErrorCode,
  type ErrorSeverity,
} from "@/features/adapters/error-codes";

/*
 * adapter-errors.ts — deterministic error object model.
 *
 * Every adapter failure is expressed as an AdapterError with a stable code,
 * severity and recoverability. The Execution Engine reacts to the code, never
 * to a provider-specific message.
 */

export interface AdapterError {
  code: AdapterErrorCode;
  severity: ErrorSeverity;
  recoverable: boolean;
  message: string;
  adapterId?: string;
  capability?: string;
  at?: string;
}

export function makeAdapterError(
  code: AdapterErrorCode,
  message: string,
  extra: Partial<Pick<AdapterError, "adapterId" | "capability" | "at">> = {}
): AdapterError {
  const def = errorCodeDefinition(code);
  return {
    code,
    severity: def.severity,
    recoverable: def.recoverable,
    message,
    ...extra,
  };
}

export function isFatal(error: AdapterError): boolean {
  return error.severity === "fatal";
}

/* Sample deterministic errors for diagnostics UI. */
export const sampleErrors: AdapterError[] = [
  makeAdapterError("CAPABILITY_UNSUPPORTED", "Requested Browser capability not implemented", { adapterId: "simulation", capability: "Browser" }),
  makeAdapterError("TIMEOUT", "Execution exceeded 30s deadline", { adapterId: "simulation" }),
  makeAdapterError("PERMISSION_DENIED", "Governance gate rejected execution", { adapterId: "simulation" }),
];
