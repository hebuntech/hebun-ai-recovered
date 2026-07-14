import type {
  RuntimeProjectionCollection,
  RuntimeProjectionContext,
  RuntimeProjectionSnapshot,
} from "./types";

export function createProjectionContext(params: {
  readonly now: () => string;
  readonly getSnapshot: <T>(
    collection: RuntimeProjectionCollection,
  ) => RuntimeProjectionSnapshot<T> | undefined;
}): RuntimeProjectionContext {
  return {
    now: params.now,
    getSnapshot<T>(collection: RuntimeProjectionCollection) {
      return params.getSnapshot<T>(collection);
    },
  };
}
