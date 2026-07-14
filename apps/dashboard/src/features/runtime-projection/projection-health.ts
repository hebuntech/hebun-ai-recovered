import type {
  RuntimeProjectionAvailability,
  RuntimeProjectionHealth,
} from "./types";

export function createHealthyProjectionHealth(
  checkedAt: string,
  detail: string,
): RuntimeProjectionHealth {
  return {
    status: "healthy",
    detail,
    checkedAt,
  };
}

export function createUnavailableProjectionAvailability(
  detail: string,
): RuntimeProjectionAvailability {
  return {
    available: false,
    detail,
  };
}

export function createAvailableProjectionAvailability(
  detail: string,
): RuntimeProjectionAvailability {
  return {
    available: true,
    detail,
  };
}
