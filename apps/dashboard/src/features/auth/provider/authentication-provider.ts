import type { ProviderAuthentication } from "../types";

export interface ProviderCookieOptions {
  readonly httpOnly?: boolean;
  readonly maxAge?: number;
  readonly path?: string;
  readonly sameSite?: "lax" | "strict" | "none";
  readonly secure?: boolean;
}

/** Cookie access is confined to provider infrastructure. */
export interface ProviderCookieAccess {
  readonly get: (name: string) => string | undefined;
  readonly set: (
    name: string,
    value: string,
    options: ProviderCookieOptions,
  ) => void;
}

export interface AuthenticationProviderRequest {
  readonly requestId: string;
  readonly cookies: ProviderCookieAccess;
}

export interface AuthenticationProvider {
  readonly provider: string;
  authenticate(
    request: AuthenticationProviderRequest,
  ): Promise<ProviderAuthentication>;
}
