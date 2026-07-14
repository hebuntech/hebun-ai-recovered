import type { RuntimeProjectionVersion } from "./types";

export function createProjectionVersion(
  value: number,
  updatedAt: string,
): RuntimeProjectionVersion {
  return {
    value,
    updatedAt,
  };
}
