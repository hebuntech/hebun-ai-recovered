/*
 * offline-queries.ts — read-only query helpers over the offline execution
 * engine. Pure lookups; no execution, no provider invocation.
 */

import { offlineSession, offlineSessions, sessionById } from "@/features/offline-execution/offline-execution-engine";
import { offlineReports, buildReport } from "@/features/offline-execution/offline-report";
import { offlineExecutionMetrics } from "@/features/offline-execution/offline-metrics";
import { validateSession } from "@/features/offline-execution/offline-validator";
import { offlineExecutionPipeline, offlineSafetyBoundaries } from "@/features/offline-execution/offline-execution-pipeline";

export function getOfflineSession() {
  return offlineSession;
}

export function getOfflineSessions() {
  return offlineSessions;
}

export function getOfflineSessionById(id: string) {
  return sessionById(id);
}

export function getOfflineReport() {
  return buildReport(offlineSession);
}

export function getOfflineReports() {
  return offlineReports;
}

export function getOfflineMetrics() {
  return offlineExecutionMetrics;
}

export function getOfflineValidation() {
  return validateSession(offlineSession);
}

export function getOfflinePipeline() {
  return offlineExecutionPipeline;
}

export function getOfflineSafetyBoundaries() {
  return offlineSafetyBoundaries;
}
