import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Database, Search, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  CanonicalReadDiagnosticsAvailabilityView,
  CanonicalReadDiagnosticsFormField,
  CanonicalReadDiagnosticsInspectorView,
  CanonicalReadDiagnosticsModel,
} from "@/features/canonical-read/diagnostics";
import type { KnowledgeSilentDualReadRolloutDiagnosticsView } from "@/features/knowledge-silent-dual-read";
import type { PersistenceProviderDescriptor } from "@/features/persistence";
import type {
  ActorResolutionResult,
  CanonicalKnowledgeFactResult,
  ExecutionLineageResult,
  LineageNodeReference,
} from "@/features/canonical-read";
import type { ActorShadowReadResult } from "@/features/actor-shadow-read";
import type { ExecutionShadowReadResult } from "@/features/execution-shadow-read";
import type { KnowledgeShadowReadResult } from "@/features/knowledge-shadow-read";

function badgeVariantForState(state: string): BadgeVariant {
  switch (state) {
    case "available":
    case "resolved":
    case "complete":
    case "passed":
      return "success";
    case "partial":
    case "degraded":
    case "tenant-mismatch":
      return "warning";
    case "not-found":
    case "unresolved":
    case "unavailable":
    case "failed":
      return "error";
    default:
      return "neutral";
  }
}

function FormField({ field }: { field: CanonicalReadDiagnosticsFormField }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-[0.12em] text-fg-secondary uppercase">
        {field.label}
      </span>
      <input
        name={field.name}
        defaultValue={field.value}
        placeholder={field.placeholder}
        required={field.required}
        className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-fg outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}

function ValueRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-border/60 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
      <div className="text-xs font-semibold tracking-[0.12em] text-fg-secondary uppercase">
        {label}
      </div>
      <div className="min-w-0 text-sm text-fg">{value ?? <span className="text-fg-muted">None</span>}</div>
    </div>
  );
}

function WarningList({ warnings }: { warnings: readonly string[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="rounded-lg border border-warning/20 bg-warning-subtle/40 p-3 text-sm text-warning">
      <div className="mb-2 flex items-center gap-2 font-medium">
        <AlertTriangle className="size-4" />
        Warnings
      </div>
      <ul className="space-y-1">
        {warnings.map((warning) => (
          <li key={warning}>• {warning}</li>
        ))}
      </ul>
    </div>
  );
}

function ShadowNotFoundState() {
  return (
    <Card className="border-border/60 bg-surface-raised">
      <CardHeader className="p-4">
        <CardTitle className="text-sm">No Records Found</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0 text-sm text-fg-secondary">
        <div>No memory representation found.</div>
        <div>No canonical PostgreSQL representation found.</div>
        <div>Both sources were queried successfully.</div>
        <div>No mismatch exists because there is nothing to compare.</div>
      </CardContent>
    </Card>
  );
}

function ShadowBoundaryBadges({
  effectLabel,
  status,
}: {
  effectLabel: string;
  status: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="warning">shadow only</Badge>
      <Badge variant="warning">{effectLabel}</Badge>
      <Badge variant="warning">memory authoritative</Badge>
      <Badge variant={badgeVariantForState(status)}>{status}</Badge>
    </div>
  );
}

function renderShadowValue(value: unknown): string {
  if (value == null) return "None";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function ShadowComparisonGroup({
  title,
  fields,
  labelForField,
}: {
  title: string;
  fields: readonly {
    field: string;
    status: string;
    note?: string;
    memoryValue?: unknown;
    postgresValue?: unknown;
    node?: string;
  }[];
  labelForField?: (field: {
    field: string;
    node?: string;
  }) => string;
}) {
  if (fields.length === 0) return null;

  return (
    <Card className="border-border/60 bg-surface-raised">
      <CardHeader className="p-4">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {fields.map((field) => (
          <div
            key={`${title}-${field.node ?? "field"}-${field.field}`}
            className="rounded-lg border border-border/60 p-3"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="text-sm font-medium text-fg">
                {labelForField ? labelForField(field) : field.field}
              </div>
              <Badge variant={badgeVariantForState(field.status)}>{field.status}</Badge>
            </div>
            <div className="grid gap-3 text-sm xl:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-semibold tracking-[0.12em] text-fg-secondary uppercase">
                  Memory
                </div>
                <div className="break-all text-fg-secondary">
                  {renderShadowValue(field.memoryValue)}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold tracking-[0.12em] text-fg-secondary uppercase">
                  PostgreSQL
                </div>
                <div className="break-all text-fg-secondary">
                  {renderShadowValue(field.postgresValue)}
                </div>
              </div>
            </div>
            {field.note ? (
              <div className="mt-2 text-xs leading-6 text-fg-muted">{field.note}</div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ShadowMismatchTaxonomy({
  categories,
}: {
  categories: readonly string[];
}) {
  if (categories.length === 0) return null;

  return (
    <Card className="border-border/60 bg-surface-raised">
      <CardHeader className="p-4">
        <CardTitle className="text-sm">Mismatch Taxonomy</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 p-4 pt-0">
        {categories.map((category) => (
          <Badge key={category} variant="neutral">
            {category}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}

function JsonDetails({ label, value }: { label: string; value: unknown }) {
  return (
    <details className="rounded-lg border border-border bg-surface-raised">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-fg">
        {label}
      </summary>
      <pre className="overflow-x-auto border-t border-border/60 px-4 py-3 text-xs leading-6 text-fg-secondary">
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}

function renderAvailability(availability: CanonicalReadDiagnosticsAvailabilityView) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Availability and Health</CardTitle>
          <CardDescription>
            Optional PostgreSQL canonical-read health. Memory remains authoritative.
          </CardDescription>
        </div>
        <Badge variant={badgeVariantForState(availability.state)}>
          {availability.state}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-2">
          <ValueRow label="Configured" value={availability.configured ? "Yes" : "No"} />
          <ValueRow label="Target" value={availability.targetSummary} />
          <ValueRow label="Host Class" value={availability.hostClass} />
          <ValueRow
            label="Local Target Validation"
            value={availability.localTargetValid ? "Valid" : "Rejected"}
          />
          <ValueRow label="Health Check" value={availability.healthCheckResult} />
          <ValueRow label="Query Timeout" value={`${availability.queryTimeoutMs} ms`} />
          <ValueRow
            label="Last Diagnostic Attempt"
            value={availability.checkedAt ?? "Not attempted"}
          />
          <ValueRow
            label="Sanitized Error Category"
            value={availability.sanitizedErrorCategory ?? "None"}
          />
        </div>
        <WarningList warnings={availability.warnings} />
        <div className="rounded-lg border border-border/60 bg-surface-sunken px-4 py-3 text-xs leading-6 text-fg-secondary">
          <div>{availability.databaseUrlEnv} controls the optional read-only database target.</div>
          <div>{availability.allowRemoteEnv}=true is required for non-local diagnostics targets.</div>
          <div>{availability.diagnosticsEnv}=true is required to expose this page in development.</div>
        </div>
      </CardContent>
    </Card>
  );
}

function renderKnowledgeSilentDualReadRollout(
  rollout: KnowledgeSilentDualReadRolloutDiagnosticsView,
) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Knowledge Silent Dual Read Rollout</CardTitle>
          <CardDescription>
            Internal rollout controls for the existing shadow comparison hook. Memory remains authoritative.
          </CardDescription>
        </div>
        <Badge variant={badgeVariantForState(rollout.enabled ? "available" : "unavailable")}>
          {rollout.enabled ? "enabled" : "disabled"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-2">
          <ValueRow label="Rollout Enabled" value={rollout.enabled ? "Yes" : "No"} />
          <ValueRow label="Rollout Disabled" value={rollout.disabled ? "Yes" : "No"} />
          <ValueRow label="Sample Percentage" value={`${rollout.samplePercentage}%`} />
          <ValueRow
            label="Tenant Eligible"
            value={
              rollout.tenantEligible == null
                ? "Not provided"
                : rollout.tenantEligible
                  ? "Yes"
                  : "No"
            }
          />
          <ValueRow
            label="Kill Switch Active"
            value={rollout.killSwitchActive ? "Yes" : "No"}
          />
          <ValueRow label="Decision Reason" value={rollout.reason ?? "None"} />
        </div>
      </CardContent>
    </Card>
  );
}

function renderPersistenceProviders(
  persistence: CanonicalReadDiagnosticsModel["persistence"],
) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Persistence Providers</CardTitle>
          <CardDescription>
            Internal persistence registration state. Memory remains active and authoritative.
          </CardDescription>
        </div>
        <Badge variant="neutral">{persistence.activeProvider}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <ValueRow label="Active Provider" value={persistence.activeProvider} />
        <div className="grid gap-4 xl:grid-cols-2">
          {persistence.providers.map((provider) => (
            <PersistenceProviderCard key={provider.key} provider={provider} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function renderKnowledgeReadRouting(
  routing: CanonicalReadDiagnosticsModel["knowledgeReadRouting"],
) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Knowledge Read Routing</CardTitle>
          <CardDescription>
            Production-shaped routing infrastructure. Memory remains authoritative and PostgreSQL is shadow-only.
          </CardDescription>
        </div>
        <Badge
          variant={badgeVariantForState(
            routing.routingDecision === "authoritative-with-shadow"
              ? "partial"
              : "available",
          )}
        >
          {routing.routingDecision}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        <ValueRow label="Authoritative Provider" value={routing.authoritativeProvider} />
        <ValueRow label="Shadow Provider" value={routing.shadowProvider} />
        <ValueRow label="Comparison Status" value={routing.comparisonStatus ?? "None"} />
        <ValueRow
          label="Latency"
          value={routing.latencyMs == null ? "None" : `${routing.latencyMs.toFixed(2)} ms`}
        />
        <ValueRow label="Rollout Decision" value={routing.rolloutDecision ?? "None"} />
        <ValueRow label="Observed At" value={routing.observedAt ?? "None"} />
      </CardContent>
    </Card>
  );
}

function renderKnowledgeRepository(
  repository: CanonicalReadDiagnosticsModel["knowledgeRepository"],
) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Knowledge Repository</CardTitle>
          <CardDescription>
            Canonical repository infrastructure only. Memory remains the read source and PostgreSQL remains shadow-only.
          </CardDescription>
        </div>
        <Badge variant="neutral">{repository.repository}</Badge>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        <ValueRow label="Repository" value={repository.repository} />
        <ValueRow
          label="Authoritative Provider"
          value={repository.authoritativeProvider}
        />
        <ValueRow label="Read Source" value={repository.readSource} />
        <ValueRow label="Shadow Provider" value={repository.shadowProvider} />
        <ValueRow
          label="Authoritative Capabilities"
          value={Object.entries(repository.authoritativeCapabilities)
            .filter(([, enabled]) => enabled)
            .map(([key]) => key)
            .join(", ")}
        />
        <ValueRow
          label="Shadow Capabilities"
          value={Object.entries(repository.shadowCapabilities)
            .filter(([, enabled]) => enabled)
            .map(([key]) => key)
            .join(", ")}
        />
        <ValueRow
          label="Shadow Availability"
          value={repository.shadowAvailable ? "Available" : "Unavailable"}
        />
      </CardContent>
    </Card>
  );
}

function PersistenceProviderCard({
  provider,
}: {
  provider: PersistenceProviderDescriptor;
}) {
  return (
    <Card className="border-border/60 bg-surface-raised">
      <CardHeader className="p-4">
        <div>
          <CardTitle className="text-sm">{provider.label}</CardTitle>
          <CardDescription>{provider.status}</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={provider.active ? "success" : "neutral"}>
            {provider.active ? "active" : "available"}
          </Badge>
          <Badge
            variant={badgeVariantForState(
              provider.health.state === "healthy"
                ? "available"
                : provider.health.state === "unconfigured"
                  ? "degraded"
                  : "unavailable",
            )}
          >
            {provider.health.state}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <ValueRow label="Provider Key" value={provider.key} />
        <ValueRow
          label="Capabilities"
          value={provider.capabilities.join(", ")}
        />
        <ValueRow
          label="Collections"
          value={provider.collections.length > 0 ? provider.collections.join(", ") : "None"}
        />
        <ValueRow label="Health Detail" value={provider.health.detail ?? "None"} />
      </CardContent>
    </Card>
  );
}

function ActorResultView({ result }: { result: ActorResolutionResult }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={badgeVariantForState(result.status)}>{result.status}</Badge>
        {result.lifecycleStatus ? (
          <Badge variant="neutral">{result.lifecycleStatus}</Badge>
        ) : null}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ValueRow label="Resolved" value={result.resolved ? "Yes" : "No"} />
        <ValueRow label="Display Label" value={result.displayLabel ?? "Unavailable"} />
        <ValueRow label="Tenant Match" value={result.tenantMatch ? "Yes" : "No"} />
        <ValueRow label="Source Table" value={result.sourceTable ?? "None"} />
        <ValueRow label="Active" value={result.active ? "Yes" : "No"} />
        <ValueRow label="Suspended" value={result.suspended ? "Yes" : "No"} />
        <ValueRow label="Archived" value={result.archived ? "Yes" : "No"} />
        <ValueRow label="Reason" value={result.reason ?? "None"} />
      </div>
      {result.membershipSummary ? (
        <Card className="border-border/60 bg-surface-raised">
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Membership Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ValueRow label="Membership ID" value={result.membershipSummary.membershipId} />
            <ValueRow label="Role" value={result.membershipSummary.roleName ?? "None"} />
            <ValueRow label="Role Type" value={result.membershipSummary.roleType ?? "None"} />
            <ValueRow
              label="Authority Scope"
              value={result.membershipSummary.authorityScope ?? "None"}
            />
          </CardContent>
        </Card>
      ) : null}
      {result.humanOwnerSummary ? (
        <Card className="border-border/60 bg-surface-raised">
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Human Owner Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ValueRow label="Actor Type" value={result.humanOwnerSummary.actorType ?? "None"} />
            <ValueRow label="Actor ID" value={result.humanOwnerSummary.actorId ?? "None"} />
            <ValueRow
              label="Display Label"
              value={result.humanOwnerSummary.displayLabel ?? "None"}
            />
          </CardContent>
        </Card>
      ) : null}
      <WarningList warnings={result.warnings} />
      <JsonDetails label="Sanitized Actor Result JSON" value={result} />
    </div>
  );
}

function KnowledgeResultView({ result }: { result: CanonicalKnowledgeFactResult }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={badgeVariantForState(result.status)}>{result.status}</Badge>
        {result.activeNode?.lifecycleStatus ? (
          <Badge variant="neutral">{result.activeNode.lifecycleStatus}</Badge>
        ) : null}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ValueRow label="Fact Key" value={result.identity.factKey} />
        <ValueRow label="Domain Key" value={result.identity.domainKey} />
        <ValueRow label="Knowledge Scope" value={result.identity.knowledgeScope} />
        <ValueRow label="Reason" value={result.reason ?? "None"} />
      </div>
      {result.fact ? (
        <Card className="border-border/60 bg-surface-raised">
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Canonical Fact Identity</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ValueRow label="Fact Version" value={result.fact.factVersion} />
            <ValueRow label="Selected At" value={result.fact.selectedAt ?? "None"} />
            <ValueRow
              label="Selected By"
              value={
                result.fact.selectedByActorType && result.fact.selectedByActorId
                  ? `${result.fact.selectedByActorType}:${result.fact.selectedByActorId}`
                  : "None"
              }
            />
            <ValueRow
              label="Ratification Decision"
              value={result.fact.ratificationDecisionId ?? "None"}
            />
          </CardContent>
        </Card>
      ) : null}
      {result.activeNode ? (
        <Card className="border-border/60 bg-surface-raised">
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Active Knowledge Node</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ValueRow label="Node ID" value={result.activeNode.id} />
            <ValueRow label="Label" value={result.activeNode.label} />
            <ValueRow label="Statement" value={result.activeNode.statement ?? "None"} />
            <ValueRow label="Health" value={result.activeNode.health ?? "None"} />
            <ValueRow label="Authority" value={result.activeNode.authority ?? "None"} />
            <ValueRow label="Version" value={result.activeNode.knowledgeVersion} />
            <ValueRow
              label="Effective Window"
              value={`${result.activeNode.effectiveFrom ?? "open"} → ${result.activeNode.effectiveUntil ?? "open"}`}
            />
            <ValueRow label="Next Review" value={result.activeNode.nextReviewAt ?? "None"} />
            <ValueRow
              label="Freshness Evaluated"
              value={result.activeNode.freshnessEvaluatedAt ?? "None"}
            />
          </CardContent>
        </Card>
      ) : null}
      <WarningList warnings={result.warnings} />
      <JsonDetails label="Sanitized Knowledge Result JSON" value={result} />
    </div>
  );
}

function ActorShadowResultView({
  result,
}: {
  result: ActorShadowReadResult;
}) {
  return (
    <div className="space-y-4">
      <ShadowBoundaryBadges
        effectLabel="no authorization effect"
        status={result.status}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <ValueRow label="Tenant ID" value={result.input.tenantId} />
        <ValueRow label="Actor Type" value={result.input.actorType} />
        <ValueRow label="Actor ID" value={result.input.actorId} />
        <ValueRow
          label="Memory Source"
          value={result.memory.summary?.source ?? (result.memory.found ? "Found" : "Missing")}
        />
        <ValueRow
          label="Canonical Source"
          value={result.postgres.summary?.source ?? result.postgres.reason ?? "Missing"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/60 bg-surface-raised">
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Memory Actor Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {result.memory.summary ? (
              <>
                <ValueRow label="Display Label" value={result.memory.summary.displayLabel ?? "None"} />
                <ValueRow label="Lifecycle" value={result.memory.summary.lifecycleStatus ?? "None"} />
                <ValueRow
                  label="State Flags"
                  value={`${result.memory.summary.active ? "active" : "inactive"} / ${result.memory.summary.suspended ? "suspended" : "not-suspended"} / ${result.memory.summary.archived ? "archived" : "not-archived"}`}
                />
                <ValueRow label="Department" value={result.memory.summary.department ?? "None"} />
                <ValueRow label="Agent Type" value={result.memory.summary.agentType ?? "None"} />
                <ValueRow label="Health" value={result.memory.summary.health ?? "None"} />
                <ValueRow label="Risk" value={result.memory.summary.riskLevel ?? "None"} />
                <ValueRow
                  label="Owner / Manager"
                  value={`${result.memory.summary.ownership?.humanOwnerDisplayLabel ?? "None"} / ${result.memory.summary.ownership?.managerDisplayLabel ?? "None"}`}
                />
              </>
            ) : (
              <div className="text-sm text-fg-muted">
                No memory actor summary is available for this comparison.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-surface-raised">
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Canonical PostgreSQL Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {result.postgres.summary ? (
              <>
                <ValueRow label="Display Label" value={result.postgres.summary.displayLabel ?? "None"} />
                <ValueRow label="Lifecycle" value={result.postgres.summary.lifecycleStatus ?? "None"} />
                <ValueRow
                  label="State Flags"
                  value={`${result.postgres.summary.active ? "active" : "inactive"} / ${result.postgres.summary.suspended ? "suspended" : "not-suspended"} / ${result.postgres.summary.archived ? "archived" : "not-archived"}`}
                />
                <ValueRow label="Source Table" value={result.postgres.summary.sourceTable ?? "None"} />
                <ValueRow label="Department" value={result.postgres.summary.department ?? "None"} />
                <ValueRow label="Agent Type" value={result.postgres.summary.agentType ?? "None"} />
                <ValueRow label="Health" value={result.postgres.summary.health ?? "None"} />
                <ValueRow label="Risk" value={result.postgres.summary.riskLevel ?? "None"} />
                <ValueRow
                  label="Owner / Manager"
                  value={`${result.postgres.summary.ownership?.humanOwnerDisplayLabel ?? "None"} / ${result.postgres.summary.ownership?.managerDisplayLabel ?? "None"}`}
                />
                <ValueRow
                  label="Membership Role"
                  value={result.postgres.summary.membership?.roleName ?? "None"}
                />
              </>
            ) : (
              <div className="text-sm text-fg-muted">
                No canonical PostgreSQL summary is available for this comparison.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result.status === "not-found" ? <ShadowNotFoundState /> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <ShadowComparisonGroup title="Matched Fields" fields={result.diff.matchedFields} />
        <ShadowComparisonGroup title="Mismatched Fields" fields={result.diff.mismatches} />
        <ShadowComparisonGroup
          title="Membership Differences"
          fields={result.diff.membershipDifferences}
        />
        <ShadowComparisonGroup
          title="Authority Differences"
          fields={result.diff.authorityDifferences}
        />
        <ShadowComparisonGroup
          title="Non-Comparable Fields"
          fields={result.diff.nonComparableFields}
        />
        <ShadowComparisonGroup title="Missing Fields" fields={result.diff.missingFields} />
      </div>

      <ShadowMismatchTaxonomy categories={result.diff.mismatchCategories} />

      <WarningList warnings={result.warnings} />
      <JsonDetails label="Actor Shadow Result JSON" value={result} />
    </div>
  );
}

function KnowledgeShadowResultView({
  result,
}: {
  result: KnowledgeShadowReadResult;
}) {
  return (
    <div className="space-y-4">
      <ShadowBoundaryBadges effectLabel="no runtime effect" status={result.status} />

      <div className="grid gap-4 xl:grid-cols-2">
        <ValueRow label="Tenant ID" value={result.input.tenantId} />
        <ValueRow label="Fact Key" value={result.input.factKey} />
        <ValueRow label="Domain Key" value={result.input.domainKey} />
        <ValueRow label="Knowledge Scope" value={result.input.knowledgeScope} />
        <ValueRow
          label="Memory Source"
          value={result.memory.found ? "Found" : "Missing"}
        />
        <ValueRow
          label="PostgreSQL Source"
          value={result.postgres.found ? "Found" : result.postgres.reason ?? "Missing"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/60 bg-surface-raised">
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Memory Source Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {result.memory.summary ? (
              <>
                <ValueRow label="Lookup Key" value={result.memory.summary.lookupKey} />
                <ValueRow label="Lookup Type" value={result.memory.summary.lookupKeyType} />
                <ValueRow label="Node ID" value={result.memory.summary.nodeId} />
                <ValueRow label="Title" value={result.memory.summary.title} />
                <ValueRow
                  label="Statement Summary"
                  value={result.memory.summary.statementSummary}
                />
                <ValueRow
                  label="Lifecycle"
                  value={result.memory.summary.lifecycleStatus}
                />
                <ValueRow label="Version" value={result.memory.summary.version} />
                <ValueRow
                  label="Derived Domain / Scope"
                  value={`${result.memory.summary.domainKey ?? "None"} / ${result.memory.summary.knowledgeScope ?? "None"}`}
                />
              </>
            ) : (
              <div className="text-sm text-fg-muted">
                No memory Knowledge node matched the requested factKey.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-surface-raised">
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Canonical PostgreSQL Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {result.postgres.summary ? (
              <>
                <ValueRow label="Fact Key" value={result.postgres.summary.factKey} />
                <ValueRow
                  label="Domain / Scope"
                  value={`${result.postgres.summary.domainKey} / ${result.postgres.summary.knowledgeScope}`}
                />
                <ValueRow
                  label="Canonical Node"
                  value={result.postgres.summary.nodeId ?? "None"}
                />
                <ValueRow label="Ref ID" value={result.postgres.summary.refId ?? "None"} />
                <ValueRow label="Title" value={result.postgres.summary.title ?? "None"} />
                <ValueRow
                  label="Lifecycle / Authority"
                  value={`${result.postgres.summary.lifecycleStatus ?? "None"} / ${result.postgres.summary.authority ?? "None"}`}
                />
                <ValueRow
                  label="Version / Ratified"
                  value={`${result.postgres.summary.version ?? "None"} / ${result.postgres.summary.ratificationPresent ? "Yes" : "No"}`}
                />
              </>
            ) : (
              <div className="text-sm text-fg-muted">
                No canonical PostgreSQL summary is available for this comparison.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result.status === "not-found" ? <ShadowNotFoundState /> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <ShadowComparisonGroup title="Matched Fields" fields={result.diff.matchedFields} />
        <ShadowComparisonGroup title="Mismatched Fields" fields={result.diff.mismatches} />
        <ShadowComparisonGroup
          title="Non-Comparable Fields"
          fields={result.diff.nonComparableFields}
        />
        <ShadowComparisonGroup title="Missing Fields" fields={result.diff.missingFields} />
      </div>

      <ShadowMismatchTaxonomy categories={result.diff.mismatchCategories} />

      <WarningList warnings={result.warnings} />
      <JsonDetails label="Shadow Read Result JSON" value={result} />
    </div>
  );
}

function LineageNodeBlock({
  title,
  node,
}: {
  title: string;
  node?: LineageNodeReference;
}) {
  return (
    <Card className="border-border/60 bg-surface-raised">
      <CardHeader className="p-4">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {node ? (
          <>
            <ValueRow label="ID" value={node.id} />
            <ValueRow label="Label" value={node.label ?? "None"} />
            <ValueRow label="Version" value={node.version ?? "None"} />
            <ValueRow label="Lifecycle" value={node.lifecycleStatus ?? "None"} />
            <ValueRow label="Legacy Status" value={node.legacyStatus ?? "None"} />
            <ValueRow label="Health" value={node.health ?? "None"} />
          </>
        ) : (
          <div className="text-sm text-fg-muted">No linked record.</div>
        )}
      </CardContent>
    </Card>
  );
}

function ExecutionResultView({ result }: { result: ExecutionLineageResult }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={badgeVariantForState(result.status)}>{result.status}</Badge>
        <Badge variant={badgeVariantForState(result.completeness)}>
          {result.completeness}
        </Badge>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ValueRow label="Execution ID" value={result.executionId} />
        <ValueRow label="Tenant ID" value={result.tenantId} />
        <ValueRow label="Reason" value={result.reason ?? "None"} />
        <ValueRow
          label="Correlation / Causation / Idempotency"
          value={
            result.command
              ? `${result.command.correlationId ?? "None"} / ${result.command.causationId ?? "None"} / ${result.command.idempotencyKey ?? "None"}`
              : "None"
          }
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <LineageNodeBlock title="Execution" node={result.execution} />
        <LineageNodeBlock title="Command" node={result.command} />
        <LineageNodeBlock title="Workflow" node={result.workflow} />
        <LineageNodeBlock title="Task" node={result.task} />
        <LineageNodeBlock title="Plan" node={result.plan} />
        <LineageNodeBlock title="Goal" node={result.goal} />
        <LineageNodeBlock title="Mission" node={result.mission} />
      </div>
      {result.warnings.length > 0 ? (
        <div className="rounded-lg border border-warning/20 bg-warning-subtle/40 p-3 text-sm text-warning">
          <div className="mb-2 flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4" />
            Lineage Warnings
          </div>
          <ul className="space-y-1">
            {result.warnings.map((warning) => (
              <li key={warning.code}>• {warning.message}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <JsonDetails label="Sanitized Lineage Result JSON" value={result} />
    </div>
  );
}

function ExecutionShadowNodeBlock({
  title,
  node,
}: {
  title: string;
  node?: {
    id: string;
    label?: string | null;
    version?: string | number | null;
    lifecycleStatus?: string | null;
    legacyStatus?: string | null;
    health?: string | null;
  };
}) {
  return (
    <Card className="border-border/60 bg-surface-raised">
      <CardHeader className="p-4">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {node ? (
          <>
            <ValueRow label="ID" value={node.id} />
            <ValueRow label="Label" value={node.label ?? "None"} />
            <ValueRow label="Version" value={node.version ?? "None"} />
            <ValueRow label="Lifecycle" value={node.lifecycleStatus ?? "None"} />
            <ValueRow label="Legacy Status" value={node.legacyStatus ?? "None"} />
            <ValueRow label="Health" value={node.health ?? "None"} />
          </>
        ) : (
          <div className="text-sm text-fg-muted">No linked record.</div>
        )}
      </CardContent>
    </Card>
  );
}

function ExecutionShadowResultView({ result }: { result: ExecutionShadowReadResult }) {
  return (
    <div className="space-y-4">
      <ShadowBoundaryBadges effectLabel="no execution effect" status={result.status} />

      <div className="grid gap-4 xl:grid-cols-2">
        <ValueRow label="Tenant ID" value={result.input.tenantId} />
        <ValueRow label="Execution ID" value={result.input.executionId} />
        <ValueRow
          label="Memory Lineage"
          value={result.memory.found ? result.memory.summary?.completeness ?? "Found" : "Missing"}
        />
        <ValueRow
          label="Canonical Lineage"
          value={result.postgres.found ? result.postgres.summary?.completeness ?? "Found" : result.postgres.reason ?? "Missing"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ExecutionShadowNodeBlock title="Memory Execution" node={result.memory.summary?.execution} />
        <ExecutionShadowNodeBlock title="Memory Command" node={result.memory.summary?.command} />
        <ExecutionShadowNodeBlock title="Memory Workflow" node={result.memory.summary?.workflow} />
        <ExecutionShadowNodeBlock title="Memory Task" node={result.memory.summary?.task} />
        <ExecutionShadowNodeBlock title="Memory Plan" node={result.memory.summary?.plan} />
        <ExecutionShadowNodeBlock title="Memory Goal" node={result.memory.summary?.goal} />
        <ExecutionShadowNodeBlock title="Memory Mission" node={result.memory.summary?.mission} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ExecutionShadowNodeBlock title="Canonical Execution" node={result.postgres.summary?.execution} />
        <ExecutionShadowNodeBlock title="Canonical Command" node={result.postgres.summary?.command} />
        <ExecutionShadowNodeBlock title="Canonical Workflow" node={result.postgres.summary?.workflow} />
        <ExecutionShadowNodeBlock title="Canonical Task" node={result.postgres.summary?.task} />
        <ExecutionShadowNodeBlock title="Canonical Plan" node={result.postgres.summary?.plan} />
        <ExecutionShadowNodeBlock title="Canonical Goal" node={result.postgres.summary?.goal} />
        <ExecutionShadowNodeBlock title="Canonical Mission" node={result.postgres.summary?.mission} />
      </div>

      {result.status === "not-found" ? <ShadowNotFoundState /> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <ShadowComparisonGroup
          title="Matched Fields"
          fields={result.diff.matchedFields}
          labelForField={(field) => `${field.node}.${field.field}`}
        />
        <ShadowComparisonGroup
          title="Mismatched Fields"
          fields={result.diff.mismatches}
          labelForField={(field) => `${field.node}.${field.field}`}
        />
        <ShadowComparisonGroup
          title="Non-Comparable Fields"
          fields={result.diff.nonComparableFields}
          labelForField={(field) => `${field.node}.${field.field}`}
        />
        <ShadowComparisonGroup
          title="Missing Fields"
          fields={result.diff.missingFields}
          labelForField={(field) => `${field.node}.${field.field}`}
        />
      </div>

      <ShadowMismatchTaxonomy categories={result.diff.mismatchCategories} />

      <WarningList warnings={result.warnings} />
      <JsonDetails label="Execution Shadow Result JSON" value={result} />
    </div>
  );
}

function InspectorCard<Result>({
  inspector,
  icon,
  children,
}: {
  inspector: CanonicalReadDiagnosticsInspectorView<Result>;
  icon: ReactNode;
  children?: ReactNode;
}) {
  const resultStatus =
    inspector.result && typeof inspector.result === "object" && "status" in inspector.result
      ? String((inspector.result as { status: string }).status)
      : undefined;

  return (
    <Card>
      <CardHeader>
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-fg-secondary">
            {icon}
            Internal read-only inspector
          </div>
          <CardTitle>{inspector.title}</CardTitle>
          <CardDescription>{inspector.description}</CardDescription>
        </div>
        {resultStatus ? (
          <Badge variant={badgeVariantForState(resultStatus)}>
            {resultStatus}
          </Badge>
        ) : inspector.enabled ? (
          <Badge variant="neutral">awaiting result</Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <form method="get" className="space-y-4">
          <input type="hidden" name="inspect" value={inspector.kind} />
          <div className="grid gap-4 xl:grid-cols-2">
            {inspector.fields.map((field) => (
              <FormField key={field.name} field={field} />
            ))}
          </div>
          {inspector.inputErrors.length > 0 ? (
            <div className="rounded-lg border border-error/20 bg-error-subtle/40 p-3 text-sm text-error">
              {inspector.inputErrors.map((error) => (
                <div key={error}>• {error}</div>
              ))}
            </div>
          ) : null}
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm">
              Inspect
            </Button>
            <span className="text-xs text-fg-secondary">
              Development only. Server-side read-only query.
            </span>
          </div>
        </form>
        {children}
      </CardContent>
    </Card>
  );
}

export function CanonicalReadDiagnosticsPage({
  model,
}: {
  model: CanonicalReadDiagnosticsModel;
}) {
  return (
    <>
      <PageHeader
        title="Canonical Read Diagnostics"
        context="INTERNAL / DEVELOPMENT ONLY. Memory runtime remains authoritative. PostgreSQL canonical read is optional, read-only, and isolated from product runtime behavior."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning">internal</Badge>
            <Badge variant={badgeVariantForState(model.availability.state)}>
              canonical-read {model.availability.state}
            </Badge>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        <Card className="border-warning/20 bg-warning-subtle/25">
          <CardContent className="flex items-start gap-3 p-5">
            <ShieldAlert className="mt-0.5 size-5 text-warning" />
            <div className="space-y-1">
              <div className="text-sm font-semibold text-fg">Development-only boundary</div>
              <div className="text-sm leading-6 text-fg-secondary">
                Requires non-production `NODE_ENV` and explicit
                `HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS=true`.
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-3 p-5">
            <CheckCircle2 className="mt-0.5 size-5 text-success" />
            <div className="space-y-1">
              <div className="text-sm font-semibold text-fg">No mutation path</div>
              <div className="text-sm leading-6 text-fg-secondary">
                No write API, no dual-write, no Command Bus, Governance, Policy or UI cutover.
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-3 p-5">
            <Database className="mt-0.5 size-5 text-primary" />
            <div className="space-y-1">
              <div className="text-sm font-semibold text-fg">Optional PostgreSQL</div>
              <div className="text-sm leading-6 text-fg-secondary">
                Startup remains safe with no canonical read database configured.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {renderAvailability(model.availability)}
        {renderPersistenceProviders(model.persistence)}
        {renderKnowledgeRepository(model.knowledgeRepository)}
        {renderKnowledgeReadRouting(model.knowledgeReadRouting)}
        {renderKnowledgeSilentDualReadRollout(model.knowledgeSilentDualReadRollout)}

        <InspectorCard inspector={model.actor} icon={<Search className="size-4 text-primary" />}>
          {model.actor.result ? <ActorResultView result={model.actor.result} /> : null}
        </InspectorCard>

        <InspectorCard
          inspector={model.actorShadow}
          icon={<Search className="size-4 text-primary" />}
        >
          {model.actorShadow.result ? (
            <ActorShadowResultView result={model.actorShadow.result} />
          ) : null}
        </InspectorCard>

        <InspectorCard
          inspector={model.knowledge}
          icon={<Database className="size-4 text-primary" />}
        >
          {model.knowledge.result ? (
            <KnowledgeResultView result={model.knowledge.result} />
          ) : null}
        </InspectorCard>

        <InspectorCard
          inspector={model.knowledgeShadow}
          icon={<Database className="size-4 text-primary" />}
        >
          {model.knowledgeShadow.result ? (
            <KnowledgeShadowResultView result={model.knowledgeShadow.result} />
          ) : null}
        </InspectorCard>

        <InspectorCard
          inspector={model.executionShadow}
          icon={<Database className="size-4 text-primary" />}
        >
          {model.executionShadow.result ? (
            <ExecutionShadowResultView result={model.executionShadow.result} />
          ) : null}
        </InspectorCard>

        <InspectorCard
          inspector={model.execution}
          icon={<Database className="size-4 text-primary" />}
        >
          {model.execution.result ? (
            <ExecutionResultView result={model.execution.result} />
          ) : null}
        </InspectorCard>
      </div>
    </>
  );
}
