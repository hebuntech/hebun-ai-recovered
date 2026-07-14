/*
 * Persistence layer — events.
 *
 * Each adapter instance owns an emitter so subscribers re-render when its
 * collection changes. No global bus, no async.
 */

type Listener = () => void;

export interface Emitter {
  subscribe(listener: Listener): () => void;
  emit(): void;
}

export function createEmitter(): Emitter {
  const listeners = new Set<Listener>();
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emit() {
      for (const listener of listeners) listener();
    },
  };
}
