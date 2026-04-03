# Changelog

All notable changes to this project will be documented in this file.

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
