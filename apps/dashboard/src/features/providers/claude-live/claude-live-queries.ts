import { claudeLiveRecord } from "@/features/providers/claude-live/claude-live-adapter";
import { claudeLiveMetrics } from "@/features/providers/claude-live/claude-live-metrics";

export function getClaudeLiveRecord() {
  return claudeLiveRecord;
}

export function getClaudeLiveRequest() {
  return claudeLiveRecord.request;
}

export function getClaudeLiveResponse() {
  return claudeLiveRecord.response;
}

export function getClaudeLiveEligibility() {
  return claudeLiveRecord.eligibility;
}

export function getClaudeLiveMetrics() {
  return claudeLiveMetrics;
}
