import { EventTimeline } from "@/components/dashboard/event-timeline";
import { governanceTimeline } from "@/features/governance/timeline";

export function GovernanceTimeline() {
  return <EventTimeline events={governanceTimeline} title="Governance Timeline" />;
}
