import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { isCanonicalReadDiagnosticsEnabled } from "@/features/canonical-read/diagnostics";

export const dynamic = "force-dynamic";

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isCanonicalReadDiagnosticsEnabled()) {
    notFound();
  }

  return <AppShell>{children}</AppShell>;
}
