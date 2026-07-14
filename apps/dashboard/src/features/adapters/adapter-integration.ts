/*
 * adapter-integration.ts — declares how existing platform layers consume the
 * Adapter SDK. Descriptor-only and deterministic: the SDK is the single seam,
 * so these integrations require no changes to the consuming features and no
 * provider-specific code.
 */

export interface SdkConsumer {
  id: string;
  layer: string;
  uses: string;
  contract: string;
}

export const sdkConsumers: SdkConsumer[] = [
  { id: "execution", layer: "Execution Engine", uses: "Runs blueprints through adapters", contract: "execute · pause · resume · cancel · rollback" },
  { id: "orchestration", layer: "Orchestration", uses: "Selects adapters by capability", contract: "discovery · supports · capability matching" },
  { id: "planning", layer: "Planning", uses: "Estimates feasibility per capability", contract: "capabilities · timeout policy" },
  { id: "policy", layer: "Policy & Governance", uses: "Gates execution + permission errors", contract: "validate · PERMISSION_DENIED · Human Approval" },
  { id: "reasoning", layer: "Reasoning", uses: "Interprets telemetry + failures", contract: "telemetry · failure classification" },
  { id: "memory", layer: "Memory", uses: "Stores execution results + lessons", contract: "ExecutionResult · artifacts · logs" },
  { id: "knowledge-graph", layer: "Knowledge Graph", uses: "Links adapters ↔ capabilities ↔ executions", contract: "AdapterMetadata · capability ids" },
  { id: "registry", layer: "Registry", uses: "Catalogs adapters + capabilities", contract: "registry · factory records" },
];
