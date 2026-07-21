export interface PassiveOperationHooks {
  readonly started: () => void;
  readonly completed: (outcome: "succeeded" | "failed") => void;
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return Boolean(value) && typeof (value as { then?: unknown }).then === "function";
}

export function runWithShadowInstrumentation<T>(hooks: PassiveOperationHooks, operation: () => T): T {
  try {
    hooks.started();
  } catch {
    // Shadow instrumentation cannot affect runtime entry.
  }
  try {
    const result = operation();
    if (isPromiseLike(result)) {
      void Promise.resolve(result).then(
        () => { try { hooks.completed("succeeded"); } catch { /* isolated */ } },
        () => { try { hooks.completed("failed"); } catch { /* isolated */ } },
      );
    } else {
      try { hooks.completed("succeeded"); } catch { /* isolated */ }
    }
    return result;
  } catch (error) {
    try { hooks.completed("failed"); } catch { /* isolated */ }
    throw error;
  }
}
