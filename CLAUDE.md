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

The test preload (`tests/setup.ts` via `bunfig.toml`) auto-provisions the Metabase instance on first run (creates admin user + API key, saves to `/tmp/metabase-mcp-test-setup.json`). Subsequent runs reuse existing credentials.

## Architecture

Three-layer functional architecture — no classes anywhere:

```
src/tools/*       → MCP tool registration (zod schemas + handlers)
src/services/*    → Business logic (pure API call functions)
src/client.ts     → openapi-fetch HTTP client with auth middleware
```

**Data flow:** MCP client → tool handler → service function → openapi-fetch → Metabase REST API

### Key files

- `src/index.ts` — Entry point: loads config, creates client, registers tools, starts stdio transport
- `src/config.ts` — Zod schema parsing env vars (`METABASE_URL`, `METABASE_API_KEY`, etc.)
- `src/client.ts` — `createMetabaseClient()` factory with API key or session auth middleware
- `src/tools/index.ts` — `registerAllTools()` calls all domain registrations
- `generated/metabase-api.d.ts` — 40k lines of generated types from Metabase's OpenAPI spec

### Adding a new tool

1. Add service function in `src/services/<domain>.ts` — takes `MetabaseClient`, calls API, returns data
2. Register tool in `src/tools/<domain>.ts` — `server.tool(name, description, zodSchema, handler)`
3. Write tools must be wrapped in `if (!config.readOnly) { ... }`
4. Tool handlers return `{ content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }`

### Type generation

`scripts/generate-types.ts` downloads the Metabase OpenAPI spec, cleans problematic schema names (double dots, `/` and `%` in property keys, broken `$ref` pointers), then generates types via `openapi-typescript`. The generated types are committed.

## Releasing to npm

Releases are published via GitHub Actions (Trusted Publishing / OIDC — no npm token needed).

```bash
# 1. Bump version in package.json
# 2. Update CHANGELOG.md with new version section
# 3. Update README.md (tool counts, tools table, test counts)
# 4. Commit and push to main
git add package.json CHANGELOG.md README.md
git commit -m "chore: prepare X.Y.Z release"
git push origin main

# 5. Create a GitHub release — this triggers the publish workflow
gh release create vX.Y.Z --title "vX.Y.Z" --notes "Release notes here"
```

The CI workflow (`.github/workflows/publish.yml`) runs on `release: [published]`:
1. Runs full test suite against Metabase in Docker
2. Builds the bundle (`bun run build`)
3. Publishes to npm with `--provenance --access public`

The E2E test `tests/e2e/read-only-mode.test.ts` has hardcoded `READ_ONLY_TOOLS` and `WRITE_TOOLS` arrays — update them when adding/removing tools.

## Important patterns

- **Zod v4**: This project uses zod 4.x. `z.record()` requires two arguments: `z.record(z.string(), z.unknown())`, not `z.record(z.unknown())`.
- **Update services**: Only send fields that are explicitly provided. Don't send `null` for unset optional fields — Metabase rejects null on NOT NULL columns (e.g., collection name).
- **Dashboard cards**: New cards need negative temporary IDs (`id: -1, -2, ...`) for Metabase to accept them via `PUT /api/dashboard/{id}/cards`.
- **Parameterized cards**: `executeCardQuery` fetches the card first to read template tag metadata, then builds the Metabase parameter array from a simple `{ paramName: value }` map.
- **Action types**: `create_action` restricts type to `query` | `implicit` — HTTP actions are blocked (SSRF risk).
- **`execute_query`** is registered even in read-only mode (by design — Metabase's own permissions are the enforcement layer).
