import type { AdapterErrorCode } from "@/features/adapters";
import type { AdapterError } from "@/features/adapters";
import { makeAdapterError } from "@/features/adapters";
import type { ProviderErrorCategory, ProviderErrorMapping } from "@/features/provider-framework/types";

/*
 * provider-errors.ts — normalizes provider-category errors onto stable SDK
 * error codes so the Execution Engine handles every provider identically.
 */
export const providerErrorMappings: ProviderErrorMapping[] = [
  { category: "Validation", sdkCode: "VALIDATION_FAILED", recoverable: true, description: "Request failed provider validation." },
  { category: "Configuration", sdkCode: "CONFIGURATION_INVALID", recoverable: true, description: "Provider configuration invalid." },
  { category: "Permission", sdkCode: "PERMISSION_DENIED", recoverable: true, description: "Provider denied by governance/permissions." },
  { category: "Execution", sdkCode: "EXECUTION_FAILED", recoverable: true, description: "Provider runtime execution failure." },
  { category: "Timeout", sdkCode: "TIMEOUT", recoverable: true, description: "Provider exceeded deadline." },
  { category: "Rate Limit", sdkCode: "UNAVAILABLE", recoverable: true, description: "Provider rate limit reached." },
  { category: "Unavailable", sdkCode: "UNAVAILABLE", recoverable: true, description: "Provider temporarily unavailable." },
  { category: "Internal", sdkCode: "FATAL", recoverable: false, description: "Provider internal error." },
  { category: "Unknown", sdkCode: "FATAL", recoverable: false, description: "Unclassified provider error." },
];

export function sdkCodeForCategory(category: ProviderErrorCategory): AdapterErrorCode {
  return providerErrorMappings.find((m) => m.category === category)?.sdkCode ?? "FATAL";
}

/** normalize a provider-category error into a canonical SDK AdapterError */
export function normalizeProviderError(
  category: ProviderErrorCategory,
  message: string,
  providerId?: string
): AdapterError {
  return makeAdapterError(sdkCodeForCategory(category), message, { adapterId: providerId });
}
