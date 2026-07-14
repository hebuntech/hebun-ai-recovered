import { notFound } from "next/navigation";
import {
  buildRuntimeProjectionDiagnosticsModel,
  ensureRuntimeProjectionRegistry,
  registerRuntimeProjectionBuilders,
} from "@/features/runtime-projection";

export const dynamic = "force-dynamic";

export default function InternalRuntimeProjectionsPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  registerRuntimeProjectionBuilders();
  try {
    ensureRuntimeProjectionRegistry();
  } catch {
    // Diagnostics remain available with sanitized projection failure metadata.
  }
  const model = buildRuntimeProjectionDiagnosticsModel();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Runtime Projection Diagnostics</h1>
        <p className="text-sm text-fg-muted">
          Internal-only projection registry status, health, versioning, and dependency visibility.
        </p>
      </header>

      <div className="grid gap-4">
        {model.projections.map((projection) => (
          <section key={projection.collection} className="rounded-lg border bg-surface p-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-medium">{projection.collection}</h2>
              <p className="text-xs text-fg-muted">
                owner: {projection.owner} · version {projection.version.value} · {projection.health.status}
              </p>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div>
                <dt className="text-fg-muted">Availability</dt>
                <dd>{projection.availability.available ? "available" : "unavailable"}</dd>
              </div>
              <div>
                <dt className="text-fg-muted">Item Count</dt>
                <dd>{projection.statistics.itemCount}</dd>
              </div>
              <div>
                <dt className="text-fg-muted">Refresh Count</dt>
                <dd>{projection.statistics.refreshCount}</dd>
              </div>
              <div>
                <dt className="text-fg-muted">Last Refresh</dt>
                <dd>{projection.statistics.lastRefreshedAt ?? "never"}</dd>
              </div>
              <div>
                <dt className="text-fg-muted">Age</dt>
                <dd>{projection.ageMs === undefined ? "unavailable" : `${projection.ageMs} ms`}</dd>
              </div>
              <div>
                <dt className="text-fg-muted">Last Result</dt>
                <dd>{projection.statistics.lastRefreshResult}</dd>
              </div>
              <div>
                <dt className="text-fg-muted">Failure Category</dt>
                <dd>{projection.statistics.lastFailureCategory ?? "none"}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-fg-muted">
              dependencies: {projection.dependencies.join(", ") || "none"}
            </p>
            <p className="mt-1 text-xs text-fg-muted">{projection.health.detail}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
