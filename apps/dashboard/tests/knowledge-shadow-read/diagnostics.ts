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
        if (fullPath.includes("knowledge-shadow-read")) continue;
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;
      const content = readFileSync(fullPath, "utf8");
      if (
        content.includes('from "@/features/knowledge-shadow-read"') ||
        content.includes("from '../../src/features/knowledge-shadow-read'") ||
        content.includes('from "../../src/features/knowledge-shadow-read"')
      ) {
        matches.push(fullPath.replace(`${process.cwd()}/`, ""));
      }
    }
  }
  return matches.sort();
}

function clientBundleContainsShadowRead(): boolean {
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
        content.includes("knowledge-shadow-read") ||
        content.includes("shadow only") ||
        content.includes("No memory Knowledge node matched the requested factKey")
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
      samplePercentage: 25,
      tenantEligible: true,
      killSwitchActive: false,
      reason: "sample-excluded",
    },
    actor: {
      kind: "actor",
      enabled: false,
      title: "Actor",
      description: "desc",
      fields: [],
      inputErrors: [],
    },
    actorShadow: {
      kind: "actor-shadow",
      enabled: false,
      title: "Actor Shadow",
      description: "desc",
      fields: [],
      inputErrors: [],
    },
    knowledge: {
      kind: "knowledge",
      enabled: false,
      title: "Knowledge",
      description: "desc",
      fields: [],
      inputErrors: [],
    },
    knowledgeShadow: {
      kind: "knowledge-shadow",
      enabled: true,
      title: "Knowledge Shadow Read",
      description: "desc",
      fields: [],
      inputErrors: [],
      result: {
        kind: "knowledge-shadow-read",
        input: {
          tenantId: "11111111-1111-4111-8111-111111111111",
          factKey: "goals-goal-1",
          domainKey: "goals",
          knowledgeScope: "company-wide",
        },
        status: "not-found",
        memory: {
          found: false,
        },
        postgres: {
          found: false,
          availability: {
            available: true,
            configured: true,
            source: "postgres",
            warnings: [],
          },
          reason: "fact-not-found",
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
        warnings: [],
        comparedAt: "2026-07-12T10:00:00.000Z",
      },
    },
    executionShadow: {
      kind: "execution-shadow",
      enabled: false,
      title: "Execution Shadow",
      description: "desc",
      fields: [],
      inputErrors: [],
    },
    execution: {
      kind: "execution",
      enabled: false,
      title: "Execution",
      description: "desc",
      fields: [],
      inputErrors: [],
    },
    lastDiagnosticAttempt: "2026-07-12T10:00:00.000Z",
  };

  const html = render(model);
  assert.match(html, /shadow only/i);
  assert.match(html, /no runtime effect/i);
  assert.match(html, /memory authoritative/i);
  assert.match(html, /Knowledge Silent Dual Read Rollout/i);
  assert.match(html, /Persistence Providers/i);
  assert.match(html, /Knowledge Read Routing/i);
  assert.match(html, /PostgreSQL/i);
  assert.match(html, /Sample Percentage/i);
  assert.match(html, /Kill Switch Active/i);
  assert.match(html, /No memory representation found/i);
  assert.match(html, /No canonical PostgreSQL representation found/i);
  assert.match(html, /Both sources were queried successfully/i);
  assert.match(html, /No mismatch exists because there is nothing to compare/i);
  assert.doesNotMatch(html, /repair|apply|select|ratify|sync|overwrite|promote|resolve/i);
  assert.equal(activeProvider(), "memory");

  const imports = collectImports(join(process.cwd(), "src"));
  assert.deepEqual(imports, [
    "src/components/canonical-read/diagnostics-page.tsx",
    "src/features/canonical-read/diagnostics.ts",
    "src/features/knowledge-silent-dual-read/hook.ts",
  ]);
  assert.equal(clientBundleContainsShadowRead(), false);

  console.log("knowledge-shadow-read diagnostics checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
