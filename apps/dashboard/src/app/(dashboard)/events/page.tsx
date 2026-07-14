import { PageHeader } from "@/components/layout/page-header";
import { EventTimeline } from "@/components/dashboard/event-timeline";
import { events } from "@/features/events/mock";
import { financeEvents } from "@/features/finance/events";
import { hrEvents } from "@/features/hr/events";
import { legalEvents } from "@/features/legal/events";

const allEvents = [...legalEvents, ...hrEvents, ...financeEvents, ...events];

export default function EventsPage() {
  return (
    <>
      <PageHeader
        title="Events"
        context="The system's heartbeat — every action, live."
      />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <EventTimeline events={allEvents} title="Live Events" />
        </div>
      </div>
    </>
  );
}
