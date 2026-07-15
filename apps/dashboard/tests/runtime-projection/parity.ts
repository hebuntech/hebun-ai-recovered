import assert from "node:assert/strict";
import { retrieveReport } from "@/features/memory-engine";
import { MemoryRuntimeService } from "@/features/memory-runtime";
import { OrganizationalIntelligenceEngine } from "@/features/organizational-intelligence";
import {
  ensureRuntimeProjectionRegistry,
  runtimeProjectionRegistry,
} from "@/features/runtime-projection";

async function main(): Promise<void> {
  ensureRuntimeProjectionRegistry();

  const { retrievalTimeMs, ...expectedMemoryReport } = retrieveReport({ limit: 24 });
  void retrievalTimeMs;
  assert.deepEqual(MemoryRuntimeService.getReport(), expectedMemoryReport);

  const intelligence = OrganizationalIntelligenceEngine.getSnapshot();
  assert.deepEqual(intelligence.observations.memory.report, expectedMemoryReport);

  const agentBefore = runtimeProjectionRegistry.getSnapshot("agent-runtime");
  assert.ok(agentBefore);
  runtimeProjectionRegistry.refresh("agent-runtime");
  const agentAfter = runtimeProjectionRegistry.getSnapshot("agent-runtime");
  assert.ok(agentAfter);
  assert.deepEqual(agentAfter.data, agentBefore.data);

  console.log("runtime-projection semantic parity checks passed");
}

void main();
