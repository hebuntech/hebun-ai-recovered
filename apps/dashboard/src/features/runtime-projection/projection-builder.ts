import type { RuntimeProjectionBuilder } from "./types";

export function createProjectionBuilder<T>(
  builder: RuntimeProjectionBuilder<T>,
): RuntimeProjectionBuilder<T> {
  return builder;
}
