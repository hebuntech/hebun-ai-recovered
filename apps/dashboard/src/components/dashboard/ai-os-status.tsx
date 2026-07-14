import Link from "next/link";
import { ArrowRight, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { systemStatus as s } from "@/features/architecture/mock";

export function AiOsStatus() {
  const stats = [
    { label: "Cores", value: `${s.cores}` },
    { label: "Engines", value: `${s.engines}` },
    { label: "Registries", value: `${s.registries}` },
    { label: "Platform Health", value: `${s.platformHealth}%` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="size-4 text-primary" />
          AI Operating System {s.version}
        </CardTitle>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          {s.status}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((st) => (
            <div key={st.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                {st.label}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{st.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/architecture"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Architecture Center
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
