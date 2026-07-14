import type { CommunicationCapabilityMapping } from "@/features/providers/communication/types";

export const communicationCapabilityMappings: CommunicationCapabilityMapping[] = [
  {
    communication: "email",
    framework: "Email",
    description:
      "Email is represented as deterministic delivery planning with no real inbox or outbound access.",
  },
  {
    communication: "calendar",
    framework: "Calendar",
    description:
      "Calendar is modeled as scheduling and conflict-planning only, never live booking.",
  },
  {
    communication: "meetings",
    framework: "Calendar",
    description:
      "Meetings become agenda, attendee, and timing plans rather than scheduled sessions.",
  },
  {
    communication: "messaging",
    framework: "Messaging",
    description:
      "Messaging is reduced to channel, recipient, and intent planning with no platform delivery.",
  },
  {
    communication: "notifications",
    framework: "Messaging",
    description:
      "Notifications are modeled as audience and urgency plans only.",
  },
  {
    communication: "contacts",
    framework: "Search",
    description:
      "Contacts are represented as recipient-classification and role planning without directory access.",
  },
  {
    communication: "tasks",
    framework: "Human Approval",
    description:
      "Task assignment is expressed as communication and acknowledgment planning.",
  },
  {
    communication: "invitations",
    framework: "Calendar",
    description:
      "Invitations are modeled as attendance and confirmation plans rather than real sends.",
  },
  {
    communication: "reminders",
    framework: "Messaging",
    description:
      "Reminders become cadence and escalation plans without actual delivery.",
  },
  {
    communication: "announcements",
    framework: "Messaging",
    description:
      "Announcements are represented as broadcast plans with internal/external audience controls.",
  },
  {
    communication: "broadcasts",
    framework: "Messaging",
    description:
      "Broadcasts are expressed as deterministic multi-recipient delivery plans only.",
  },
  {
    communication: "conversation threads",
    framework: "Messaging",
    description:
      "Conversation threads are modeled as summarized thread intent and response planning.",
  },
];
