import type { Integration } from "@/types";

export const integrations: Integration[] = [
  {
    id: "gmail",
    name: "Gmail",
    description: "Notifications, summaries, and customer email.",
    status: "connected",
    lastSync: "3m ago",
    scopes: ["gmail.send", "gmail.readonly"],
    eventsToday: 12,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Repository events, commits, and changelog updates.",
    status: "pending",
    lastSync: "1h ago",
    scopes: ["repo", "workflow"],
    eventsToday: 9,
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Database, auth, and realtime event bus.",
    status: "connected",
    lastSync: "just now",
    scopes: ["database", "auth", "realtime"],
    eventsToday: 148,
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Deployments and production monitoring.",
    status: "error",
    lastSync: "6h ago",
    scopes: ["deployments.read", "deployments.write"],
    eventsToday: 2,
  },
];
