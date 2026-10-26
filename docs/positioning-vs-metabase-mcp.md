# This project vs Metabase's built-in MCP server

Checked 2026-10-26 against Metabase v0.64.3.4 (OSS): `initialize` + `tools/list` on `/api/metabase-mcp`
with an admin API key, plus `docs/ai/mcp.md` at tag v0.64.3.4.

## What Metabase ships

- **Where:** `POST /api/metabase-mcp` (aliases `/api/mcp`, `/api/metabase-mcp/v2`), Streamable HTTP. In OSS
  since 0.60; 0.64 is "v2" (re-auth after upgrade); 0.65 adds per-group tool access.
- **Auth:** OAuth 2.0 with Metabase's embedded authorization server and dynamic client registration, scoped
  per connection (`agent:content:read`, `agent:content:write`, `agent:query:run`, `agent:sql:run`,
  `agent:delivery:write`). An API key in `X-API-Key` also works. An admin must switch it on
  (Admin > AI > MCP), and it needs AI features enabled. No Metabase AI provider is required.
- **Tools (21), task-shaped and coarse:** `search`, `browse_collection`, `browse_data`, `get_content`,
  `get_parameter_values`, `glossary`, `learn` (built-in how-to skills), `execute_query` (validated MBQL with
  cursor paging and reusable `query_handle`s), `execute_sql`, `run_saved_question`, plus writes
  `question_write`, `dashboard_write`, `collection_write`, `document_write` (markdown), `metric_write`,
  `measure_write`, `segment_write`, `alert_write`, `subscription_write`, `bookmark_content`,
  `duplicate_content`. `visualize_query` (inline charts) appears only in clients that render them.
- **Strengths:** query validation and "teaching" errors, MBQL query building and paging, inline charts,
  OAuth per user with an audit log, zero install, always matched to the server version.

## What it doesn't cover (and this repo does)

| Area | Built-in MCP | metabase-mcp |
|---|---|---|
| Admin: users, groups, memberships, permissions graphs | no | yes |
| Databases: add/update/delete, sync, rescan, validate | no | yes |
| Data model: table/field metadata, field order, values | read only (`browse_data`) | read + write |
| Settings, caching, model persistence | no | yes |
| Transforms (create/run/jobs/tags) | no | yes (this PR) |
| Exports: csv/json/xlsx files, dashboard PDF | no | yes (this PR) |
| Run a metric with breakouts/filters (`/api/metric/dataset`) | via MBQL `execute_query` | `run_metric` |
| Actions, timelines, snippets, revisions/revert, moderation, public links, x-rays, CSV upload | no | yes |
| Metabase < 0.60 | not available | works (CI on 0.64.3.4, verified on 0.59.6) |
| Read-only switch | OAuth scopes | `METABASE_READ_ONLY_MODE` |
| Transport | remote HTTP + OAuth | local stdio, API key or session, custom headers (e.g. Cloudflare Access) |

## Recommendation

Don't compete on "ask questions about my data": the built-in server's validated `execute_query`, handles,
glossary and inline charts beat raw `execute_query`/`execute_card_query` here, and it ships with Metabase.
Position metabase-mcp as the **admin and operations** MCP for Metabase: user/permission management,
database and data-model maintenance, transforms, settings/caching, exports and bulk content work, and
support for older or locked-down instances (pre-0.60, built-in MCP disabled, access behind a proxy).
Practical steps: say so in the README intro; suggest running both side by side (built-in for analysis,
this for admin); keep query tools for completeness but don't invest there beyond compatibility.
