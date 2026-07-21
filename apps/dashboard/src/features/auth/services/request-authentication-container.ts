import type { AuthenticationResult } from "../types";
import type {
  AuthenticationService,
  AuthenticationServiceRequest,
} from "./authentication-service";

export interface RequestAuthenticationContainer {
  readonly scope: "request";
  readonly requestId: string;
  readonly correlationId?: string;
  authenticate(
    request?: AuthenticationServiceRequest,
  ): Promise<AuthenticationResult>;
}

export function createRequestAuthenticationContainer(input: {
  readonly requestId: string;
  readonly correlationId?: string;
  readonly authenticationService: AuthenticationService;
}): RequestAuthenticationContainer {
  const requestId = input.requestId.trim();
  if (!requestId) {
    throw new TypeError("Authentication requestId must not be empty.");
  }

  const correlationId = input.correlationId?.trim() || undefined;
  return Object.freeze({
    scope: "request" as const,
    requestId,
    correlationId,
    authenticate: (request: AuthenticationServiceRequest = {}) =>
      input.authenticationService.authenticate(request, {
        requestId,
        correlationId,
      }),
  });
}
