# Metabase API changes: v0.59.6 → v0.64.3.4 (+ v0.65 beta)

What changed in Metabase between the version our CI last passed on (v0.59.6, April 2026) and `metabase/metabase:latest`
(v0.64.3.4, Oct 2026), from the point of view of this MCP server.

How it was checked: a semantic diff of the bundled OpenAPI specs (`api-v0.59.json` vs `api-v0.64.json`) for every endpoint
in `src/services/*`, Metabase's official API changelog and release notes, and live probes against a running v0.64.3.4.
Cosmetic schema renames and new optional response fields are left out.

## Version timeline

| Version | First release | Notes for API clients |
|---|---|---|
| 0.59 | beta 2026-02-11, 0.59.6 on 2026-04-09 | Our baseline. Transforms introduced. Security backports continued to 0.59.31 (Sep 2026). |
| 0.60 | beta 2026-03-27, 0.60.1 on 2026-04-20 | Metabot + Agent API (`/api/agent/v1`) + built-in MCP server in OSS. Metrics explorer. Security-hardening release **0.60.25** (also 0.59.29+): undocumented API usage is no longer supported, and card query parameters must carry an `id`. |
| 0.61 | beta 2026-05-04 | Metric math. `POST /api/metabot/describe/*` removed. |
| 0.62 | beta 2026-06-03 | Centralized alert management (`/api/notification/admin`), custom visualizations, ERD (EE), Metabase CLI. |
| 0.63 | beta 2026-07-08 | **Sample Database changed from H2 to SQLite** (no schema, so `schema = ""`). 2FA (EE), treemap, PDF in subscriptions. |
| 0.64 | beta 2026-09-24, 0.64.1 on 2026-10-07, now 0.64.3.4 | Security hardening. `table_id` removed from the segment/measure APIs. Action prefill endpoints moved from GET to POST. Notification permission tightening. Transforms must be explicitly enabled. Metric dimensions. Transform indexes / DAG runs. MCP v2 at `/api/metabase-mcp`. |
| 0.65 | beta 2026-10-13 | Transform target-table conflict now returns 409 instead of 403. `POST /api/llm/generate-sql` and `POST /api/product-feedback` removed. Actions belong to collections. Custom email subject for subscriptions. Data apps (`/api/apps`, paid). |
| 0.66 | (master, unreleased) | `can-write-metadata` / `can-write` query params removed. `include_hidden` on `/metadata` no longer returns `sensitive` fields. |

Note: from 0.57 on, queries are **stored and returned as MBQL 5** (`{"lib/type":"mbql/query","database":…,"stages":[…]}`).
Legacy MBQL 4 input is still accepted when it is a *full* query (`type` + `database` + `query`/`native`). Pass
`GET /api/card/:id?legacy-mbql=true` to read a card back as MBQL 4.

## Breaking changes affecting this repo

### Version-related (they broke between 0.59.6 and 0.64)

1. **Card query parameters need `id`.** Calling `POST /api/card/{card-id}/query` returns 400
   `parameters.id: missing required key`. The schema always declared it, but enforcement came with the 0.60.25 /
   0.59.29 security hardening.
   - Where: `src/services/cards.ts` → `executeCardQuery` (tool `execute_card_query`); the e2e test uses it too.
   - Also: v0.64 no longer fills in `card.parameters` for native template tags (we saw `parameters: []`). The tags sit
     in MBQL 5 form at `dataset_query.stages[0]["template-tags"]`, as an **array** that carries `id`.
   - Fix: build each parameter as `{ id: tag.id, type, target: ["variable", ["template-tag", name]], value }`. Prefer
     the matching `card.parameters[]` entry (its `id`, `type`, `target`) when there is one, and fall back to the
     template tag's `id`. Live check: the same body with `id` added returns `completed`.

2. **Segment (and measure) definitions: no `table_id`, a full query is required.** v0.64 #77716 "Remove redundant
   table id from segment and measure API". `POST /api/segment` dropped `table_id` from the schema; the table is now
   derived from `definition`. A bare `{filter: …}` / `{source-table, filter}` definition gets
   `Query must include :lib/type or :type`.
   - Where: `src/services/segments.ts` → `createSegment` and `updateSegment` (tools `create_segment` and
     `update_segment`), plus `tests/services/segments.test.ts`.
   - Fix: send a full query. Legacy form works:
     `{"type":"query","database":<db>,"query":{"source-table":<table>,"filter":[…]}}`. MBQL 5 works too. Keep
     `table_id` as a tool input and use it (plus the table's `db_id`) to wrap a bare filter. A stray `table_id` in the
     body is tolerated today but is no longer in the schema, so drop it. Responses come back as MBQL 5
     (`definition.stages[0].filters`), so tests must not assert legacy shape.

3. **`getDatabaseSchema` returns "Not found." on the Sample Database.** The endpoint is unchanged. The cause is that the
   0.63 Sample Database is **SQLite with no schemas**: `GET /api/database/1/schemas` returns `[""]`, and
   `/schema/<name>` returns 404.
   - Where: `src/services/databases.ts` → `getDatabaseSchema` (tool `get_database_schema`), plus
     `tests/services/databases.test.ts`.
   - Fix: when `schema === ""`, call `GET /api/database/{id}/schema/` (trailing slash, the schemaless route; works
     live). The route without the slash gives "API endpoint does not exist". Tests must not assume `PUBLIC`.
   - Related: tests that create or validate an `engine: "h2"` database, or use H2 SQL against the sample DB
     (`PUBLIC.ORDERS`), are now on shaky ground. Use SQLite-compatible SQL with unqualified table names.

4. **`GET /api/collection/{id}/items` query params renamed to kebab-case.** `sort_column`, `sort_direction`,
   `pinned_state`, `official_collections_first` and `show_dashboard_questions` became `sort-column`,
   `sort-direction`, `pinned-state`, `official-collections-first` and `show-dashboard-questions`. The snake_case
   versions are **silently ignored** (no error). Live check: sorting by name desc only takes effect with kebab-case.
   - Where: `src/services/collections.ts` → `listCollectionItems` (tool `list_collection_items`).
   - Fix: rename the query keys. New optional params also exist: `q`, `include-available-models`,
     `show-exploration-documents`, and `models` now accepts `measure`.

5. **Action prefill moved from GET to POST** (0.64, no deprecation period). `GET /api/action/:id/execute` became
   `POST /api/action/:id/execute/values`, and the dashcard and public variants moved likewise. Our `executeAction`
   uses `POST /api/action/{id}/execute`, which is unaffected. Only matters if we add a "get action form values" tool.
   Also, `POST/PUT /api/action` now return 403 for native actions when the caller lacks native permission.

6. **Notification API tightening (0.64).** `PUT /api/notification/:id` ignores a body `id` / `payload.id`.
   `POST /api/notification/:id/send` needs write access (creator or admin). Inline handler `channel` / `template`
   definitions need channel permissions. `POST /api/notification/send` no longer accepts `id` / `payload_id`. This
   only affects us once the alert tools are moved to `/api/notification` (see below).

7. **Transforms must be enabled on self-hosted** (`MB_TRANSFORMS_ENABLED=true` or in Data Studio) before
   `/api/transform*` works. Live: `GET /api/transform` returns "You don't have permissions to do that." Relevant if we
   add transform tools, and for the CI docker-compose env.

### Already broken on v0.59 (wrong endpoints, not caused by the upgrade)

None of these routes exists in *either* spec. Live v0.64 answers "API endpoint does not exist." Tests either swallowed
the error or didn't cover them.

| Service / tool | Calls | Fix |
|---|---|---|
| `activity.ts` `getActivity` (`get_activity`) | `GET /api/activity` (removed in 0.52) | `GET /api/activity/recents?context=views` (`context` required: `views` and/or `selections`), and/or `GET /api/activity/popular_items`. Avoid `recent_views` (deprecated). |
| `notifications.ts` `createAlert` / `updateAlert` / `deleteAlert` | `POST /api/alert`, `PUT/DELETE /api/alert/{id}` (alerts moved to notifications in 0.54; only `GET /api/alert[/id]` remains for compat) | `POST /api/notification` with `{payload_type:"notification/card", payload:{card_id, send_condition:"has_result"\|"goal_above"\|"goal_below", send_once}, handlers:[{channel_type:"channel/email", recipients:[{type:"notification-recipient/user", user_id}]}], subscriptions:[{type:"notification-subscription/cron", cron_schedule:"0 0 9 * * ? *"}]}` (verified live). Update with `PUT /api/notification/{id}`; "delete" means `PUT … {active:false}`. List with `GET /api/notification?card_id=&payload_type=notification/card`. |
| `notifications.ts` `listDashboardSubscriptions` / `createDashboardSubscription` | `GET /api/dashboard/{id}/subscriptions`, `POST /api/dashboard/{id}/subscription` | `GET /api/pulse?dashboard_id=`, `POST /api/pulse` (`{name, dashboard_id, cards, channels, parameters}`). |
| `notifications.ts` `deleteDashboardSubscription` | `DELETE /api/pulse/{id}` | `PUT /api/pulse/{id}` `{archived:true}` (or `DELETE /api/pulse/{id}/subscription` to unsubscribe yourself). |
| `persistence.ts` persist / unpersist | `POST/DELETE /api/persist/card/{id}` | `POST /api/persist/card/{card-id}/persist` and `…/unpersist`. Model persistence is being superseded by transforms (0.60 "replace models with transforms"). |
| `glossary.ts` `getGlossaryTerm` | `GET /api/glossary/{id}` | Doesn't exist (only PUT/DELETE). Filter `GET /api/glossary` client-side. |
| `xrays.ts` | `GET /api/automagic-dashboards/table/{id}` | Works: it matches `/{entity}/{entity-id-or-query}`. No change needed; just untyped. |

### Diffed and found safe (no client-visible change for our calls)

`/api/card` POST/PUT (only dropped the irrelevant `parameter_mappings[].dashcard`), `/api/dashboard*`, `/api/dataset`
(legacy queries still accepted), `/api/database*` (`include` now also accepts `schemas`; `is_stub` is a new optional
field), `/api/table/{id}/fields/order` (an array is still accepted), `/api/search` (`context` is now an enum and
`has_temporal_dim` / `non_temporal_dim_ids` were removed; we send neither), `/api/timeline*` (icon enum widened),
`/api/user*`, `/api/permissions*`, `/api/collection/graph`, `/api/setting*`, `/api/field*`, `/api/native-query-snippet*`,
`/api/revision*`, `/api/cache*`, `/api/upload/csv`, `/api/document*`, `/api/eid-translation`, `/api/task*`.

## Deprecations

- `GET /api/dashboard` (used by `listDashboards`) is marked "unused by the frontend… may be removed in the future".
  Migrate to `GET /api/search?models=dashboard` or collection items.
- `GET /api/activity/recent_views`: deprecated, use `/api/activity/recents`.
- `PUT /api/table` (bulk): deprecated in favour of `PUT /api/table/edit`.
- MBQL 4 in responses: gone since 0.57 (opaque MBQL 5). `?legacy-mbql=true` exists only on `GET /api/card/:id`. Tool
  descriptions in `src/tools/cards.ts` still document legacy shapes. They work for input, but say so, and expect MBQL
  5 back.
- `/api/pulse` for alerts. Dashboard subscriptions still use pulse; alerts live in `/api/notification`.
- Legacy Druid driver deprecated (0.62). Model persistence is being steered toward transforms (0.60).
- Removed without replacement: `/api/ee/metabot-v3/*`, `/api/ee/metabot-tools/*` (moved to `/api/metabot/*` and
  `/api/agent/*`), `/api/ee/workspace/*`, `/api/ee/autodescribe/*`, `/api/ee/ai-sql-*`, `/api/llm/extract-tables`,
  `/api/llm/list-models`, `/api/agent/v1/construct-query` (now v2), and, in 0.65, `POST /api/llm/generate-sql` and
  `POST /api/product-feedback`.

## New features / endpoints worth new tools (ranked)

1. **Notifications, the correct alert API.** `GET/POST /api/notification`, `GET/PUT /api/notification/{id}`,
   `POST /api/notification/{id}/send`, `POST /api/notification/{id}/unsubscribe`. Replaces the broken alert writes
   above, so this one is required, not optional.
2. **Metrics (OSS, 0.60+).** `GET /api/metric`, `GET /api/metric/{id}` (with dimensions), and
   `POST /api/metric/dataset`, which runs a metric or measure, including metric math, with breakouts and filters. The
   best way for an agent to get governed numbers without writing SQL.
3. **Metric dimensions (0.64).** `GET /api/metric/{id}/dimension`, `POST …/dimension/add|remove|reorder|set-default`,
   `POST /api/metric/breakout-values`, and `GET /api/metric/{id}/dimension/{key}/values|search`. Lets an agent discover
   valid breakouts and filter values for a metric.
4. **Measures** (existed in 0.59, not covered yet). `GET/POST /api/measure`, `GET/PUT /api/measure/{id}`, plus 0.64
   dimension value/search/remapping endpoints. Same definition rules as segments (full query, no `table_id`).
5. **Transforms (0.59+, enable flag required).** `GET/POST /api/transform`, `GET/PUT/DELETE /api/transform/{id}`,
   `POST /api/transform/{id}/run`, `POST /api/transform/{id}/run-dag` + `GET …/dag-transforms`,
   `GET /api/transform/runs`, `/api/transform-job*` (+ runs/cancel), `/api/transform-tag`. Warehouse-side modelling;
   increasingly the recommended replacement for persisted models.
6. **Dashboard PDF export (0.64).** `POST /api/dashboard/{id}/pdf` returns a server-rendered PDF with parameter
   overrides. Handy for "send me this dashboard".
7. **Card export.** `POST /api/card/{card-id}/query/{export-format}` (csv/xlsx/json), with the same `parameters[].id`
   rule. Lets the agent return files rather than JSON rows.
8. **Alert admin (0.62).** `GET /api/notification/admin` (paged, filter by `last_send_status`, orphaned or erroring)
   and `POST /api/notification/admin/bulk` (archive or change creator). Admin housekeeping.
9. **Transform indexes (0.64).** `GET /api/index?transform_id=`, `POST /api/index/request`,
   `GET/PUT/DELETE /api/index/request/{id}`.
10. **Comments.** `GET/POST /api/comment` (+ PUT/DELETE) on documents and entities. Fits the existing documents tools.
11. **Collection items metadata (0.64).** `GET /api/collection/{id}/items/metadata` (which models exist + count). Cheap
    pre-flight before listing.
12. **`POST /api/field/table-ids`** (field IDs → table IDs) and **`GET /api/table`** (all tables, `can-query` filter):
    small helpers for query building.
13. **Dependencies (EE).** `GET /api/ee/dependencies/graph` and `…/graph/dependents`: impact analysis before
    editing or deleting.
14. **Agent API v2 (OSS).** `POST /api/agent/v2/construct-query` + `POST /api/agent/v2/query` (portable MBQL 5 JSON,
    continuation-token paging), `POST /api/agent/v1/execute-sql`, and `POST /api/agent/v1/read-resource`
    (`metabase://` URIs). Metabase's own agent surface: it could back a robust "build structured query" tool instead
    of hand-written MBQL. Note that Metabase now ships its own MCP server (v2 at `/api/metabase-mcp`, per-group tool
    access in 0.65); worth positioning this repo against it.
15. Lower priority / EE: `GET /api/ee/erd` (schema ERD), `/api/embed-theme*` (embedding themes),
    `/api/ee/mfa/admin/*` (2FA enrolment lists), `/api/ee/replacement/*` (replace data source),
    `GET /api/health-inspector`, `GET /api/typed-schemas/v1/typescript`, `/api/osi/ai-context*`, and `/api/apps*` (0.65
    data apps, paid). Skipped: metabot/LLM-provider internals and custom-viz plugins.

## Sources

- Metabase API changelog: `docs/developers-guide/api-changelog.md` in metabase/metabase (master, includes 0.64, 0.65
  and 0.66 entries); <https://www.metabase.com/docs/latest/developers-guide/api-changelog>
- Release notes: <https://www.metabase.com/changelog/60> … `/61` `/62` `/63` `/64` `/65` (breaking-changes sections,
  the 60.25 security-release note on parameter ids, 64 "Remove redundant table id from segment and measure API
  #77716", 63 Sample Database → SQLite)
- GitHub releases of metabase/metabase (`gh api repos/metabase/metabase/releases`): dates only; the bodies link to the
  changelog pages above
- OpenAPI specs: `/data/workspaces/metabase-mcp/local/api-v0.59.json` and `api-v0.64.json`, semantic diff over
  `local/used.txt` and every `client.GET/POST/PUT/DELETE` path in `src/services/*`
- Live probes against local Metabase v0.64.3.4 (2026-10-26): card query with and without `parameters[].id`, segment
  create variants, schemaless `/schema/`, collection-items kebab params, `POST /api/notification` card alert, and
  404s for the dead routes above
