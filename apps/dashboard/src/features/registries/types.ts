import type { EventSeverity, SystemEvent } from "@/types";

export type RegistryKey =
  | "agents"
  | "goals"
  | "plans"
  | "executions"
  | "experience"
  | "learning"
  | "tools"
  | "models"
  | "capabilities"
  | "events"
  | "workflows"
  | "entities"
  | "governance"
  | "risk"
  | "policies";

export type RegistryRecordStatus = "active" | "archived" | "deprecated";
export type RegistryTrend = "up" | "down" | "flat";

export interface RegistryDefinition {
  id: RegistryKey;
  title: string;
  shortLabel: string;
  description: string;
  route?: string;
  owner: string;
  consumers: string[];
  dependencies: string[];
  totalRecords: number;
  activeRecords: number;
  archivedRecords: number;
  dailyGrowth: number;
  health: number;
  synchronization: number;
  consistency: number;
  validation: number;
  coverage: number;
  freshness: string;
  status: "healthy" | "attention" | "degraded";
  recentChanges: number;
}

export interface RegistryRecord {
  id: string;
  name: string;
  status: RegistryRecordStatus;
  owner: string;
  consumers: string[];
  dependency: string;
  updated: string;
  change: string;
  health: number;
}

export interface RegistryGrowthPoint {
  day: string;
  value: number;
}

export interface RegistryRelationship {
  from: RegistryKey;
  to: RegistryKey;
}

export interface RegistryActivity extends SystemEvent {
  registry: RegistryKey;
}

export interface RegistryOverviewMetrics {
  totalRegistries: number;
  registryHealth: number;
  totalRecords: number;
  dailyGrowth: number;
  activeRecords: number;
  archivedRecords: number;
  synchronization: number;
  recentChanges: number;
}

export interface RegistryStatusTone {
  badge: "success" | "warning" | "error";
  text: string;
}

export type RegistrySeverity = EventSeverity;
