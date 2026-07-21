const forbidden = /access.?token|refresh.?token|jwt|password|otp|cookie|authorization|provider.?raw|hidden.?reason|chain.?of.?thought|secret|api.?key|connection.?string/i;

export function validText(value: string): boolean {
  return Boolean(value.trim()) && value.length <= 256 && !forbidden.test(value);
}

export function validVersion(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value);
}

export function hasOnlyKeys(value: object, allowed: readonly string[]): boolean {
  const keys = new Set(allowed);
  return Object.keys(value).every((key) => keys.has(key));
}

export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}
