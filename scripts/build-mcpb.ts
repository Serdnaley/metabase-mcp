/**
 * Builds the one-click MCP bundle (.mcpb) for Claude Desktop and other MCPB hosts.
 *
 *   bun run scripts/build-mcpb.ts            # → metabase-mcp-<version>.mcpb in the repo root
 *
 * dist/index.js is a single self-contained file (bun bundles all dependencies),
 * so the bundle needs no node_modules.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const MCPB_CLI = "@anthropic-ai/mcpb@2.1.2";
const STAGE = "packaging/mcpb/build";

const run = (cmd: string[]) => {
  const res = Bun.spawnSync(cmd, { stdout: "inherit", stderr: "inherit" });
  if (res.exitCode !== 0) throw new Error(`Command failed (${res.exitCode}): ${cmd.join(" ")}`);
};

const version: string = JSON.parse(readFileSync("package.json", "utf8")).version;
const manifest = JSON.parse(readFileSync("packaging/mcpb/manifest.json", "utf8"));
if (manifest.version !== version) {
  throw new Error(`manifest.json version ${manifest.version} != package.json ${version}; run: bun run version:set ${version}`);
}

run(["bun", "run", "build"]);
if (!existsSync("dist/index.js")) throw new Error("dist/index.js missing after build");

rmSync(STAGE, { recursive: true, force: true });
mkdirSync(join(STAGE, "server"), { recursive: true });
cpSync("packaging/mcpb/manifest.json", join(STAGE, "manifest.json"));
cpSync("dist/index.js", join(STAGE, "server/index.js"));
cpSync("LICENSE", join(STAGE, "LICENSE"));
cpSync("README.md", join(STAGE, "README.md"));

const out = `metabase-mcp-${version}.mcpb`;
run(["npx", "-y", MCPB_CLI, "validate", join(STAGE, "manifest.json")]);
run(["npx", "-y", MCPB_CLI, "pack", STAGE, out]);
console.log(`Built ${out}`);
