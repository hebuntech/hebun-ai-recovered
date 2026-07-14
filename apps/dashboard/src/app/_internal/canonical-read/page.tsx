import { CanonicalReadDiagnosticsPage } from "@/components/canonical-read/diagnostics-page";
import { buildCanonicalReadDiagnosticsModel } from "@/features/canonical-read/diagnostics";

export const dynamic = "force-dynamic";

type SearchParamsInput =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>
  | undefined;

export default async function InternalCanonicalReadPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const model = await buildCanonicalReadDiagnosticsModel(resolvedSearchParams);

  return <CanonicalReadDiagnosticsPage model={model} />;
}
