# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Large-result safety

- Query tools (`execute_query`, `execute_card_query`, `run_metric`) return a compact view by default:
  `columns` (name, type) + `rows`, no column internals, `results_metadata` or insights. `verbose: true`
  returns the raw Metabase response.
- Row cap `METABASE_MAX_ROWS` (default 500) with per-call `max_rows` and `offset` paging; a `note`
  says how to get the rest (next offset, or an export tool with `output_path`).
- Every tool response is serialised as compact JSON and capped at `METABASE_MAX_RESPONSE_CHARS`
  (default 100000) with a truncation notice.
- Measured on a 10 / 100 / 500-row `SELECT * FROM ORDERS`: 94% / 76% / 60% fewer characters than 0.3.0.

### Resources and prompts

- MCP resources: `metabase://databases`, `metabase://database/{id}/schema`, `metabase://card/{id}`,
  `metabase://dashboard/{id}`, `metabase://collection/{id}` (compact JSON summaries).
- Prompts: `explore-database`, `build-dashboard`, `explain-card`, `audit-permissions`.
- Both follow the tool selection: resources need their toolset, prompts need every tool they use.

### Admin tools (17 new, 178 total)

- **API keys** toolset: `list_api_keys`, `create_api_key` (full key returned once),
  `update_api_key`, `regenerate_api_key`, `delete_api_key`.
- **Embedding** toolset: `get_embedding_status` (settings, embeddable items, whether a signing key
  exists, never its value), `set_static_embedding`, `set_resource_embedding` (per-parameter
  enabled/locked/disabled), `create_embed_url` (signed iframe URL, signed locally).
- **Tasks & logs** (`diagnostics`) toolset: `list_tasks` (now with status/task filters, paging and
  compact output; moved from `activity`), `get_task`, `list_task_types`, `list_task_runs`,
  `get_scheduler_info`, `get_server_logs` (level/text filter, ANSI stripped), `list_log_presets`,
  `set_log_levels` / `reset_log_levels` (temporary), `get_premium_token_status`.
- The `admin` preset includes the three new toolsets.

### Types

- `generated/metabase-api.d.ts` regenerated from the Metabase v0.64 OpenAPI spec (the CI version;
  `scripts/generate-types.ts` is now pinned to it, `METABASE_SPEC` overrides). 27 `as any` casts
  removed where the new types cover the calls.

## [0.3.0] - 2026-10-26

Compatibility release for Metabase 0.60–0.64 (verified on v0.59.6 and v0.64.3.4). See
`docs/metabase-changes-0.59-to-0.64.md` for the full API diff.

### Distribution

- **One release publishes everywhere**: npm, the official MCP Registry
  (`io.github.Serdnaley/metabase-mcp`), a Claude Desktop one-click bundle (`.mcpb`) on the GitHub
  release, Docker image `ghcr.io/serdnaley/metabase-mcp` (amd64 + arm64). `glama.json` for Glama.
- `bun run version:set X.Y.Z` / `version:check` keep every version field in sync; CI checks it.
- Empty env vars now count as unset (bundle hosts pass `""` for blank optional fields).

### Fixed

- `execute_card_query` with parameters: sends the now-required `parameters[].id`, reads MBQL 5
  template tags (`stages[0]["template-tags"]`, an array), and raw date variables use `date/single`.
- `create_segment` / `update_segment`: bare MBQL filter definitions (`{ filter: [...] }`) are wrapped
  into a full query, which Metabase 0.64 requires.
- `get_database_schema`: works on schema-less databases (`""`), such as the SQLite sample DB.
- Alerts: `create_alert`, `update_alert`, `delete_alert`, `list_alerts`, `get_alert` now use
  `/api/notification` (the old `/api/alert` write routes don't exist). New input shape:
  `send_condition`, `send_once`, `channels: [{ type: "email", user_ids, emails } | { type: "slack", channel }]`,
  `cron_schedule`. Delete deactivates.
- Dashboard subscriptions use `/api/pulse`: list by `dashboard_id`, create (defaults to every question
  on the dashboard), delete archives.
- `get_activity`: `/api/activity` was removed upstream; now returns recent views + popular items.
- `persist_model` / `unpersist_model`: correct `.../persist` and `.../unpersist` routes.
- `get_glossary_term` (no GET-by-id route; looked up in the list); `update_glossary_term` with one field.
- `list_collection_items` sorting (Metabase 0.64 renamed the params to kebab-case).
- `create_document` / `update_document`: send the required ProseMirror `document` body (new `text`
  shortcut; `content` kept as an alias). `delete_document` archives first.
- `translate_entity_ids` request body; `upload_csv` sends multipart form data.

### Added

- **Headless HTTP mode**: Streamable HTTP transport (`MCP_TRANSPORT=http` or `--http`) with a
  required bearer token (`MCP_HTTP_TOKEN`), `GET /health`, stateless `/mcp` endpoint. No-auth only
  on loopback (`MCP_HTTP_ALLOW_NO_AUTH=true`) with DNS-rebinding protection.
- **Toolsets**: `METABASE_TOOLSETS` (one toolset per domain, presets `all`, `query`, `content`,
  `admin`), `METABASE_TOOLS_ENABLE` / `METABASE_TOOLS_DISABLE` (names or globs). Precedence:
  read-only > disable > enable > toolsets. Startup log shows the effective tool count.
- **Tool annotations** on every tool: `readOnlyHint`, `destructiveHint`, `idempotentHint`,
  `openWorldHint`. `execute_query` / `export_query` (raw SQL) are marked read-only for one-click
  approval; their descriptions warn that the SQL itself is not restricted.
- Tool catalog site generated from the registry (`bun run docs`, published to GitHub Pages);
  README tool tables are generated too, and CI fails when they drift.
- `LICENSE` (MIT), README badges, `mcpName` + `server.json` for the official MCP Registry.

- `get_group`: a permission group with its members and their `membership_id`, which
  `remove_group_member` needs (no tool exposed it before).
- **Metrics** (Metabase 0.60+ for running, 0.64+ for dimensions): `list_metrics`, `get_metric`,
  `create_metric`, `update_metric`, `run_metric` (filters, breakouts, temporal buckets, or a raw
  definition for metric math), `list_metric_dimensions`, `get_metric_dimension_values`. On older
  versions list/get fall back to cards and the rest report the required version.
- **Measures**: `list_measures`, `get_measure`, `create_measure`, `update_measure` (bare
  `{ aggregation: [...] }` definitions are wrapped like segments).
- **Transforms**: `list_transforms`, `get_transform`, `create_transform` (SQL shortcut),
  `update_transform`, `delete_transform` (optionally dropping the table), `run_transform`,
  `cancel_transform_run`, `list_transform_runs`, `get_transform_run`, transform jobs
  (`list_transform_jobs`, `create_transform_job`, `run_transform_job`, `delete_transform_job`) and tags
  (`list_transform_tags`, `create_transform_tag`). Requires `MB_TRANSFORMS_ENABLED=true` and a
  non-sample warehouse.
- **Exports**: `export_card_query` and `export_query` (csv/json inline with a size cap, or any format
  incl. xlsx to `output_path`), `export_dashboard_pdf` (Metabase 0.64+).
- **Notifications**: `list_notifications` (any payload type), `send_notification` (send now).
- `get_recent_items`, `get_popular_items` tools.
- Metabase error responses are stripped of Java stack traces (`trace`, `via`) before reaching the model.
- CI pinned to Metabase v0.64.3.4 (`MB_IMAGE` override) plus a weekly non-blocking job on `latest`.
- Test stack: an optional Postgres "Test Warehouse" (docker compose service) for transform and CSV
  upload tests; tests that need it skip explicitly without it.
- `METABASE_CUSTOM_HEADERS`: extra HTTP headers sent on every Metabase request, including the session login. It takes a JSON object or `Name: value` pairs separated by newlines or `;`, for example Cloudflare Access service tokens. Auth headers keep precedence, and a malformed value fails at startup.

### Removed

- `notify_database`: `POST /api/notify/db/:id` only accepts Metabase's server-wide `MB_API_KEY`, not a
  user or API-key session, so the tool could never work with this server's auth. Use
  `sync_database_schema` instead.

## [0.2.0] - 2026-04-15

### Added

- **86 new tools** expanding coverage from 42 to **128 tools** across **26 domains**:
  - **Users & Groups** (13 tools): list, get, create, update, deactivate, reactivate users; list, create, update, delete groups; add/remove group members; get current user
  - **Permissions** (4): get/update data permissions graph, get/update collection permissions graph
  - **Segments** (5): CRUD for reusable named filters with table_id filtering
  - **Database write/sync** (6): create, update, delete, validate connections; trigger schema sync; post-ETL notify
  - **Notifications** (9): alerts CRUD, dashboard subscription list/create/update/delete
  - **Revisions** (2): list revision history, revert to prior version
  - **Settings** (3): list, get, update Metabase instance settings
  - **Glossary** (5): business term definitions CRUD
  - **Documents** (5): narrative analytics documents CRUD
  - **Timelines** (8): timeline and event CRUD for chart annotations
  - **Bookmarks** (3): list, create, delete bookmarks
  - **Moderation** (1): mark content as verified (Pro/Enterprise)
  - **EID Translation** (1): translate serialization entity IDs to API IDs
  - **SQL Snippets** (5): reusable SQL blocks CRUD
  - **Activity/Tasks** (3): activity feed, background task monitoring
  - **X-Rays** (1): auto-generated exploratory dashboards
  - **Cache** (2): invalidate cache, configure cache strategies
  - **Model Persistence** (3): enable, disable, refresh materialization
  - **CSV Upload** (1): ad-hoc data ingestion
  - **Action Public Links** (2): create/delete public action form links

- **Enhanced existing tools**:
  - Cards: `type` field (question/model/metric), `result_metadata` for model columns, `enable_embedding`
  - Dashboards: `enable_embedding`
  - Tables: `update_table`, `update_field` (with `coercion_strategy`), `rescan_field_values`, `discard_field_values`, `reorder_fields`
  - Collections: `get_collection_tree`, `personal_only` filter, `archived` filter on items
  - Search: `archived` filter for searching trash
  - Segments: `table_id` filter
  - Snippets: `get_snippet` individual lookup

- **Feature research docs** in `docs/` — gap analysis, feature sources, and per-domain feature documentation

### Fixed

- `updateCollection` no longer unconditionally sends `archived: false` — only includes the field when explicitly provided
- `getSetting` / `updateSetting` handle plain-text responses from Metabase (was causing JSON parse errors)
- Timeline event timestamps normalized to ISO 8601 format

### Changed

- Tool count: 42 → 128 across 26 domains
- Test count: 202 tests, 668 assertions across 31 test files
- Updated E2E read-only mode test with complete tool inventory

## [0.1.5] - 2026-04-09

### Changed

- Updated CHANGELOG with missing entries for 0.1.3 and 0.1.4
- Updated README: tool count 35 → 39, added public link tools to tools table

## [0.1.4] - 2026-04-09

### Added

- **Public link tools** — 4 new tools for sharing cards and dashboards publicly:
  - `create_card_public_link` / `delete_card_public_link` — generate or remove public sharing links for saved questions
  - `create_dashboard_public_link` / `delete_dashboard_public_link` — generate or remove public sharing links for dashboards
  - Public link tools return the full public URL (`{metabase_url}/public/question/{uuid}` or `/public/dashboard/{uuid}`)
- Comprehensive test coverage for edge cases, error handling, and visualization settings

### Fixed

- `date_range` parameter handling — date ranges in native queries now correctly use two separate `date/single` parameters
- Public link response parsing — handle OpenAPI spec `content?: never` responses via raw response fallback
- Config schema now exported for external use
- Improved visualization settings descriptions in tool schemas (pie, bar, line, scatter, funnel chart guidance)

### Changed

- Tool count increased from 35 to 39 across 8 domains

## [0.1.3] - 2026-04-04

### Fixed

- CI: use Node 24 for Trusted Publishing compatibility
- CI: fix npm publish workflow authentication

## [0.1.2] - 2026-04-03

### Added

- CLAUDE.md for Claude Code context
- CHANGELOG.md

## [0.1.1] - 2026-04-03

### Fixed

- `execute_card_query` now supports parameterized cards with template tags (e.g. `fromDate`, `toDate`). Pass values via `parameter_values` map — the service auto-builds the proper Metabase parameter array from the card's template tag metadata. Supports date, number, and text parameter types.

## [0.1.0] - 2026-04-03

Initial release.

### Added

- **35 MCP tools** across 7 domains:
  - **Search**: Full-text search across all Metabase entities
  - **Databases**: List, get details, metadata, schemas
  - **Tables & Fields**: Get table details, query metadata, field values
  - **Collections**: Full CRUD — create, read, update, archive, nested collections
  - **Cards (Questions)**: Full CRUD — create (native SQL or structured), update, delete, copy, execute
  - **Dashboards**: Full CRUD — create, update, delete, copy, manage card layout
  - **Actions**: Create, update, delete, execute (query and implicit types)
  - **Dataset**: Run ad-hoc native SQL and structured queries
- **Read-only mode** via `METABASE_READ_ONLY_MODE=true` — disables all write tools
- **Two auth modes**: API key (`X-API-Key`) or email/password session (`X-Metabase-Session`)
- **Type-safe HTTP client** generated from Metabase's OpenAPI spec via `openapi-typescript` + `openapi-fetch`
- **Docker Compose** setup for local development with Metabase
- **Integration test suite**: 77 tests, 237 assertions against a real Metabase instance
  - CRUD tests for all service domains
  - E2E workflows: analytics, dashboard builder, content management, read-only mode
- **GitHub Actions CI**: test pipeline + npm publish via Trusted Publishing (OIDC)
- Installation guides for Claude Desktop, Claude Code, Cursor, Windsurf, Cline, Continue, and Zed

### Security

- Action creation restricted to `query` and `implicit` types — HTTP actions (SSRF risk) are blocked
- Test credential files written with `0600` permissions
