/**
 * Keeps the release version identical everywhere it is written down.
 *
 *   bun run scripts/version.ts check          # exit 1 if any file disagrees with package.json
 *   bun run scripts/version.ts check v0.3.0   # also require this exact version (release tag)
 *   bun run scripts/version.ts set 0.3.0      # write the version into every file
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILES = {
  packageJson: "package.json",
  serverInfo: "src/server-info.ts",
  serverJson: "server.json",
  manifest: "packaging/mcpb/manifest.json",
} as const;

const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const SERVER_INFO_RE = /export const SERVER_VERSION = "([^"]+)";/;

const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path: string, data: unknown) => writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);

export const readVersions = (): Record<string, string> => {
  const server = readJson(FILES.serverJson);
  const versions: Record<string, string> = {
    [FILES.packageJson]: readJson(FILES.packageJson).version,
    [FILES.serverInfo]: readFileSync(FILES.serverInfo, "utf8").match(SERVER_INFO_RE)?.[1] ?? "(missing)",
    [`${FILES.serverJson} .version`]: server.version,
    [FILES.manifest]: readJson(FILES.manifest).version,
  };
  server.packages.forEach((p: { version: string }, i: number) => {
    versions[`${FILES.serverJson} .packages[${i}].version`] = p.version;
  });
  return versions;
};

const setVersion = (version: string) => {
  const pkg = readJson(FILES.packageJson);
  pkg.version = version;
  writeJson(FILES.packageJson, pkg);

  const info = readFileSync(FILES.serverInfo, "utf8");
  if (!SERVER_INFO_RE.test(info)) throw new Error(`${FILES.serverInfo}: SERVER_VERSION not found`);
  writeFileSync(FILES.serverInfo, info.replace(SERVER_INFO_RE, `export const SERVER_VERSION = "${version}";`));

  const server = readJson(FILES.serverJson);
  server.version = version;
  for (const p of server.packages) p.version = version;
  writeJson(FILES.serverJson, server);

  const manifest = readJson(FILES.manifest);
  manifest.version = version;
  writeJson(FILES.manifest, manifest);
};

const main = () => {
  const [cmd, arg] = process.argv.slice(2);
  if (cmd === "set") {
    const version = arg?.replace(/^v/, "");
    if (!version || !SEMVER.test(version)) {
      console.error("Usage: bun run scripts/version.ts set <semver>");
      process.exit(1);
    }
    setVersion(version);
    console.log(`Version set to ${version} in ${Object.values(FILES).join(", ")}`);
    return;
  }
  if (cmd === "check") {
    const versions = readVersions();
    const expected = arg ? arg.replace(/^v/, "") : versions[FILES.packageJson];
    const bad = Object.entries(versions).filter(([, v]) => v !== expected);
    if (bad.length > 0) {
      console.error(`Version mismatch (expected ${expected}):`);
      for (const [file, v] of bad) console.error(`  ${file}: ${v}`);
      console.error("Fix with: bun run scripts/version.ts set <version>");
      process.exit(1);
    }
    console.log(`All versions are ${expected}`);
    return;
  }
  console.error("Usage: bun run scripts/version.ts check [version] | set <version>");
  process.exit(1);
};

if (import.meta.main) main();
