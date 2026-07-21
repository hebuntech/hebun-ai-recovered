export const AUTHENTICATION_ENV_KEYS = {
  enabled: "HEBUN_AUTH_ENABLED",
  controlPlaneDatabaseUrl: "DATABASE_URL",
  supabaseUrl: "SUPABASE_URL",
  supabasePublishableKey: "SUPABASE_ANON_KEY",
  sessionDigestCurrentVersion: "HEBUN_AUTH_SESSION_DIGEST_CURRENT_VERSION",
  sessionDigestCurrentSecret: "HEBUN_AUTH_SESSION_DIGEST_SECRET",
  sessionDigestPreviousVersion: "HEBUN_AUTH_SESSION_DIGEST_PREVIOUS_VERSION",
  sessionDigestPreviousSecret: "HEBUN_AUTH_SESSION_DIGEST_PREVIOUS_SECRET",
} as const;

export interface AuthenticationDigestKey {
  readonly version: number;
  readonly secret: string;
}

export interface ConfiguredAuthenticationEnvironment {
  readonly status: "configured";
  readonly enabled: true;
  readonly controlPlaneDatabaseUrl: string;
  readonly supabaseUrl: string;
  readonly supabasePublishableKey: string;
  readonly sessionDigestCurrentKey: AuthenticationDigestKey;
  readonly sessionDigestPreviousKey?: AuthenticationDigestKey;
}

export type AuthenticationEnvironmentResolution =
  | { readonly status: "disabled"; readonly enabled: false }
  | ConfiguredAuthenticationEnvironment
  | {
      readonly status: "invalid";
      readonly enabled: true;
      readonly missingKeys: readonly string[];
      readonly invalidKeys: readonly string[];
    };

function parseKeyVersion(value: string | undefined): number | undefined {
  if (!value || !/^\d+$/.test(value.trim())) return undefined;
  const version = Number(value.trim());
  return Number.isSafeInteger(version) && version > 0 ? version : undefined;
}

function assertServerRuntime(): void {
  if (typeof window !== "undefined") {
    throw new Error("Authentication environment is server-only.");
  }
}

export function resolveAuthenticationEnvironment(
  env: Readonly<Record<string, string | undefined>> = process.env,
): AuthenticationEnvironmentResolution {
  assertServerRuntime();

  if (env[AUTHENTICATION_ENV_KEYS.enabled] !== "true") {
    return Object.freeze({ status: "disabled", enabled: false });
  }

  const required = [
    AUTHENTICATION_ENV_KEYS.controlPlaneDatabaseUrl,
    AUTHENTICATION_ENV_KEYS.supabaseUrl,
    AUTHENTICATION_ENV_KEYS.supabasePublishableKey,
    AUTHENTICATION_ENV_KEYS.sessionDigestCurrentVersion,
    AUTHENTICATION_ENV_KEYS.sessionDigestCurrentSecret,
  ] as const;
  const missingKeys = required.filter((key) => !env[key]?.trim());
  const previousVersionValue = env[AUTHENTICATION_ENV_KEYS.sessionDigestPreviousVersion]?.trim();
  const previousSecret = env[AUTHENTICATION_ENV_KEYS.sessionDigestPreviousSecret]?.trim();
  const currentVersion = parseKeyVersion(
    env[AUTHENTICATION_ENV_KEYS.sessionDigestCurrentVersion],
  );
  const previousVersion = parseKeyVersion(previousVersionValue);
  const invalidKeys: string[] = [];

  if (
    env[AUTHENTICATION_ENV_KEYS.sessionDigestCurrentVersion]?.trim() &&
    currentVersion === undefined
  ) {
    invalidKeys.push(AUTHENTICATION_ENV_KEYS.sessionDigestCurrentVersion);
  }
  if (Boolean(previousVersionValue) !== Boolean(previousSecret)) {
    invalidKeys.push(
      previousVersionValue
        ? AUTHENTICATION_ENV_KEYS.sessionDigestPreviousSecret
        : AUTHENTICATION_ENV_KEYS.sessionDigestPreviousVersion,
    );
  } else if (previousVersionValue && previousVersion === undefined) {
    invalidKeys.push(AUTHENTICATION_ENV_KEYS.sessionDigestPreviousVersion);
  } else if (previousVersion !== undefined && previousVersion === currentVersion) {
    invalidKeys.push(AUTHENTICATION_ENV_KEYS.sessionDigestPreviousVersion);
  }

  if (missingKeys.length > 0 || invalidKeys.length > 0) {
    return Object.freeze({
      status: "invalid",
      enabled: true,
      missingKeys: Object.freeze([...missingKeys]),
      invalidKeys: Object.freeze(invalidKeys),
    });
  }

  return Object.freeze({
    status: "configured",
    enabled: true,
    controlPlaneDatabaseUrl: env[required[0]]!.trim(),
    supabaseUrl: env[required[1]]!.trim(),
    supabasePublishableKey: env[required[2]]!.trim(),
    sessionDigestCurrentKey: Object.freeze({
      version: currentVersion!,
      secret: env[AUTHENTICATION_ENV_KEYS.sessionDigestCurrentSecret]!.trim(),
    }),
    sessionDigestPreviousKey:
      previousVersion !== undefined && previousSecret
        ? Object.freeze({ version: previousVersion, secret: previousSecret })
        : undefined,
  });
}
