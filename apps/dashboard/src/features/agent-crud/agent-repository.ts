/*
 * Agent CRUD — repository.
 */

import { createRepository } from "@/features/persistence";
import { agentAdapter } from "./agent-adapter";
import type { LifecycleStatus } from "@/features/persistence";
import type { AgentCrudRecord } from "./types";

const repository = createRepository(agentAdapter);

export async function findAll(): Promise<AgentCrudRecord[]> {
  return repository.findAll();
}

export async function findById(id: string): Promise<AgentCrudRecord | undefined> {
  return repository.findById(id);
}

export async function insert(record: AgentCrudRecord): Promise<void> {
  await repository.insert(record);
}

export async function update(
  id: string,
  patch: Partial<AgentCrudRecord>
): Promise<AgentCrudRecord | undefined> {
  return repository.update(id, { ...patch, updatedAt: new Date().toISOString() });
}

export async function setStatus(
  id: string,
  status: LifecycleStatus
): Promise<AgentCrudRecord | undefined> {
  if (status === "archived") return repository.archive(id);
  if (status === "active") return repository.restore(id);
  return repository.softDelete(id);
}
