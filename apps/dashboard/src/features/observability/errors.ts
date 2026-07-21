export type SignalContractErrorCode =
  | "UNKNOWN_SIGNAL_TYPE"
  | "UNKNOWN_SCHEMA_VERSION"
  | "INVALID_SIGNAL"
  | "INVALID_SCOPE"
  | "CROSS_TENANT_CORRELATION"
  | "UNRESOLVED_CORRELATION"
  | "FORBIDDEN_CREDENTIAL"
  | "FORBIDDEN_METADATA"
  | "INVALID_PAYLOAD"
  | "PAYLOAD_TOO_LARGE"
  | "INVALID_TIME"
  | "CLOCK_DRIFT_EXCEEDED"
  | "SIGNAL_REPLAY"
  | "POLICY_REJECTED";

export class SignalContractError extends Error {
  constructor(readonly code: SignalContractErrorCode) {
    super("Signal could not be canonicalized.");
    this.name = "SignalContractError";
  }
}
