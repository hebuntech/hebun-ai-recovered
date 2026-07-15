import { StatCard } from "@/components/dashboard/stat-card";
import { intelligenceScores } from "@/features/intelligence/mock";

export function IntelligenceSummary() {
  const metrics = [
    ["Organization Intelligence", intelligenceScores.organizationIntelligence],
    ["Learning", intelligenceScores.learning],
    ["Pattern Discovery", intelligenceScores.patternDiscovery],
    ["Strategic Confidence", intelligenceScores.strategicConfidence],
  ] as const;
  return (
    <>
      {metrics.map(([label, value]) => (
        <div key={label} className="col-span-6 xl:col-span-3">
          <StatCard label={label} value={`${value}`} />
        </div>
      ))}
    </>
  );
}
