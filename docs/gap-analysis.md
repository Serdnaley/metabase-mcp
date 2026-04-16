# Gap Analysis: Metabase Features vs MCP Server Implementation

Analysis of what's implemented, what's partially covered, and what's missing — prioritized by usefulness for an AI agent.

## Current Tool Inventory

| Domain | Tools | Tests |
|--------|-------|-------|
| Cards | list_cards, get_card, execute_card_query, create_card, update_card, delete_card, copy_card, create_card_public_link, delete_card_public_link | cards.test.ts |
| Dashboards | list_dashboards, get_dashboard, create_dashboard, update_dashboard, delete_dashboard, copy_dashboard, update_dashboard_cards, create_dashboard_public_link, delete_dashboard_public_link | dashboards.test.ts |
| Collections | list_collections, get_collection, list_collection_items, create_collection, update_collection | collections.test.ts |
| Search | search | search.test.ts |
| Dataset | execute_query | dataset.test.ts |
| Databases | list_databases, get_database, get_database_metadata, list_database_schemas, get_database_schema | databases.test.ts |
| Tables | get_table, get_table_query_metadata, get_field, get_field_values | tables.test.ts |
| Actions | list_actions, get_action, create_action, update_action, delete_action, execute_action | actions.test.ts |

**Total: 42 tools across 8 domains.**

---

## High Priority Gaps

### 1. Table & Field Metadata WRITE — NOT IMPLEMENTED

All metadata **read** operations are solid. All **write** operations are completely absent. This is the core data modeling write gap.

Needed tools:
- `update_table` — `PUT /api/table/{id}` — Set display name, description, visibility. Foundational for building a clean semantic layer
- `update_field` — `PUT /api/field/{id}` — Rename columns, add descriptions, set semantic types, set visibility, set cast type, configure filter widget type, set FK display mapping
- `rescan_field_values` — `POST /api/field/{id}/rescan_values` — Refresh filter dropdown values
- `discard_field_values` — `POST /api/field/{id}/discard_values` — Clear stale cached values
- `reorder_fields` — `PUT /api/table/{id}/fields/order` — Custom field ordering

### 2. User & Group Management — NOT IMPLEMENTED

No user, group, or permission management exists at all. Critical for admin automation.

Needed tools:
- `list_users` / `get_user` / `create_user` / `update_user` / `deactivate_user` — User lifecycle
- `get_current_user` — `GET /api/user/current` — Identity of the authenticated user
- `list_groups` / `create_group` / `update_group` / `delete_group` — Group management
- `add_group_member` / `remove_group_member` — Group membership

### 3. Permissions — NOT IMPLEMENTED

No permission management. Needed for multi-tenant provisioning and security auditing.

Needed tools:
- `get_permissions_graph` / `update_permissions_graph` — Full data permissions (view-data, create-queries split)
- `get_collection_permissions` / `update_collection_permissions` — Collection-level access control

### 4. Metrics API — NOT IMPLEMENTED

Published metrics are core to the semantic layer. Zero coverage.

Needed tools:
- `list_metrics` / `get_metric` — Discover/inspect metrics
- `execute_metric_query` — Run metric-based queries
- `get_metric_breakout_values` — Get dimension values for a metric

### 5. Segments API — NOT IMPLEMENTED

Reusable named filters — zero coverage.

Needed tools:
- `list_segments` / `get_segment` / `create_segment` / `update_segment` / `delete_segment`

### 6. Database Sync & Write Operations — NOT IMPLEMENTED

Database connections are read-only. No sync triggers, no create/update/delete.

Needed tools:
- `create_database` / `update_database` / `delete_database` — Database connection management
- `validate_database` — `POST /api/database/validate` — Test connection parameters
- `sync_database_schema` — `POST /api/database/{id}/sync_schema` — Trigger after schema changes
- `notify_database` — `POST /api/notify/db/{id}` — Post-ETL pipeline hook

### 7. Alerts & Subscriptions — NOT IMPLEMENTED

No tools for automated monitoring or scheduled report delivery.

Needed tools:
- `list_alerts` / `create_alert` / `update_alert` / `delete_alert` — Question result alerts
- `list_subscriptions` / `create_subscription` / `update_subscription` / `delete_subscription` — Dashboard email/Slack delivery

### 8. Version History & Revisions — NOT IMPLEMENTED

No safety tooling for an AI agent making edits.

Needed tools:
- `list_revisions` — `GET /api/revision` — View change history for cards/dashboards
- `revert_revision` — `POST /api/revision/revert` — Roll back to a prior version

---

## Medium Priority Gaps

### 10. Model & Metric Type Support — PARTIALLY IMPLEMENTED

`create_card` and `update_card` don't expose the `type` field in their Zod schemas. An agent cannot create a model (`type: "model"`) or metric (`type: "metric"`) through the documented tool interface. The `update_card` tool also lacks `result_metadata` for setting per-column model metadata.

### 11. Glossary API — NOT IMPLEMENTED

Business term definitions that Metabot uses for query understanding. CRUD via `/api/glossary`.

### 12. Documents API — NOT IMPLEMENTED

Narrative analytics documents combining text and charts. CRUD via `/api/document`. Available on all plans since v58.

### 13. Transforms API — NOT IMPLEMENTED

Data transformation jobs (SQL/Python). Comprehensive endpoints via `/api/transform` and `/api/transform-job`.

### 14. Automagic Dashboards (X-Rays) — NOT IMPLEMENTED

`GET /api/automagic-dashboards/table/{id}` generates instant exploratory analytics. Highly useful for data discovery.

### 15. Settings Management — NOT IMPLEMENTED

`GET /api/setting` / `PUT /api/setting/{key}` for instance configuration. Tests already call these directly on the raw client as a workaround (e.g., enabling public sharing).

### 16. Cache Management — NOT IMPLEMENTED

`POST /api/cache/invalidate`, `PUT /api/cache` for cache policies.

### 17. CSV Upload — NOT IMPLEMENTED

`POST /api/upload/csv` for ad-hoc data ingestion.

### 18. Model Persistence — NOT IMPLEMENTED

`POST /api/persist/card/{id}` (enable), `DELETE /api/persist/card/{id}` (disable), `POST /api/persist/card/{id}/refresh` (manual refresh).

### 19. Content Verification — NOT IMPLEMENTED

`POST /api/moderation-review` to mark content as verified. Pro/Enterprise.

### 20. Bookmarks & Pinning — NOT IMPLEMENTED

`POST /api/bookmark` for bookmarks, `PUT /api/collection/{id}/items` for pinning.

---

## Lower Priority Gaps

### 21. Events & Timelines — NOT IMPLEMENTED
`/api/timeline` and `/api/timeline-event` — annotate charts with dates.

### 22. Activity Feed — NOT IMPLEMENTED
`GET /api/activity` — recent user activity stream.

### 23. Background Tasks — NOT IMPLEMENTED
`GET /api/task` — scheduled task status (sync health monitoring).

### 24. Entity ID Translation — NOT IMPLEMENTED
`POST /api/eid-translation/translate` — resolve serialization IDs.

### 25. SQL Snippets — NOT IMPLEMENTED
`/api/native-query-snippet` — reusable SQL blocks.

### 26. Public Action Forms — NOT IMPLEMENTED
`POST /api/action/{id}/public_link` — analogous to card/dashboard public links.

### 27. Embedding Configuration — NOT IMPLEMENTED
Static embed token generation, `enable_embedding` toggle, CORS origins settings.

---

## Partially Implemented — Test Coverage Gaps

### Cards Domain
- **Parameterized queries**: Excellently tested (date, number, text, multi-param, date/month-year)
- **Structured queries (MBQL)**: Only one simple test — no joins, filters, aggregations, sorting, or custom columns tested
- **Chart types**: Only `pie`, `bar`, `line` tested — missing `area`, `combo`, `pivot`, `gauge`, `progress`, `funnel`, `map`, `scatter`, `waterfall`, `sankey`, `box_plot`, `histogram`
- **Model creation**: No test creates a card with `type: "model"` directly
- **Export formats**: No CSV/XLSX/JSON export tests

### Dashboards Domain
- **Filter types**: Only `date/range` tested — missing Location, ID, Number, Text/Category, Boolean, Time Grouping
- **Dashboard tabs**: No tests for tab creation/management
- **Non-question cards**: No tests for text/heading/iframe/link cards
- **Click behaviors**: No tests for cross-filtering or custom click destinations
- **Visualization overrides**: Only `card.title` tested

### Collections Domain
- **Official collections**: No test for `authority_level: "official"`
- **Personal collections**: `list_collections` hardcodes `personal-only: false`
- **Collection tree**: `GET /api/collection/tree` not implemented

### Search Domain
- **Archived items**: Hardcoded `archived: false` — cannot search trash
- **Advanced filters**: Missing `creator`, `last_editor`, `creation_date`, `verified` status filters

### Actions Domain
- **All tests conditionally skipped** when sample DB doesn't have write-back enabled — CI coverage is environment-dependent

---

## Not Applicable to MCP

These feature categories are frontend/UI/visualization concerns that cannot be exposed via a backend MCP server:

- **Visualizations**: Chart rendering, conditional formatting, chart type selection, viz settings UI
- **Embedding SDK**: React components, web components, theming, CSS, iframes, PostMessage
- **UI Features**: Dark mode, keyboard shortcuts, command palette, drag-and-drop, data preview
- **Installation**: Docker, JAR, Podman, systemd, Jetty config, CLI commands
- **Infrastructure**: Backup, JMX, heap dumps, Prometheus (monitoring agent could use `/metrics` but this is ops tooling)

---

## Summary: Priority Implementation Roadmap

| Priority | Domain | New Tools | Impact |
|----------|--------|-----------|--------|
| P0 | Table/Field Metadata Write | 5 tools | Enables semantic layer curation |
| P1 | Users & Groups | 10 tools | Admin automation, multi-tenant provisioning |
| P1 | Permissions | 4 tools | Security, access control, compliance |
| P1 | Metrics | 4 tools | Semantic layer completeness |
| P1 | Segments | 5 tools | Reusable filter definitions |
| P1 | DB Sync & Write | 5 tools | Data pipeline integration |
| P2 | Alerts & Subscriptions | 8 tools | Automated monitoring & reporting |
| P2 | Revisions | 2 tools | Safety tooling for AI edits |
| P2 | Card/Dashboard type param | Schema fix | Model/metric creation support |
| P2 | Glossary | 4 tools | AI-assisted query understanding |
| P2 | Documents | 4 tools | Narrative analytics |
| P2 | Settings | 2 tools | Instance configuration |
| P3 | Transforms | 5 tools | Data transformation jobs |
| P3 | X-Rays | 1 tool | Instant data exploration |
| P3 | CSV Upload | 1 tool | Ad-hoc data ingestion |
| P3 | Cache Management | 2 tools | Performance optimization |
| P3 | Model Persistence | 3 tools | Query caching control |
| P3 | Remaining gaps | ~15 tools | Events, bookmarks, snippets, etc. |

Note: Agent API (`/api/agent/v1`) was evaluated and **intentionally skipped** — it is a simplified wrapper over the same REST API endpoints already used by this MCP server. Everything it offers (search, metadata, query construction/execution) is achievable through the existing `/api/search`, `/api/table`, `/api/field`, `/api/dataset`, and `/api/card` endpoints.
