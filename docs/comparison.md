# Metabase MCP servers compared

Snapshot of 2026-10-26. Sources: GitHub API (stars, last push, releases, workflows), shallow clones of each repo
(tool counts are unique tool names extracted from source, not README claims), npm downloads API (last 30 days,
2026-09-23 → 2026-10-22), pypistats, the official MCP Registry, Glama and PulseMCP listings, and a live probe of
Metabase v0.64.3.4 OSS for the built-in server. "—" means not supported; "?" means not verified.

## Summary

| Project | Lang | ★ | Last push / release | Transport | Auth (headless?) | Tools | Read-only switch | Writes | Tests / CI | Downloads (30d) |
|---|---|---|---|---|---|---|---|---|---|---|
| **[Serdnaley/metabase-mcp](https://github.com/Serdnaley/metabase-mcp)** (this repo) | TS | 0 | 2026-10-26 / v0.2.0 (2026-04-16) | stdio | API key **or** email/password session; custom headers (e.g. Cloudflare Access) — **headless: yes** | **161** (30 domains) | `METABASE_READ_ONLY_MODE` (hides write tools) | full CRUD + admin | unit + e2e against real Metabase in CI (pinned 0.64.3.4, weekly `latest`) | npm 208,400¹ |
| [Metabase built-in MCP](https://www.metabase.com/docs/latest/ai/mcp) (`/api/metabase-mcp`, registry `io.github.metabase/mcp`) | Clojure (in Metabase) | — | ships with Metabase ≥ 0.60 (v2 in 0.64) | Streamable HTTP (remote) | OAuth 2.0 (documented, the only documented path); `X-API-Key` **works but is undocumented**² — headless: yes, unofficially | 21 | OAuth scopes only (none for API-key sessions) | questions, dashboards, collections, documents, metrics, measures, segments, alerts, subscriptions | Metabase's own suite | n/a (built in) |
| [imlewc/metabase-server](https://github.com/imlewc/metabase-server) | TS | 151 | 2026-04-03 / none (npm 0.1.0) | stdio | API key or username/password — yes | 34 | — | cards, dashboards, collections, users, groups, collection perms | 1 test file, no CI | npm 1,376 |
| [jerichosequitin/metabase-mcp](https://github.com/jerichosequitin/metabase-mcp) | TS | 88 | 2026-09-22 / v1.1.7 (2026-07-22) | stdio | API key or email/password; `METABASE_PROXY_AUTHORIZATION` (e.g. Google IAP) — yes | 6 (+8 resources, 2 prompts) | on by default (SQL limited to SELECT) | none (read + export only) | 13 test files, CI | npm 2,282 |
| [easecloudio/mcp-metabase-server](https://github.com/easecloudio/mcp-metabase-server) | TS | 83 | 2026-05-14 / v1.3.0 (2026-05-14) | stdio | API key or username/password — yes | 95 | — | cards, dashboards, collections, databases, tables, public links, CSV append | none; release workflow only | npm 2,713 |
| [hluaguo/metabase-mcp](https://github.com/hluaguo/metabase-mcp) (formerly cheukyin175) | Python (FastMCP) | 73 | 2026-04-13 / none | stdio, SSE, Streamable HTTP | API key or email/password — yes | 15 | — | cards, dashboard cards, collections | none | not on PyPI (run from source) |
| [CognitionAI/metabase-mcp-server](https://github.com/CognitionAI/metabase-mcp-server) | TS | 63 | 2026-08-17 / npm 2.2.0 | stdio (+ `sse-server.js` wrapper that spawns stdio) | API key or username/password — yes | 87 | tool sets: `--essential` (default) / `--write` / `--all` | cards, dashboards, collections, databases, tables | none; publish workflow | npm 14,801 |
| [enessari/metabase-ai-assistant](https://github.com/enessari/metabase-ai-assistant) | JS | 48 | 2026-09-03 / v5.3.0 (2026-09-01) | stdio, SSE | API key or username/password; optional direct DB creds + Anthropic/OpenAI keys — yes | 152 | `METABASE_READ_ONLY_MODE` | Metabase content + direct DB DDL (tables, views, indexes), dbt sync | 53 test files, no CI | npm 178 |
| [hyeongjun-dev/metabase-mcp-server](https://github.com/hyeongjun-dev/metabase-mcp-server) | TS | 36 | 2025-04-13 / v0.1.0 — stale | stdio | API key or email/password — yes | 6 | — | — | none | ?³ |
| [CW-Codewalnut/Metabase-MCP-Server](https://github.com/CW-Codewalnut/Metabase-MCP-Server) | Python (FastMCP) | 17 | 2026-07-21 / none | stdio, SSE, Streamable HTTP | API key only — yes | 30 | write / admin / SQL groups, off by default on remote transports | collections, cards, dashboards, databases, users, groups | 2 test files, no CI | ? |
| [Naveen-chava/metabase-mcp](https://github.com/Naveen-chava/metabase-mcp) | Go | 6 | 2026-07-05 / none | stdio | browser session cookie only (no API key) — no | 13 | — | create card | 17 test files | n/a |
| [1luvc0d3/metabase-mcp](https://github.com/1luvc0d3/metabase-mcp) | TS | 5 | 2026-08-08 / v1.4.1 (2026-07-12) | stdio, Streamable HTTP (bearer `MCP_AUTH_TOKEN`) | API key only — yes | 30 | modes read / write / full + per-tool allow/deny | cards, dashboards, collections | 15 test files, CI | npm 58 |
| [takeokunn/metabase-mcp](https://github.com/takeokunn/metabase-mcp) | TS | 3 | 2026-08-03 / v1.1.1 (2026-04-10) | stdio | API key only (HTTPS required except localhost) — yes | **429** (59 categories) | — | ~130 mutating tools across the OSS API | 427 test files, CI | npm 34 |
| [ruminaider/metabase-mcp-server](https://github.com/ruminaider/metabase-mcp-server) | TS | 1 | 2026-03-20 / none | stdio | API key, email/password or session token — yes | 46 | `METABASE_READ_ONLY` | cards, dashboards, collections | 15 test files, CI | npm 46 |
| [Arkanji/metabase-mcp-server](https://github.com/Arkanji/metabase-mcp-server) | TS | 1 | 2026-04-02 / none | stdio | API key — yes | 14 | read-only by design | — | none | ? |
| [cuenca-mx/metabase-mcp-server](https://github.com/cuenca-mx/metabase-mcp-server) | Python | 5 | 2025-11-26 / 0.1.1 (2025-06-18) — stale | stdio | API key — yes | 8 | — | create card, bookmark | tests + CI | ? |
| [sazboxai/MCP_MetaBase](https://github.com/sazboxai/MCP_MetaBase) | Python | 7 | 2025-05-12 — stale | stdio | API key — yes | ~9 | — | execute actions | none | n/a |
| [zavora-ai/mcp-bi](https://github.com/zavora-ai/mcp-bi) | Rust | 1 | 2026-09-12 / v0.5.0 | ? | Metabase token or username/password | 15 (multi-BI, Metabase is one backend) | — | — | 1 test file | crates.io |

¹ npm-reported. The daily series runs 5–13k with several zero days, which points to automated installs (CI or
agent sandboxes running `npx`), not 208k humans. Don't quote it as users.
² Verified live on v0.64.3.4 OSS: no auth → 401 with an OAuth `WWW-Authenticate` challenge; `X-API-Key: mb_…` →
`initialize` 200, `tools/list` returns 21 tools, `tools/call search` returns data; `Authorization: Bearer <api key>`
→ 401. In source (`src/metabase/mcp/transport.clj`) any request the session middleware authenticated (cookie or API
key) is dispatched with unrestricted scopes. The docs say the opposite (`llms-install.md`: "there is no API key, no
token to paste"), so this path can change without notice. It still needs an admin to enable MCP (Admin > AI > MCP)
with AI features on, and Metabase ≥ 0.60.
³ PyPI `metabase-mcp` 1.0.0 (1,984 downloads/30d) points at `hyeongjun-dev/metabase-mcp`, a repo that no longer
exists; it may be unrelated to this TS server.

Not a server: [metabase/metabase-cursor-plugin](https://github.com/metabase/metabase-cursor-plugin) (official) is a
Cursor skill + config that connects Cursor to the built-in MCP. Long tail (0–1 ★, mostly forks or personal
projects): sjcarrillo-bold and imazhar101 (easecloudio forks), voducdan (hluaguo fork), im-voracity (Cognition port
to Python), Sanjeev4523/metabase-lite-mcp, nchgn, manish-coder-1007/metabase-mcp-navi, raxityo/mb-mcp,
gobenpark, dezer32, anaryk, wertycn, livingroot, gutierreztejedo, primrose-mcp, nabi-health and ~30 more on
GitHub search "metabase mcp".

### Coverage by domain

✓ = read and write tools, R = read only, ◐ = one or two tools, — = none. Judged from tool names in source.

| Domain | ours | built-in | takeokunn | enessari | easecloudio | Cognition | imlewc | jerichosequitin | 1luvc0d3 |
|---|---|---|---|---|---|---|---|---|---|
| Query / SQL | ✓ | ✓ (validated MBQL, paging) | ✓ | ✓ (+ AI SQL) | ✓ | ✓ | ✓ | ✓ | ✓ (+ NL→SQL) |
| Cards | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | R | ✓ |
| Dashboards | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | R | ✓ |
| Collections | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | R | ✓ |
| Users / groups / permissions | ✓ | — | ✓ | ✓ | ◐ | ◐ | ✓ | — | — |
| Databases / tables / fields | ✓ | R | ✓ | ✓ | ✓ | ✓ | R | R | R |
| Segments / metrics / measures | ✓ | ✓ | ✓ | ◐ | — | — | — | R (metrics) | — |
| Transforms | ✓ | — | — | — | — | — | — | — | — |
| Alerts / subscriptions | ✓ | ✓ | ✓ | ◐ | — | — | — | — | — |
| Exports (csv/json/xlsx, PDF) | ✓ (incl. dashboard PDF) | — | ✓ | ◐ | ◐ | ◐ | — | ✓ (up to 1M rows) | — |
| Admin / settings / cache | ✓ | — | ✓ (incl. email, Slack, LDAP, API keys, tasks, logs) | ◐ | ◐ | — | — | — | — |
| Documents | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| Actions | ✓ | — | ✓ | ✓ | — | — | — | — | — |

## Headless use and auth

"Headless" here means running the MCP where nobody can click through a browser login: on a server, in CI, inside
your own app or agent.

- **Built-in MCP:** documented as OAuth-only (browser consent page, dynamic client registration). An API key in
  `X-API-Key` does work today (verified above), but it is undocumented, bypasses scopes (the key's user gets
  unrestricted MCP access), requires an admin to switch MCP on and AI features to be enabled, and needs Metabase ≥
  0.60. A client also has to speak Streamable HTTP and let you set a custom header.
- **Community servers:** nearly all accept a plain Metabase API key, and most also take email/password. The
  exceptions are Naveen-chava (browser cookie only) and the built-in server's documented path. So "API key support"
  is not a differentiator against the community — it is one against the official server's documented, supported path.
- **What actually sets us apart for headless use:** API key *or* session login (for instances where API keys are
  disabled or the user isn't an admin), `METABASE_CUSTOM_HEADERS` for instances behind Cloudflare Access / IAP-style
  proxies (only jerichosequitin has a comparable proxy header), a read-only switch, no dependency on the instance's
  MCP or AI settings, and support for Metabase < 0.60.
- **What we lack for headless use:** a network transport. Today an agent platform has to spawn us over stdio;
  hluaguo, CW-Codewalnut and 1luvc0d3 can run as a shared HTTP service (1luvc0d3 with its own bearer token).

## Per-project notes

- **Metabase built-in.** 21 task-shaped tools (`search`, `browse_collection`, `browse_data`, `get_content`,
  `execute_query`, `execute_sql`, `run_saved_question`, `glossary`, `learn`, `*_write` for questions, dashboards,
  collections, documents, metrics, measures, segments, alerts, subscriptions, plus `bookmark_content`,
  `duplicate_content`; `visualize_query` for clients that render inline charts). Best at analysis: validated MBQL
  with teaching errors, cursor paging, reusable query handles, inline charts, per-user OAuth with audit. No admin,
  permissions, database management, settings, transforms or exports. Details: `docs/positioning-vs-metabase-mcp.md`.
- **imlewc/metabase-server.** The most-starred community server and the first one (Mar 2025), but no releases, no
  license file, last push April 2026. 34 tools, resources, Smithery + Docker.
- **jerichosequitin/metabase-mcp.** Small, polished, read-focused: 6 compound tools (`search`, `retrieve`, `list`,
  `execute`, `export`, `clear_cache`), MCP resources and prompts, response caching, exports up to 1M rows,
  `readOnlyHint` annotations, `.mcpb` bundle, listed in the Claude Desktop connector directory, top Glama grades,
  DeepWiki badge. The trust/distribution benchmark.
- **easecloudio/mcp-metabase-server** and **CognitionAI/metabase-mcp-server.** Near-identical tool sets (95 vs 87;
  many forks derive from these). Strong on cards/dashboards/tables, embedding/public links, CSV append; weak on
  admin. Cognition's essential/write/all tool sets keep the default context small and it has the second-highest
  npm downloads (14.8k/30d). Neither has tests; Cognition has 26 open issues.
- **hluaguo/metabase-mcp.** Single-file FastMCP server, 15 tools incl. MongoDB native queries; the most-starred
  Python option and one of the few with HTTP transport.
- **enessari/metabase-ai-assistant.** 152 tools, but a different product: AI SQL generation/healing, dbt sync and
  lineage, direct database access (DDL, VACUUM, indexes), Metabase docs fetching, semantic memory. Needs LLM keys for
  the AI tools. Listed in the official MCP Registry; Docker, Smithery, `.mcpb`, README in 4 languages, llms.txt.
- **takeokunn/metabase-mcp.** The broadest API coverage: 429 tools over 59 categories, including areas we don't
  cover (embedding, API keys, email/Slack/LDAP settings, tasks, logs, setup, comments, model index, cloud migration).
  427 test files. But: API token only, stdio only, no read-only mode, no tool filtering (429 tools is a heavy
  context load), no transforms, almost no adoption (3 ★, 34 downloads).
- **1luvc0d3/metabase-mcp.** 30 tools with operational controls: read/write/full modes, per-tool allow/deny,
  SQL guardrails, rate limits, audit log, batch and workflow tools, NL→SQL and insights via its own Anthropic key,
  Streamable HTTP with bearer auth. Positions itself against the built-in MCP on headless use — the same pitch we
  want.
- **CW-Codewalnut.** Python, 30 tools, all three transports, `.dxt` bundle; write/admin/SQL groups default off on
  remote transports — a sensible safety default.
- **ruminaider.** 46 tools, read-only flag, caching, batch retrieval, tested. Low adoption.
- **Naveen-chava.** Go, cookie-only auth for people without API keys or credentials.
- **Stale:** hyeongjun-dev (Apr 2025), sazboxai (May 2025), cuenca-mx (Jun 2025 release).

## Gaps: where others beat us (ranked by value)

1. **Streamable HTTP transport with bearer auth.** Needed to run as a shared service for agents and apps — the
   headless story we want to lead on. Have it: built-in, hluaguo, CW-Codewalnut, 1luvc0d3 (SSE: enessari).
2. **Tool selection beyond read-only.** 161 tools cost a lot of context. Cognition (essential/write/all),
   1luvc0d3 (modes + allow/deny) and CW (groups) let users load a subset. Add toolsets by domain
   (`METABASE_TOOLSETS=cards,dashboards,…`) plus an allow/deny list.
3. **Distribution and trust signals.** We have no LICENSE file (GitHub shows "no license" although
   `package.json` says MIT), no README badges, 0 stars, and no listing in the MCP Registry, Glama, PulseMCP or
   Smithery. Others have: npm/CI/license badges (jerichosequitin, 1luvc0d3, takeokunn), Glama score badge
   (jerichosequitin, 1luvc0d3), DeepWiki badge, official MCP Registry `server.json` (enessari), Smithery
   (imlewc, easecloudio, Cognition, enessari), `.mcpb`/`.dxt` one-click bundle and the Claude Desktop directory
   (jerichosequitin, CW, enessari), Docker image (most), multi-language README and `llms.txt` (enessari).
4. **Tool annotations** (`readOnlyHint`, `destructiveHint`, `idempotentHint`). Clients use them to auto-approve
   reads and confirm deletes. Have it: jerichosequitin, 1luvc0d3, enessari. Cheap for us: read/write split already
   exists.
5. **Large-result handling.** Row caps, response trimming, caching: jerichosequitin (optimized responses, cache
   TTL, 1M-row export to file), ruminaider (caching, batch retrieval), 1luvc0d3 (`METABASE_MAX_ROWS`). We have no
   row-limit or response-size setting.
6. **Docker image** for the HTTP mode and for platforms that run MCPs as containers (imlewc, easecloudio,
   Cognition, jerichosequitin, enessari, CW, ruminaider). Our `docker-compose.yml` only starts Metabase for tests.
7. **MCP resources and prompts.** jerichosequitin (8 resource templates, 2 prompts), imlewc, easecloudio,
   hyeongjun (resources). Useful for "attach this dashboard" UX; lower priority than tools.
8. **Remaining API breadth.** takeokunn covers embedding/signed JWT, API keys, email/Slack/LDAP settings,
   tasks/logs, setup, comments, model index. Worth closing the admin-relevant parts (API keys, embedding settings,
   tasks/logs) since admin is our positioning.
9. **Query building helpers.** Built-in has validated MBQL with paging and handles; 1luvc0d3 has SQL
   validate/explain/optimize and NL→SQL. Low value for us: the built-in server owns analysis.
10. **Chart rendering.** Built-in `visualize_query` (inline charts in supporting clients); zavora renders charts
    for Superset only. Low value.
11. **Python package.** hluaguo, CW, cuenca exist, but MCP clients don't care about the server's language;
    `npx` is enough. Lowest value.

## Where we lead

- **Admin and operations coverage with a safety switch.** Users, groups, memberships, permission graphs,
  databases (add/update/delete/sync/rescan), data-model writes, settings, caching, persistence, timelines,
  snippets, moderation, revisions/revert — with a read-only mode. Only takeokunn is broader, and it has no
  read-only mode or tool filtering.
- **Newest Metabase features nobody else has:** transforms (create/run/jobs/tags/runs) — no other server; dashboard
  PDF export; documents, measures and metric execution (only the built-in and takeokunn cover documents/measures).
- **Tested against real Metabase.** CI runs the suite against a pinned Metabase (0.64.3.4) plus a weekly
  `metabase:latest` drift check; verified on 0.59.6. takeokunn has more test files (427); whether they hit a
  live Metabase was not checked.
- **Typed client generated from Metabase's OpenAPI spec**, so endpoint drift shows up as type errors.
- **Headless-friendly auth:** API key or email/password session, custom headers for proxied instances, no
  dependency on the instance enabling MCP or AI features, works below 0.60.
- **Adoption by npm count** (208k/30d vs 14.8k for the next) — with the caveat in note ¹.
