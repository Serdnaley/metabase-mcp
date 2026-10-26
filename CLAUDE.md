# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install                    # Install dependencies
bun run dev                    # Run MCP server directly
bun run build                  # Bundle to dist/index.js (node target)
bun run generate-types         # Regenerate types from Metabase OpenAPI spec
bun test                       # Run all tests (requires Metabase running)
bun test tests/services/cards.test.ts  # Run a single test file
```

### Running tests

Tests require a real Metabase instance via Docker:

```bash
docker compose up -d
./tests/ci/wait-for-metabase.sh   # ~15s for Metabase to boot
bun test
docker compose down
```

`docker-compose.yml` pins the Metabase image (`MB_IMAGE` overrides it, e.g. `metabase/metabase:latest`). Bump the pin only after the suite passes on the new version; `docs/metabase-changes-*.md` records what changed between pins.

Tests must fail on wrong endpoints. For features that depend on a paid plan or server config, wrap the call in `skipOnEnvError()` (tests/helpers.ts) with a specific error pattern, or `test.skipIf()` on `getTokenFeatures()` — never a bare try/catch that logs and passes.

The test preload (`tests/setup.ts` via `bunfig.toml`) auto-provisions the Metabase instance on first run (creates admin user + API key, saves to `/tmp/metabase-mcp-test-setup.json`). Subsequent runs reuse existing credentials.

## Architecture

Three-layer functional architecture — no classes anywhere:

```
src/tools/*       → MCP tool declarations (zod schemas + handlers), one module = one toolset
src/registry.ts   → collects tools, derives read/write + annotations, applies toolset filters
src/services/*    → Business logic (pure API call functions)
src/client.ts     → openapi-fetch HTTP client with auth middleware
src/http.ts       → Streamable HTTP transport with bearer auth (stdio is the default)
```

**Data flow:** MCP client → tool handler → service function → openapi-fetch → Metabase REST API

### Key files

- `src/index.ts` — Entry point: loads config, creates client, builds the tool catalog, applies `METABASE_TOOLSETS` / `_ENABLE` / `_DISABLE` / read-only, starts stdio or HTTP
- `src/registry.ts` — `buildToolCatalog()` records every `server.tool()` call (registering twice, read-only on/off, to classify write tools), adds annotations; `selectTools()` applies precedence read-only > disable > enable > toolsets
- `src/server-info.ts` — server name/version (keep `SERVER_VERSION` = package.json version; a test checks it, and `server.json`)
- `src/config.ts` — Zod schema parsing env vars (`METABASE_URL`, `METABASE_API_KEY`, etc.)
- `src/client.ts` — `createMetabaseClient()` factory with API key or session auth middleware
- `src/tools/index.ts` — `TOOL_MODULES` (toolset id, label, register fn); `registerAllTools()` registers everything unfiltered
- `generated/metabase-api.d.ts` — 40k lines of generated types from Metabase's OpenAPI spec

### Adding a new tool

1. Add service function in `src/services/<domain>.ts` — takes `MetabaseClient`, calls API, returns data
2. Register tool in `src/tools/<domain>.ts` — `server.tool(name, description, zodSchema, handler)`
3. Write tools must be wrapped in `if (!config.readOnly) { ... }`
4. Tool handlers return `{ content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }`
5. A new domain file = a new toolset: add it to `TOOL_MODULES` (and to a preset in `registry.ts` if it fits)
6. Annotations come from `annotate()` in `registry.ts` (name prefix rules); check the result for your tool
7. Run `bun run docs:readme` to regenerate the README tool tables/counts (CI runs `docs:check`), and update the e2e READ_ONLY/WRITE lists

### Type generation

`scripts/generate-types.ts` downloads the Metabase OpenAPI spec, cleans problematic schema names (double dots, `/` and `%` in property keys, broken `$ref` pointers), then generates types via `openapi-typescript`. The generated types are committed.

## Releasing (npm, MCP Registry, .mcpb, Docker)

One GitHub release publishes everywhere via `.github/workflows/publish.yml` (no tokens needed).

```bash
bun run version:set X.Y.Z      # package.json, src/server-info.ts, server.json, packaging/mcpb/manifest.json
# update CHANGELOG.md (Unreleased → X.Y.Z), bun run docs:readme, test counts in README.md
git commit -am "chore: prepare X.Y.Z release"   # via PR to main
gh release create vX.Y.Z --title "vX.Y.Z" --notes "…"
```

Jobs (each skips what is already published, so a failed run can be repeated with
"Run workflow" → tag):
1. `test` — tag must equal every version field (`bun run version:check vX.Y.Z`), tsc, docs check, full suite.
2. `npm` — `npm publish --provenance` via OIDC trusted publishing.
3. `mcp-registry` — waits for npm to serve `mcpName`, verifies `mcp-publisher` (cosign), `login github-oidc`, `publish`.
4. `mcpb` — `bun run mcpb` builds `metabase-mcp-X.Y.Z.mcpb` (Claude Desktop one-click bundle) and attaches it to the release.
5. `docker` — builds, smoke-tests `/health`, pushes `ghcr.io/serdnaley/metabase-mcp:X.Y.Z` and `:latest` (amd64 + arm64).

Glama indexes the repo itself (`glama.json` lists the maintainer); nothing to publish. Smithery is not
used: it only lists hosted HTTPS servers.

The E2E test `tests/e2e/read-only-mode.test.ts` has hardcoded `READ_ONLY_TOOLS` and `WRITE_TOOLS` arrays — update them when adding/removing tools.

## Important patterns

- **Zod v4**: This project uses zod 4.x. `z.record()` requires two arguments: `z.record(z.string(), z.unknown())`, not `z.record(z.unknown())`.
- **Update services**: Only send fields that are explicitly provided. Don't send `null` for unset optional fields — Metabase rejects null on NOT NULL columns (e.g., collection name).
- **Dashboard cards**: New cards need negative temporary IDs (`id: -1, -2, ...`) for Metabase to accept them via `PUT /api/dashboard/{id}/cards`.
- **Parameterized cards**: `executeCardQuery` fetches the card first to read template tag metadata, then builds the Metabase parameter array from a simple `{ paramName: value }` map.
- **Action types**: `create_action` restricts type to `query` | `implicit` — HTTP actions are blocked (SSRF risk).
- **`execute_query`** is registered even in read-only mode (by design — Metabase's own permissions are the enforcement layer).
