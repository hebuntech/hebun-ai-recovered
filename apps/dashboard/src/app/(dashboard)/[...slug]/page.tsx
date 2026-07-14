import { notFound } from "next/navigation";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";
import { resolveModulePath, placeholderPaths } from "@/config/sidebar.config";

/*
 * Catch-all module page. Every entry in sidebar.config.ts without a real
 * page renders here as a placeholder — adding a config entry is enough
 * to get a working route. Static routes always win over this catch-all.
 */

export function generateStaticParams() {
  return placeholderPaths().map((href) => ({
    slug: href.split("/").filter(Boolean),
  }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const module_ = resolveModulePath(`/${slug.join("/")}`);
  if (!module_) notFound();

  return <ModulePlaceholder module={module_} />;
}
