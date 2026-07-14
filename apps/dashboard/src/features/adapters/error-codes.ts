/*
 * error-codes.ts — canonical, stable error codes for the Adapter SDK.
 *
 * Codes are versioned and additive: new codes may be appended, existing codes
 * never change meaning. Providers map their failures onto these codes so the
 * Execution Engine handles every adapter identically.
 */

export type AdapterErrorCode =
  | "OK"
  | "VALIDATION_FAILED"
  | "CONFIGURATION_INVALID"
  | "CAPABILITY_UNSUPPORTED"
  | "PERMISSION_DENIED"
  | "TIMEOUT"
  | "EXECUTION_FAILED"
  | "CANCELLED"
  | "ROLLBACK_FAILED"
  | "RETRY_EXHAUSTED"
  | "CIRCUIT_OPEN"
  | "UNAVAILABLE"
  | "FATAL";

export type ErrorSeverity = "info" | "warning" | "recoverable" | "fatal";

export interface ErrorCodeDefinition {
  code: AdapterErrorCode;
  severity: ErrorSeverity;
  recoverable: boolean;
  label: string;
  description: string;
}

export const errorCodeCatalog: ErrorCodeDefinition[] = [
  { code: "OK", severity: "info", recoverable: false, label: "OK", description: "No error." },
  { code: "VALIDATION_FAILED", severity: "recoverable", recoverable: true, label: "Validation Failed", description: "Request or adapter contract failed validation." },
  { code: "CONFIGURATION_INVALID", severity: "recoverable", recoverable: true, label: "Configuration Invalid", description: "Adapter configuration is malformed or incomplete." },
  { code: "CAPABILITY_UNSUPPORTED", severity: "recoverable", recoverable: true, label: "Capability Unsupported", description: "Adapter does not implement the requested capability." },
  { code: "PERMISSION_DENIED", severity: "recoverable", recoverable: true, label: "Permission Denied", description: "Governance denied the execution." },
  { code: "TIMEOUT", severity: "recoverable", recoverable: true, label: "Timeout", description: "Execution exceeded its deadline." },
  { code: "EXECUTION_FAILED", severity: "recoverable", recoverable: true, label: "Execution Failed", description: "Adapter reported a runtime execution failure." },
  { code: "CANCELLED", severity: "warning", recoverable: true, label: "Cancelled", description: "Execution was cancelled before completion." },
  { code: "ROLLBACK_FAILED", severity: "fatal", recoverable: false, label: "Rollback Failed", description: "Compensating rollback could not complete." },
  { code: "RETRY_EXHAUSTED", severity: "fatal", recoverable: false, label: "Retry Exhausted", description: "All retry attempts were used." },
  { code: "CIRCUIT_OPEN", severity: "recoverable", recoverable: true, label: "Circuit Open", description: "Circuit breaker is open; execution short-circuited." },
  { code: "UNAVAILABLE", severity: "recoverable", recoverable: true, label: "Unavailable", description: "Adapter is temporarily unavailable." },
  { code: "FATAL", severity: "fatal", recoverable: false, label: "Fatal", description: "Unrecoverable adapter error." },
];

export function errorCodeDefinition(code: AdapterErrorCode): ErrorCodeDefinition {
  return errorCodeCatalog.find((e) => e.code === code) ?? errorCodeCatalog[errorCodeCatalog.length - 1];
}

export function isRecoverable(code: AdapterErrorCode): boolean {
  return errorCodeDefinition(code).recoverable;
}
