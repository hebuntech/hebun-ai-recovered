import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

function collectFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(resolved);
    return entry.isFile() && entry.name.endsWith(".ts") ? [resolved] : [];
  });
}

function main(): void {
  const authRoot = path.resolve(process.cwd(), "src/features/auth");
  const files = collectFiles(authRoot);
  const contents = files.map((file) => readFileSync(file, "utf8")).join("\n");

  assert.doesNotMatch(
    contents,
    /@\/features\/(?:persistence|runtime-projection|runtime-boundary|director-dashboard|memory-engine)|@\/components|@\/app\//,
    "authentication infrastructure must not import product runtime or UI layers",
  );
  assert.doesNotMatch(
    contents,
    /from ["'](?:pg|drizzle-orm|@supabase\/)/,
    "authentication foundation must not query PostgreSQL or install a provider SDK",
  );

  const publicIndex = readFileSync(path.join(authRoot, "index.ts"), "utf8");
  assert.doesNotMatch(
    publicIndex,
    /environment|supabase|ProviderCookie|RequestAuthenticationContainer/,
    "public auth exports must not expose server infrastructure",
  );

  const environmentFiles = files.filter((file) => file.includes("environment"));
  assert.equal(environmentFiles.length, 1);
  for (const file of files.filter((entry) => !entry.includes("environment"))) {
    assert.doesNotMatch(
      readFileSync(file, "utf8"),
      /process\.env/,
      "only the server environment module may access process.env",
    );
  }

  const providerResult = readFileSync(
    path.join(authRoot, "types/provider-authentication.ts"),
    "utf8",
  );
  assert.doesNotMatch(
    providerResult,
    /accessToken|refreshToken|rawCookie|rawSession|serviceRole|jwt:/,
    "normalized provider authentication must not expose credentials",
  );

  console.log("authentication boundary checks passed");
}

main();
