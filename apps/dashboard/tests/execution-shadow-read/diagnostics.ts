import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CanonicalReadDiagnosticsPage } from "../../src/components/canonical-read/diagnostics-page";
import type { CanonicalReadDiagnosticsModel } from "../../src/features/canonical-read/diagnostics";
import { activeProvider } from "../../src/features/persistence/storage-manager";

function render(model: CanonicalReadDiagnosticsModel): string {
  return renderToStaticMarkup(
    createElement(CanonicalReadDiagnosticsPage, { model }),
  );
}

function collectImports(dir: string): string[] {
  const matches: string[] = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        if (fullPath.includes("execution-shadow-read")) continue;
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;
      const content = readFileSync(fullPath, "utf8");
      if (
        content.includes('from "@/features/execution-shadow-read"') ||
        content.includes('from "../../src/features/execution-shadow-read"')
      ) {
        matches.push(fullPath.replace(`${process.cwd()}/`, ""));
      }
    }
  }
  return matches.sort();
}

function clientBundleContainsExecutionShadow(): boolean {
  const staticDir = join(process.cwd(), ".next", "static");
  if (!existsSync(staticDir)) return false;
  const stack = [staticDir];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
      const content = readFileSync(fullPath, "utf8");
      if (
        content.includes("execution-shadow-read") ||
        content.includes("no execution effect")
      ) {
        return true;
      }
    }
  }
  return false;
}

async function main() {
  const model: CanonicalReadDiagnosticsModel = {
    access: {
      enabled: true,
      nodeEnv: "development",
      diagnosticsFlagEnabled: true,
    },
    availability: {
      configured: true,
      state: "available",
      targetSummary: "127.0.0.1:5432/hebun_test",
      hostClass: "local",
      localTargetValid: true,
      healthCheckResult: "passed",
      queryTimeoutMs: 5000,
      databaseUrlEnv: "HEBUN_CANONICAL_READ_DATABASE_URL",
      allowRemoteEnv: "HEBUN_CANONICAL_READ_ALLOW_REMOTE",
      diagnosticsEnv: "HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS",
      warnings: [],
    },
    persistence: {
      activeProvider: "memory",
      providers: [
        {
          key: "memory",
          label: "Memory",
          status: "active",
          active: true,
          capabilities: ["list"],
          collections: [],
          health: { state: "healthy", provider: "memory" },
        },
        {
          key: "postgres",
          label: "PostgreSQL",
          status: "available",
          active: false,
          capabilities: ["list", "health"],
          collections: [],
          health: { state: "unconfigured", provider: "postgres" },
        },
      ],
    },
    knowledgeRepository: {
      repository: "knowledge",
      authoritativeProvider: "memory",
      authoritativeCapabilities: {
        read: true,
        write: false,
        shadow: false,
      },
      shadowProvider: "postgres",
      shadowCapabilities: {
        read: true,
        write: false,
        shadow: true,
      },
      readSource: "memory",
      shadowAvailable: false,
    },
    knowledgeReadRouting: {
      routingDecision: "authoritative-only",
      authoritativeProvider: "memory",
      shadowProvider: "postgres",
      comparisonStatus: "skipped",
      latencyMs: 1,
      rolloutDecision: "feature-disabled",
      observedAt: "2026-07-12T10:00:00.000Z",
    },
    knowledgeSilentDualReadRollout: {
      enabled: false,
      disabled: true,
      samplePercentage: 0,
      tenantEligible: null,
      killSwitchActive: false,
      reason: "feature-disabled",
    },
    actor: { kind: "actor", enabled: false, title: "Actor", description: "d", fields: [], inputErrors: [] },
    actorShadow: { kind: "actor-shadow", enabled: false, title: "Actor Shadow", description: "d", fields: [], inputErrors: [] },
    knowledge: { kind: "knowledge", enabled: false, title: "Knowledge", description: "d", fields: [], inputErrors: [] },
    knowledgeShadow: { kind: "knowledge-shadow", enabled: false, title: "Knowledge Shadow", description: "d", fields: [], inputErrors: [] },
    executionShadow: {
      kind: "execution-shadow",
      enabled: true,
      title: "Execution Shadow Read",
      description: "d",
      fields: [],
      inputErrors: [],
      result: {
        kind: "execution-shadow-read",
        input: {
          tenantId: "11111111-1111-4111-8111-111111111111",
          executionId: "22222222-2222-4222-8222-222222222222",
        },
        status: "partial-match",
        memory: {
          found: true,
          summary: {
            source: "execution-session",
            execution: { id: "exec-1", legacyStatus: "running" },
            completeness: "partial",
            warnings: [],
          } as never,
        },
        postgres: {
          found: true,
          availability: {
            available: true,
            configured: true,
            source: "postgres",
            warnings: [],
          },
          summary: {
            execution: { id: "exec-1", legacyStatus: "running" },
            completeness: "complete",
            warnings: [],
          } as never,
        },
        sourceAvailability: {
          memory: "available",
          postgres: "available",
        },
        diff: {
          matchedFields: [],
          mismatches: [],
          nonComparableFields: [],
          missingFields: [],
          mismatchCategories: [],
        },
        warnings: ["The current memory execution runtime does not carry a canonical command lineage row."],
        comparedAt: "2026-07-12T10:00:00.000Z",
      },
    },
    execution: { kind: "execution", enabled: false, title: "Execution", description: "d", fields: [], inputErrors: [] },
    lastDiagnosticAttempt: "2026-07-12T10:00:00.000Z",
  };

  const html = render(model);
  assert.match(html, /shadow only/i);
  assert.match(html, /no execution effect/i);
  assert.match(html, /memory authoritative/i);
  assert.doesNotMatch(html, /repair|replay|dispatch|retry/i);
  assert.equal(activeProvider(), "memory");
  assert.deepEqual(collectImports(join(process.cwd(), "src")), [
    "src/components/canonical-read/diagnostics-page.tsx",
    "src/features/canonical-read/diagnostics.ts",
  ]);
  assert.equal(clientBundleContainsExecutionShadow(), false);

  console.log("execution-shadow-read diagnostics checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
