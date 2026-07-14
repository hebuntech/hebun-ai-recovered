import type { Ticket, TicketStatus } from "@/types";

export const tickets: Ticket[] = [
  {
    id: "#4832",
    subject: "Cannot connect Supabase integration",
    customer: "Fabrikam",
    status: "open",
    assignee: "Unassigned",
    sla: "on-track",
    updated: "2m ago",
  },
  {
    id: "#4831",
    subject: "Billing address update fails on save",
    customer: "Acme GmbH",
    status: "assigned",
    assignee: "Support Agent",
    sla: "on-track",
    updated: "8m ago",
  },
  {
    id: "#4830",
    subject: "Workflow runs stuck in pending state",
    customer: "Northwind",
    status: "assigned",
    assignee: "Support Agent",
    sla: "warning",
    updated: "15m ago",
  },
  {
    id: "#4828",
    subject: "Feature request: export events as CSV",
    customer: "Contoso Ltd",
    status: "waiting",
    assignee: "Support Agent",
    sla: "on-track",
    updated: "1h ago",
  },
  {
    id: "#4818",
    subject: "Agent logs not loading in dashboard",
    customer: "Globex",
    status: "resolved",
    assignee: "Support Agent",
    sla: "on-track",
    updated: "48m ago",
  },
  {
    id: "#4802",
    subject: "Production deploy notification delayed",
    customer: "Initech",
    status: "assigned",
    assignee: "Ticket Management Agent",
    sla: "breached",
    updated: "34m ago",
  },
  {
    id: "#4795",
    subject: "How to add a custom MCP server?",
    customer: "Wayne Corp",
    status: "closed",
    assignee: "Knowledge Base Agent",
    sla: "on-track",
    updated: "2d ago",
  },
  {
    id: "#4790",
    subject: "SSO login loop on Safari",
    customer: "Stark Industries",
    status: "closed",
    assignee: "Support Agent",
    sla: "on-track",
    updated: "3d ago",
  },
];

export const ticketStatuses: TicketStatus[] = [
  "open",
  "assigned",
  "waiting",
  "resolved",
  "closed",
];

export function ticketCount(status: TicketStatus): number {
  return tickets.filter((t) => t.status === status).length;
}
