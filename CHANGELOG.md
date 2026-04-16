# Changelog

All notable changes to this project will be documented in this file.

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
