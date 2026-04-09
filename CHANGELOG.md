# Changelog

All notable changes to this project will be documented in this file.

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
