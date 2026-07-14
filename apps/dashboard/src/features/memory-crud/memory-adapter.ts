/*
 * Memory CRUD — persistence adapter binding.
 */

import { companyMemories } from "@/features/memory/memory";
import { getAdapter } from "@/features/persistence/storage-manager";
import type { MemoryCrudRecord, MemoryType } from "./types";

const SEED_AT = "2026-01-01T00:00:00.000Z";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferMemoryType(record: (typeof companyMemories)[number]): MemoryType {
  if (record.category === "conversation") return "Conversation";
  if (record.category === "decision") return "Decision";
  if (record.category === "procedural") return "Procedure";
  if (record.registryIds.includes("policies")) return "Policy";
  if (record.registryIds.includes("workflows")) return "Workflow";
  if (record.registryIds.includes("agents")) return "Agent";
  if (record.registryIds.includes("entities")) return "Customer";
  if (record.category === "episodic") return "Project";
  if (record.category === "semantic") return "Organization";
  return "Fact";
}

function inferOwner(record: (typeof companyMemories)[number]): Pick<MemoryCrudRecord, "ownerType" | "ownerId"> {
  const owner = slugify(record.owner);

  if (record.registryIds.includes("workflows")) {
    return { ownerType: "workflow", ownerId: "wf-support-agent" };
  }

  if (record.registryIds.includes("agents")) {
    return { ownerType: "agent", ownerId: "ag-support" };
  }

  if (["sales", "finance", "hr", "legal", "operations", "marketing", "research"].includes(owner)) {
    return { ownerType: "department", ownerId: owner };
  }

  return { ownerType: "organization", ownerId: owner || "director" };
}

function seed(): MemoryCrudRecord[] {
  return companyMemories.map((memory) => {
    const owner = inferOwner(memory);
    return {
      id: memory.id,
      title: memory.title,
      slug: slugify(memory.title),
      description: memory.whatHappened,
      memoryType: inferMemoryType(memory),
      ownerType: owner.ownerType,
      ownerId: owner.ownerId,
      importance: memory.importance,
      confidence: Math.max(60, 100 - memory.graphRelationshipIds.length * 4),
      source: `${memory.category} memory seed`,
      tags: [...memory.tags],
      summary: memory.summary,
      status: memory.status,
      version: "v1.0.0",
      createdAt: memory.timestamp || SEED_AT,
      updatedAt: memory.timestamp || SEED_AT,
      createdBy: "Seed",
      updatedBy: "Seed",
      lifecycleStatus: "active",
    };
  });
}

export const memoryAdapter = getAdapter<MemoryCrudRecord>("memories", seed);

export const subscribe = memoryAdapter.subscribe;
export const getSnapshot = memoryAdapter.getSnapshot;

export async function resetStore(): Promise<void> {
  await memoryAdapter.save(seed());
}
