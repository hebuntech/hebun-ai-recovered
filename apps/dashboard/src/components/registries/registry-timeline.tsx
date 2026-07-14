import { EventTimeline } from "@/components/dashboard/event-timeline";
import { registryTimeline } from "@/features/registries";
import type { RegistryKey } from "@/features/registries/types";

export function RegistryTimeline({
  registryId,
  title = "Registry Timeline",
}: {
  registryId?: RegistryKey;
  title?: string;
}) {
  const events = registryId
    ? registryTimeline.filter((event) => event.registry === registryId)
    : registryTimeline;

  return <EventTimeline events={events} title={title} />;
}
