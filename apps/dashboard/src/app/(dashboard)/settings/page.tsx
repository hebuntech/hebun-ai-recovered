import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    title: "Profile",
    rows: [
      { label: "Name", value: "Şenol Sevim" },
      { label: "Role", value: "Director" },
      { label: "Email", value: "senoltr@gmail.com" },
    ],
  },
  {
    title: "Notifications",
    rows: [
      { label: "Approval requests", value: "Dashboard + Gmail" },
      { label: "Agent errors", value: "Dashboard" },
      { label: "Deploy events", value: "Dashboard + Gmail" },
    ],
  },
  {
    title: "Appearance",
    rows: [
      { label: "Theme", value: "Dark (canonical)" },
      { label: "Density", value: "Comfortable" },
    ],
  },
  {
    title: "API Keys",
    rows: [
      { label: "Supabase", value: "configured" },
      { label: "Vercel", value: "configured" },
      { label: "GitHub", value: "not set" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" context="Workspace preferences." />
      <div className="grid grid-cols-12 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="col-span-12 md:col-span-6">
            <Card>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <Badge variant="neutral">read-only</Badge>
              </CardHeader>
              <CardContent className="flex flex-col divide-y divide-border">
                {section.rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <span className="text-fg-secondary">{row.label}</span>
                    <span className="font-medium">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
}
