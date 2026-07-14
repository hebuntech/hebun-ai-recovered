import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CanonicalReadDiagnosticsPage } from "../../src/components/canonical-read/diagnostics-page";
import {
  buildCanonicalReadDiagnosticsModel,
  getCanonicalReadDiagnosticsAccess,
  summarizeAvailability,
  type CanonicalReadDiagnosticsModel,
} from "../../src/features/canonical-read/diagnostics";
import { activeProvider } from "../../src/features/persistence/storage-manager";
import { sidebarConfig } from "../../src/config/sidebar.config";
import type { CanonicalReadServices } from "../../src/features/canonical-read";

function createStubServices(): CanonicalReadServices {
  return {
    availability: async () => ({
      available: false,
      configured: false,
      source: "postgres",
      reason: "missing_database_url",
      warnings: ["HEBUN_CANONICAL_READ_DATABASE_URL is not set."],
    }),
    dispose: async () => undefined,
    resolveActor: async () => {
      throw new Error("actor query should not run");
    },
    selectCanonicalKnowledgeFact: async () => {
      throw new Error("knowledge query should not run");
    },
    getExecutionLineage: async () => {
      throw new Error("lineage query should not run");
    },
  };
}

function renderModel(model: CanonicalReadDiagnosticsModel): string {
  return renderToStaticMarkup(
    createElement(CanonicalReadDiagnosticsPage, { model }),
  );
}

function hasInternalNavEntry(): boolean {
  return sidebarConfig.some((section) =>
    section.groups.some((group) =>
      group.items.some((item) => item.href === "/_internal/canonical-read"),
    ),
  );
}

function staticFilesContainCanonicalPgBundle(): boolean {
  const staticDir = join(process.cwd(), ".next", "static");
  if (!existsSync(staticDir)) {
    return false;
  }

  const stack = [staticDir];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
      const content = readFileSync(fullPath, "utf8");
      if (
        content.includes("HEBUN_CANONICAL_READ_DATABASE_URL") ||
        content.includes("hebun-canonical-read") ||
        content.includes("begin read only")
      ) {
        return true;
      }
    }
  }

  return false;
}

async function main() {
  assert.equal(
    getCanonicalReadDiagnosticsAccess({
      NODE_ENV: "development",
      HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS: "false",
    }).enabled,
    false,
  );
  assert.equal(
    getCanonicalReadDiagnosticsAccess({
      NODE_ENV: "production",
      HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS: "true",
    }).enabled,
    false,
  );
  assert.equal(
    getCanonicalReadDiagnosticsAccess({
      NODE_ENV: "development",
      HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS: "true",
    }).enabled,
    true,
  );

  const unavailableModel = await buildCanonicalReadDiagnosticsModel(
    {},
    {
      env: {
        NODE_ENV: "development",
        HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS: "true",
        HEBUN_CANONICAL_READ_DATABASE_URL:
          "postgresql://user:supersecret@127.0.0.1:5432/hebun_local",
      },
      services: createStubServices(),
    },
  );
  const unavailableHtml = renderModel(unavailableModel);
  assert.match(unavailableHtml, /Canonical Read Diagnostics/);
  assert.match(unavailableHtml, /Knowledge Repository/);
  assert.match(unavailableHtml, /Knowledge Read Routing/);
  assert.match(unavailableHtml, /missing_database_url/);
  assert.doesNotMatch(unavailableHtml, /supersecret/);
  assert.doesNotMatch(unavailableHtml, /postgresql:\/\/user/);

  const invalidInputModel = await buildCanonicalReadDiagnosticsModel(
    {
      inspect: "actor",
      actorTenantId: "bad-id",
      actorType: "human",
      actorId: "also-bad",
    },
    {
      env: {
        NODE_ENV: "development",
        HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS: "true",
      },
      services: createStubServices(),
    },
  );
  const invalidHtml = renderModel(invalidInputModel);
  assert.match(invalidHtml, /Actor tenantId must be a UUID/);
  assert.match(invalidHtml, /Actor actorId must be a UUID/);

  const summary = summarizeAvailability({
    available: false,
    configured: true,
    source: "postgres",
    reason: "connection_failed",
    target: {
      host: "127.0.0.1",
      port: 5432,
      database: "hebun_test",
      local: true,
    },
    warnings: ["password authentication failed for user postgres"],
  });
  assert.deepEqual(summary.warnings, ["PostgreSQL health check failed."]);

  const actorModel: CanonicalReadDiagnosticsModel = {
    access: {
      enabled: true,
      nodeEnv: "development",
      diagnosticsFlagEnabled: true,
    },
    availability: summarizeAvailability({
      available: true,
      configured: true,
      source: "postgres",
      target: { host: "127.0.0.1", port: 5432, database: "hebun_test", local: true },
      checkedAt: "2026-07-12T10:00:00.000Z",
      latencyMs: 4,
      warnings: [],
    }),
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
          health: {
            state: "healthy",
            provider: "memory",
          },
        },
        {
          key: "postgres",
          label: "PostgreSQL",
          status: "available",
          active: false,
          capabilities: ["list", "health"],
          collections: [],
          health: {
            state: "unconfigured",
            provider: "postgres",
            detail: "HEBUN_PERSISTENCE_POSTGRES_DATABASE_URL is not set.",
          },
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
    actor: {
      kind: "actor",
      enabled: true,
      title: "Actor Resolution",
      description: "desc",
      fields: [],
      inputErrors: [],
      result: {
        kind: "actor-resolution",
        status: "resolved",
        resolved: true,
        availability: {
          available: true,
          configured: true,
          source: "postgres",
          warnings: [],
        },
        actorRef: {
          tenantId: "11111111-1111-4111-8111-111111111111",
          actorType: "human",
          actorId: "22222222-2222-4222-8222-222222222222",
        },
        displayLabel: "Alice",
        tenantMatch: true,
        lifecycleStatus: "active",
        active: true,
        suspended: false,
        archived: false,
        sourceTable: "users",
        membershipSummary: {
          membershipId: "33333333-3333-4333-8333-333333333333",
          tenantId: "11111111-1111-4111-8111-111111111111",
          roleName: "Owner",
        },
        warnings: [],
      },
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
      enabled: false,
      title: "Knowledge Shadow",
      description: "desc",
      fields: [],
      inputErrors: [],
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
  const actorHtml = renderModel(actorModel);
  assert.match(actorHtml, /Alice/);
  assert.match(actorHtml, /Membership Summary/);

  const knowledgeModel: CanonicalReadDiagnosticsModel = {
    ...actorModel,
    actor: { ...actorModel.actor, enabled: false, result: undefined },
    knowledge: {
      kind: "knowledge",
      enabled: true,
      title: "Knowledge",
      description: "desc",
      fields: [],
      inputErrors: [],
      result: {
        kind: "canonical-knowledge-fact",
        status: "resolved",
        resolved: true,
        availability: {
          available: true,
          configured: true,
          source: "postgres",
          warnings: [],
        },
        identity: {
          tenantId: "11111111-1111-4111-8111-111111111111",
          factKey: "fact.ops.current",
          domainKey: "ops",
          knowledgeScope: "domain",
        },
        fact: {
          tenantId: "11111111-1111-4111-8111-111111111111",
          factKey: "fact.ops.current",
          domainKey: "ops",
          knowledgeScope: "domain",
          factVersion: 3,
        },
        activeNode: {
          id: "44444444-4444-4444-8444-444444444444",
          type: "fact",
          label: "Ops truth",
          lifecycleStatus: "ratified",
          health: "current",
          authority: "authoritative",
          knowledgeVersion: 5,
        },
        warnings: [],
      },
    },
  };
  const knowledgeHtml = renderModel(knowledgeModel);
  assert.match(knowledgeHtml, /fact\.ops\.current/);
  assert.match(knowledgeHtml, /Active Knowledge Node/);

  const executionModel: CanonicalReadDiagnosticsModel = {
    ...knowledgeModel,
    knowledge: { ...knowledgeModel.knowledge, enabled: false, result: undefined },
    execution: {
      kind: "execution",
      enabled: true,
      title: "Execution",
      description: "desc",
      fields: [],
      inputErrors: [],
      result: {
        kind: "execution-lineage",
        status: "partial",
        availability: {
          available: true,
          configured: true,
          source: "postgres",
          warnings: [],
        },
        executionId: "55555555-5555-4555-8555-555555555555",
        tenantId: "11111111-1111-4111-8111-111111111111",
        completeness: "partial",
        execution: {
          id: "55555555-5555-4555-8555-555555555555",
          tenantId: "11111111-1111-4111-8111-111111111111",
          lifecycleStatus: "executing",
          legacyStatus: "running",
        },
        command: {
          id: "66666666-6666-4666-8666-666666666666",
          tenantId: "11111111-1111-4111-8111-111111111111",
          legacyStatus: "running",
          lifecycleStatus: "executing",
          correlationId: "corr-1",
          causationId: "cause-1",
          idempotencyKey: "idem-1",
        },
        warnings: [
          {
            code: "missing-plan-link",
            message: "Lineage does not resolve to a Plan.",
            severity: "warning",
          },
        ],
        reason: "dual-shape-or-missing-link-warning",
      },
    },
  };
  const executionHtml = renderModel(executionModel);
  assert.match(executionHtml, /Lineage Warnings/);
  assert.match(executionHtml, /missing-plan-link/);

  const mismatchHtml = renderModel({
    ...actorModel,
    actor: {
      ...actorModel.actor,
      enabled: true,
      result: {
        ...actorModel.actor.result!,
        status: "tenant-mismatch",
        resolved: false,
        tenantMatch: false,
        active: false,
        warnings: ["User exists, but no membership was found for the tenant."],
        reason: "membership-missing-for-tenant",
      },
    },
  });
  assert.match(mismatchHtml, /tenant-mismatch/);

  const unresolvedHtml = renderModel({
    ...actorModel,
    actor: {
      ...actorModel.actor,
      enabled: true,
      result: {
        ...actorModel.actor.result!,
        status: "unresolved",
        resolved: false,
        actorRef: {
          tenantId: "11111111-1111-4111-8111-111111111111",
          actorType: "system",
          actorId: "77777777-7777-4777-8777-777777777777",
        },
        displayLabel: undefined,
        sourceTable: undefined,
        membershipSummary: undefined,
        warnings: ["System and service actors do not have canonical rows yet."],
        reason: "registry-required",
      },
    },
  });
  assert.match(unresolvedHtml, /registry-required/);

  assert.equal(activeProvider(), "memory");
  assert.equal(hasInternalNavEntry(), false);
  assert.equal(existsSync("src/app/_internal/canonical-read/route.ts"), false);
  assert.equal(staticFilesContainCanonicalPgBundle(), false);

  console.log("canonical-read diagnostics checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
