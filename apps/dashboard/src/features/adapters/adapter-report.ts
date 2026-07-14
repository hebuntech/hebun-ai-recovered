import { adapterDiagnostics } from "@/features/adapters/adapter-diagnostics";
import { SDK_CONTRACT_VERSION } from "@/features/adapters/types";
import type { BadgeVariant } from "@/components/ui/badge";

/*
 * adapter-report.ts — SDK-wide audit report. Aggregates every adapter's
 * diagnostics into a single deterministic verdict for the audit UI.
 */

export interface AuditFinding {
  adapterId: string;
  area: string;
  severity: "ok" | "warning" | "error";
  detail: string;
}

export interface AuditReport {
  contractVersion: string;
  adaptersAudited: number;
  contractComplete: number;
  averageScore: number;
  findings: AuditFinding[];
  verdict: "pass" | "attention" | "fail";
  verdictBadge: BadgeVariant;
}

function buildFindings(): AuditFinding[] {
  const findings: AuditFinding[] = [];
  for (const d of adapterDiagnostics) {
    if (d.contract.missingMethods.length) {
      findings.push({ adapterId: d.adapterId, area: "Contract", severity: "error", detail: `Missing methods: ${d.contract.missingMethods.join(", ")}` });
    }
    if (d.contract.duplicateCapabilities.length) {
      findings.push({ adapterId: d.adapterId, area: "Capabilities", severity: "warning", detail: `Duplicate capabilities: ${d.contract.duplicateCapabilities.join(", ")}` });
    }
    if (d.contract.complete && d.healthy) {
      findings.push({ adapterId: d.adapterId, area: "Contract", severity: "ok", detail: "Contract complete and healthy" });
    }
  }
  return findings;
}

const findings = buildFindings();
const adaptersAudited = adapterDiagnostics.length;
const contractComplete = adapterDiagnostics.filter((d) => d.contract.complete).length;
const averageScore = adaptersAudited
  ? Math.round(adapterDiagnostics.reduce((sum, d) => sum + d.contract.score, 0) / adaptersAudited)
  : 100;
const hasError = findings.some((f) => f.severity === "error");
const hasWarning = findings.some((f) => f.severity === "warning");
const verdict: AuditReport["verdict"] = hasError ? "fail" : hasWarning ? "attention" : "pass";

export const auditReport: AuditReport = {
  contractVersion: SDK_CONTRACT_VERSION,
  adaptersAudited,
  contractComplete,
  averageScore,
  findings,
  verdict,
  verdictBadge: verdict === "pass" ? "success" : verdict === "attention" ? "warning" : "error",
};
