const forbiddenKey = /access.?token|refresh.?token|jwt|password|otp|cookie|authorization|provider.?raw|hidden.?reason|chain.?of.?thought|secret|api.?key|connection.?string/i;
const forbiddenValue = /\bBearer\s+[A-Za-z0-9._~+\/-]+=*|postgres(?:ql)?:\/\/[^\s]+|-----BEGIN [A-Z ]+PRIVATE KEY-----/i;

export function isSafeEvaluationValue(value: unknown, seen = new Set<object>()): boolean {
  if (typeof value === "string") return !forbiddenValue.test(value);
  if (value === null || typeof value === "number" || typeof value === "boolean" || value === undefined) return true;
  if (Array.isArray(value)) {
    if (value.length > 256 || seen.has(value)) return false;
    seen.add(value);
    const safe = value.every((entry) => isSafeEvaluationValue(entry, seen));
    seen.delete(value);
    return safe;
  }
  if (value && typeof value === "object") {
    if (seen.has(value) || Object.getPrototypeOf(value) !== Object.prototype) return false;
    seen.add(value);
    const safe = Object.entries(value).every(([key, entry]) => !forbiddenKey.test(key) && isSafeEvaluationValue(entry, seen));
    seen.delete(value);
    return safe;
  }
  return false;
}

export function hasOnlyKeys(value: object, allowed: readonly string[]): boolean {
  const keys = new Set(allowed);
  return Object.keys(value).every((key) => keys.has(key));
}

export function validText(value: string): boolean {
  return Boolean(value.trim()) && value.length <= 256 && isSafeEvaluationValue(value);
}

export function validVersion(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value);
}

export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}
