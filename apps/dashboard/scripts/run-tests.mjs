import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

function collectTests(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectTests(path);
    if (!entry.isFile() || !entry.name.endsWith(".ts")) return [];
    if (path.includes(`${join("tests", "helpers")}${process.platform === "win32" ? "\\" : "/"}`)) return [];
    return [path];
  });
}

const tests = collectTests("tests").sort();
const failures = [];

for (const test of tests) {
  const result = spawnSync(process.execPath, ["--import", "tsx", test], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
  });
  const label = relative(process.cwd(), test);

  if (result.status === 0) {
    console.log(`PASS ${label}`);
    continue;
  }

  failures.push(label);
  console.error(`FAIL ${label}`);
  if (result.stdout) console.error(result.stdout.trim());
  if (result.stderr) console.error(result.stderr.trim());
}

console.log(`\nTest summary: ${tests.length - failures.length} passed, ${failures.length} failed, ${tests.length} total.`);
if (failures.length > 0) process.exitCode = 1;
