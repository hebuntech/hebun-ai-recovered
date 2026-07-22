export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}

export function validVersion(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value);
}

export function validText(value: string): boolean {
  return Boolean(value.trim()) && value.length <= 256;
}

/**
 * A command definition must be inert data. Any function value would make it
 * invocable, which this phase forbids outright.
 */
export function containsNoBehaviour(value: unknown): boolean {
  if (typeof value === "function") return false;
  if (Array.isArray(value)) return value.every(containsNoBehaviour);
  if (value && typeof value === "object") return Object.values(value).every(containsNoBehaviour);
  return true;
}
