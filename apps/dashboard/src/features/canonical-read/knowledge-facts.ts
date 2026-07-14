import { CanonicalPgReadClient } from "./pg-read-client";
import type {
  CanonicalKnowledgeFactResult,
  CanonicalKnowledgeFactIdentity,
  CanonicalKnowledgeNodeSelection,
} from "./types";

interface KnowledgeRow {
  fact_tenant_id: string;
  fact_key: string;
  domain_key: string;
  knowledge_scope: "company-wide" | "department" | "domain";
  fact_version: number;
  selected_at: string | null;
  selected_by_actor_type: string | null;
  selected_by_actor_id: string | null;
  previous_knowledge_node_id: string | null;
  governance_session_id: string | null;
  ratification_decision_id: string | null;
  fact_metadata: Record<string, unknown> | null;
  active_node_id: string | null;
  active_node_type: string | null;
  active_node_label: string | null;
  active_node_ref_id: string | null;
  active_node_statement: string | null;
  active_node_lifecycle_status: string | null;
  active_node_health: string | null;
  active_node_authority: string | null;
  active_node_governance_session_id: string | null;
  active_node_ratification_decision_id: string | null;
  active_node_ratified_by_actor_type: string | null;
  active_node_ratified_by_actor_id: string | null;
  active_node_ratified_at: string | null;
  active_node_provenance: Record<string, unknown> | null;
  active_node_source_attribution: Record<string, unknown> | null;
  active_node_effective_from: string | null;
  active_node_effective_until: string | null;
  active_node_review_cadence: string | null;
  active_node_next_review_at: string | null;
  active_node_freshness_evaluated_at: string | null;
  active_node_knowledge_version: number | null;
}

function unavailable(
  client: CanonicalPgReadClient,
  input: CanonicalKnowledgeFactResult["identity"],
): CanonicalKnowledgeFactResult {
  return {
    kind: "canonical-knowledge-fact",
    status: "unavailable",
    resolved: false,
    availability: client.unavailableAvailability(),
    identity: input,
    warnings: [],
    reason: client.unavailableError().message,
    error: client.unavailableError(),
  };
}

export async function selectCanonicalKnowledgeFact(
  client: CanonicalPgReadClient,
  input: CanonicalKnowledgeFactResult["identity"],
): Promise<CanonicalKnowledgeFactResult> {
  const availability = await client.availability();
  if (!availability.available) return unavailable(client, input);

  try {
    const row = await client.queryOne<KnowledgeRow>(
      `
        select
          kf.tenant_id as fact_tenant_id,
          kf.fact_key,
          kf.domain_key,
          kf.knowledge_scope,
          kf.fact_version,
          kf.selected_at,
          kf.selected_by_actor_type,
          kf.selected_by_actor_id,
          kf.previous_knowledge_node_id,
          kf.governance_session_id,
          kf.ratification_decision_id,
          kf.metadata as fact_metadata,
          kn.id as active_node_id,
          kn.type as active_node_type,
          kn.label as active_node_label,
          kn.ref_id as active_node_ref_id,
          kn.statement as active_node_statement,
          kn.knowledge_lifecycle_status as active_node_lifecycle_status,
          kn.knowledge_health as active_node_health,
          kn.knowledge_authority as active_node_authority,
          kn.governance_session_id as active_node_governance_session_id,
          kn.ratification_decision_id as active_node_ratification_decision_id,
          kn.ratified_by_actor_type as active_node_ratified_by_actor_type,
          kn.ratified_by_actor_id as active_node_ratified_by_actor_id,
          kn.ratified_at as active_node_ratified_at,
          kn.provenance as active_node_provenance,
          kn.source_attribution as active_node_source_attribution,
          kn.effective_from as active_node_effective_from,
          kn.effective_until as active_node_effective_until,
          kn.review_cadence as active_node_review_cadence,
          kn.next_review_at as active_node_next_review_at,
          kn.freshness_evaluated_at as active_node_freshness_evaluated_at,
          kn.knowledge_version as active_node_knowledge_version
        from public.knowledge_facts kf
        left join public.knowledge_nodes kn
          on kn.id = kf.active_knowledge_node_id
         and kn.tenant_id = kf.tenant_id
        where kf.tenant_id = $1
          and kf.fact_key = $2
          and kf.domain_key = $3
          and kf.knowledge_scope = $4
        limit 1
      `,
      [input.tenantId, input.factKey, input.domainKey, input.knowledgeScope],
    );

    if (!row) {
      const existsElsewhere = await client.queryOne<{ exists: boolean }>(
        `
          select true as exists
          from public.knowledge_facts
          where fact_key = $1
            and domain_key = $2
            and knowledge_scope = $3
          limit 1
        `,
        [input.factKey, input.domainKey, input.knowledgeScope],
      );

      return {
        kind: "canonical-knowledge-fact",
        status: existsElsewhere ? "tenant-mismatch" : "not-found",
        resolved: false,
        availability,
        identity: input,
        warnings: existsElsewhere
          ? ["Canonical fact exists outside the requested tenant."]
          : [],
        reason: existsElsewhere ? "fact-tenant-mismatch" : "fact-not-found",
        error: {
          code: existsElsewhere ? "tenant_mismatch" : "not_found",
          message: existsElsewhere
            ? "Canonical fact exists but not for the requested tenant."
            : "No canonical fact selection exists for the requested identity.",
          retryable: false,
        },
      };
    }

    const fact: CanonicalKnowledgeFactIdentity = {
      tenantId: row.fact_tenant_id,
      factKey: row.fact_key,
      domainKey: row.domain_key,
      knowledgeScope: row.knowledge_scope,
      factVersion: row.fact_version,
      selectedAt: row.selected_at,
      selectedByActorType: row.selected_by_actor_type,
      selectedByActorId: row.selected_by_actor_id,
      previousKnowledgeNodeId: row.previous_knowledge_node_id,
      governanceSessionId: row.governance_session_id,
      ratificationDecisionId: row.ratification_decision_id,
      metadata: row.fact_metadata,
    };

    if (!row.active_node_id || !row.active_node_type || !row.active_node_label) {
      return {
        kind: "canonical-knowledge-fact",
        status: "partial",
        resolved: false,
        availability,
        identity: input,
        fact,
        warnings: [
          "Canonical fact exists, but its active knowledge node is missing or unresolved.",
        ],
        reason: "active-node-missing",
        error: {
          code: "partial_result",
          message:
            "Canonical fact exists without an accessible active knowledge node.",
          retryable: false,
        },
      };
    }

    const activeNode: CanonicalKnowledgeNodeSelection = {
      id: row.active_node_id,
      type: row.active_node_type,
      label: row.active_node_label,
      refId: row.active_node_ref_id,
      statement: row.active_node_statement,
      lifecycleStatus: row.active_node_lifecycle_status,
      health: row.active_node_health,
      authority: row.active_node_authority,
      governanceSessionId: row.active_node_governance_session_id,
      ratificationDecisionId: row.active_node_ratification_decision_id,
      ratifiedByActorType: row.active_node_ratified_by_actor_type,
      ratifiedByActorId: row.active_node_ratified_by_actor_id,
      ratifiedAt: row.active_node_ratified_at,
      provenance: row.active_node_provenance,
      sourceAttribution: row.active_node_source_attribution,
      effectiveFrom: row.active_node_effective_from,
      effectiveUntil: row.active_node_effective_until,
      reviewCadence: row.active_node_review_cadence,
      nextReviewAt: row.active_node_next_review_at,
      freshnessEvaluatedAt: row.active_node_freshness_evaluated_at,
      knowledgeVersion: row.active_node_knowledge_version ?? 1,
    };

    const warnings: string[] = [];
    if (activeNode.lifecycleStatus === "superseded") {
      warnings.push("Active canonical node is marked superseded.");
    }
    if (activeNode.lifecycleStatus === "retired") {
      warnings.push("Active canonical node is marked retired.");
    }

    return {
      kind: "canonical-knowledge-fact",
      status: warnings.length > 0 ? "partial" : "resolved",
      resolved: warnings.length === 0,
      availability,
      identity: input,
      fact,
      activeNode,
      warnings,
      reason: warnings.length > 0 ? "active-node-lifecycle-warning" : undefined,
      error:
        warnings.length > 0
          ? {
              code: "partial_result",
              message:
                "Canonical fact resolved, but the active knowledge node has lifecycle warnings.",
              retryable: false,
            }
          : undefined,
    };
  } catch (error) {
    return {
      kind: "canonical-knowledge-fact",
      status: "unavailable",
      resolved: false,
      availability,
      identity: input,
      warnings: [],
      reason: "knowledge-query-failed",
      error: {
        code: "query_failed",
        message: "Canonical knowledge fact query failed.",
        retryable: true,
        detail:
          error instanceof Error ? error.message : "Unknown canonical knowledge query failure.",
      },
    };
  }
}
