# @serdnaley/metabase-mcp

[![npm version](https://img.shields.io/npm/v/@serdnaley/metabase-mcp.svg)](https://www.npmjs.com/package/@serdnaley/metabase-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tests](https://github.com/Serdnaley/metabase-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/Serdnaley/metabase-mcp/actions/workflows/test.yml)
[![Metabase](https://img.shields.io/badge/Metabase-0.59%20%E2%80%93%200.64-509ee3.svg)](docs/metabase-changes-0.59-to-0.64.md)
[![MCP](https://img.shields.io/badge/MCP-stdio%20%7C%20HTTP-6e56cf.svg)](https://modelcontextprotocol.io)
[![Glama score](https://glama.ai/mcp/servers/Serdnaley/metabase-mcp/badges/score.svg)](https://glama.ai/mcp/servers/Serdnaley/metabase-mcp)

**The headless MCP server for Metabase.** Plug Metabase into any AI agent, app, CI job or server with a plain **API key**: no OAuth flow, no browser, no admin switch to flip.

- **Headless auth.** A Metabase API key (or email/password) is all it needs. That works where an interactive OAuth login can't: servers, CI, containers, your own app or agent. Metabase's built-in MCP is documented as OAuth-only and needs an admin to enable it on 0.60+.
- **Runs locally or as a service.** stdio for desktop clients, or Streamable HTTP with a bearer token for shared and server deployments. Metabase credentials stay on the server.
- **Full coverage.** **161 tools** for querying and for running Metabase: dashboards, questions, collections, users, groups, permissions, databases, settings, alerts, transforms, exports and more.
- **Only the tools you need.** Toolsets and per-tool enable/disable keep the model's context small. Every tool carries read-only/destructive hints, so clients can auto-approve reads.
- **Any Metabase.** Works with Metabase OSS (free) and paid editions, tested against 0.59 and 0.64. Paid-only features (caching, model persistence, moderation) work when your instance has them; CI covers the free edition.

How it compares with Metabase's built-in MCP and other Metabase MCP servers: [docs/comparison.md](docs/comparison.md). Full tool catalog: [serdnaley.github.io/metabase-mcp](https://serdnaley.github.io/metabase-mcp/).

## Features

- **161 MCP tools** across 30 toolsets: search, databases, tables, collections, cards, dashboards, actions, dataset, users, groups, permissions, segments, revisions, settings, alerts, subscriptions, glossary, documents, timelines, bookmarks, moderation, snippets, x-rays, cache, persistence, uploads, metrics, measures, transforms, exports
- **Toolsets**: load only what you need (`METABASE_TOOLSETS=query`), add or drop single tools with globs
- **Tool annotations**: `readOnlyHint` / `destructiveHint` / `idempotentHint` on every tool
- **stdio or HTTP**: Streamable HTTP with bearer auth for shared deployments
- **Read-only mode**: hide every write tool with one env var
- **Admin automation**: users, groups, permissions, settings, database connections, transforms
- **Type-safe**: HTTP client generated from Metabase's OpenAPI spec
- **Zero config**: runs via `npx`, no installation needed

## Installation

<details>
<summary><strong>Claude Desktop (one-click bundle)</strong></summary>

Download `metabase-mcp-X.Y.Z.mcpb` from the [latest release](https://github.com/Serdnaley/metabase-mcp/releases/latest) and open it: Claude Desktop shows a form for the Metabase URL and API key. No Node.js setup or JSON editing.

</details>

<details>
<summary><strong>Claude Desktop (JSON config)</strong></summary>

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "metabase": {
      "command": "npx",
      "args": ["-y", "@serdnaley/metabase-mcp"],
      "env": {
        "METABASE_URL": "https://your-metabase.example.com",
        "METABASE_API_KEY": "mb_xxx"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

</details>

<details>
<summary><strong>Claude Code (CLI)</strong></summary>

```bash
claude mcp add metabase \
  --env METABASE_URL=https://your-metabase.example.com \
  --env METABASE_API_KEY=mb_xxx \
  -- npx -y @serdnaley/metabase-mcp
```

Or add to `.claude/mcp.json`:

```json
{
  "mcpServers": {
    "metabase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@serdnaley/metabase-mcp"],
      "env": {
        "METABASE_URL": "https://your-metabase.example.com",
        "METABASE_API_KEY": "mb_xxx"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Cursor</strong></summary>

Add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

```json
{
  "mcpServers": {
    "metabase": {
      "command": "npx",
      "args": ["-y", "@serdnaley/metabase-mcp"],
      "env": {
        "METABASE_URL": "https://your-metabase.example.com",
        "METABASE_API_KEY": "mb_xxx"
      }
    }
  }
}
```

Restart Cursor after saving.

</details>

<details>
<summary><strong>Windsurf</strong></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "metabase": {
      "command": "npx",
      "args": ["-y", "@serdnaley/metabase-mcp"],
      "env": {
        "METABASE_URL": "https://your-metabase.example.com",
        "METABASE_API_KEY": "mb_xxx"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Cline (VS Code)</strong></summary>

Add to your Cline MCP settings (accessible via the MCP Servers icon):

```json
{
  "mcpServers": {
    "metabase": {
      "command": "npx",
      "args": ["-y", "@serdnaley/metabase-mcp"],
      "env": {
        "METABASE_URL": "https://your-metabase.example.com",
        "METABASE_API_KEY": "mb_xxx"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Continue (VS Code)</strong></summary>

Add to `.continue/config.yaml`:

```yaml
mcpServers:
  - name: metabase
    command: npx
    args:
      - "-y"
      - "@serdnaley/metabase-mcp"
    env:
      METABASE_URL: "https://your-metabase.example.com"
      METABASE_API_KEY: "mb_xxx"
```

</details>

<details>
<summary><strong>Zed</strong></summary>

Add to your Zed `settings.json`:

```json
{
  "context_servers": {
    "metabase": {
      "command": "npx",
      "args": ["-y", "@serdnaley/metabase-mcp"],
      "env": {
        "METABASE_URL": "https://your-metabase.example.com",
        "METABASE_API_KEY": "mb_xxx"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Remote / HTTP (any client that speaks Streamable HTTP)</strong></summary>

Run the server once in HTTP mode (see [HTTP mode](#http-mode-shared--server-deployments)), then point clients at it. Claude Code:

```bash
claude mcp add --transport http metabase https://mcp.example.com/mcp \
  --header "Authorization: Bearer $MCP_HTTP_TOKEN"
```

Generic JSON config (Cursor, VS Code and others):

```json
{
  "mcpServers": {
    "metabase": {
      "url": "https://mcp.example.com/mcp",
      "headers": { "Authorization": "Bearer <MCP_HTTP_TOKEN>" }
    }
  }
}
```

</details>

## Configuration

| Variable | Required | Description |
|---|---|---|
| `METABASE_URL` | Yes | Base URL of your Metabase instance |
| `METABASE_API_KEY` | No* | API key for authentication |
| `METABASE_EMAIL` | No* | Email for session-based auth |
| `METABASE_PASSWORD` | No* | Password for session-based auth |
| `METABASE_READ_ONLY_MODE` | No | Set to `true` to disable write tools |
| `METABASE_CUSTOM_HEADERS` | No | Extra HTTP headers sent on every request, including the session login (see below) |
| `METABASE_TOOLSETS` | No | Comma list of toolsets or presets to load (default: all). See [Toolsets](#toolsets) |
| `METABASE_TOOLS_ENABLE` | No | Extra tools to load on top of the toolsets (names or globs, e.g. `get_card,export_*`) |
| `METABASE_TOOLS_DISABLE` | No | Tools never to load (names or globs); always wins over enable |
| `MCP_TRANSPORT` | No | `stdio` (default) or `http`. `--http` on the command line does the same |
| `MCP_HTTP_HOST` / `MCP_HTTP_PORT` | No | HTTP bind address, default `127.0.0.1:3333` (`PORT` also works) |
| `MCP_HTTP_TOKEN` | HTTP mode | Bearer token clients must send (min. 16 chars) |
| `MCP_HTTP_ALLOW_NO_AUTH` | No | `true` runs HTTP without a token, only on a loopback host |

*Either `METABASE_API_KEY` or both `METABASE_EMAIL` + `METABASE_PASSWORD` must be provided. API key is recommended.

### Custom headers

Use `METABASE_CUSTOM_HEADERS` when Metabase sits behind a proxy that needs its own headers, such as Cloudflare Access service tokens. Give it a JSON object:

```bash
METABASE_CUSTOM_HEADERS='{"CF-Access-Client-Id": "xxx.access", "CF-Access-Client-Secret": "yyy"}'
```

or `Name: value` pairs separated by newlines or `;`:

```bash
METABASE_CUSTOM_HEADERS='CF-Access-Client-Id: xxx.access; CF-Access-Client-Secret: yyy'
```

The auth headers (`X-API-Key`, `X-Metabase-Session`) always win over a custom header with the same name. A malformed value stops the server at startup.

### Toolsets

Each tool domain is a toolset (`dashboards`, `users`, `transforms`, ...; the full list is in [Tools](#tools)). Presets bundle them:

| Preset | For |
|---|---|
| `all` | everything (default) |
| `query` | exploring and querying data: search, databases, tables, dataset, cards, metrics, measures, segments, exports, activity, x-rays |
| `content` | building and organising content: collections, cards, dashboards, documents, snippets, timelines, alerts, ... |
| `admin` | running the instance: users, permissions, settings, databases, tables, cache, uploads, transforms, actions, ... |

```bash
METABASE_TOOLSETS=query,dashboards      # analyst assistant
METABASE_TOOLS_ENABLE=create_card       # plus one write tool
METABASE_TOOLS_DISABLE='delete_*'       # never delete anything
```

Precedence, strongest first: **read-only mode > `METABASE_TOOLS_DISABLE` > `METABASE_TOOLS_ENABLE` > `METABASE_TOOLSETS`**. An unknown toolset stops the server at startup; an enable/disable pattern that matches nothing logs a warning. The startup log (stderr) shows how many tools are enabled.

### HTTP mode (shared / server deployments)

```bash
METABASE_URL=https://metabase.example.com \
METABASE_API_KEY=mb_xxx \
MCP_TRANSPORT=http MCP_HTTP_HOST=0.0.0.0 MCP_HTTP_PORT=3333 \
MCP_HTTP_TOKEN="$(openssl rand -hex 32)" \
npx -y @serdnaley/metabase-mcp
```

Clients connect to `http://<host>:3333/mcp` with `Authorization: Bearer <MCP_HTTP_TOKEN>`. `GET /health` answers without auth and reveals nothing. The endpoint is stateless (no sessions), so it scales horizontally. Put it behind TLS (a reverse proxy) when it leaves localhost. Everyone with the token acts as the Metabase API key's user, so give each audience its own key, token and toolsets.

Or as a container (`ghcr.io/serdnaley/metabase-mcp`, amd64 + arm64, HTTP mode by default):

```bash
docker run -p 3333:3333 \
  -e METABASE_URL=https://metabase.example.com -e METABASE_API_KEY=mb_xxx \
  -e MCP_HTTP_TOKEN="$(openssl rand -hex 32)" \
  ghcr.io/serdnaley/metabase-mcp
```

### Getting a Metabase API Key

1. Go to your Metabase instance
2. Click the gear icon > Admin settings > Authentication > API Keys
3. Click "Create API Key"
4. Give it a name and select the appropriate group (e.g., Administrators)
5. Copy the key — it starts with `mb_`

## Examples

### "Create a dashboard showing order trends"

The AI assistant will:
1. Use `search` and `get_database_metadata` to discover your data
2. Use `create_card` to create questions (e.g., orders by month, revenue by product)
3. Use `create_dashboard` to create the dashboard
4. Use `update_dashboard_cards` to arrange the cards with a layout

### "Move all Q4 reports to the Archive collection"

The AI assistant will:
1. Use `search` to find Q4 report cards
2. Use `create_collection` to create an Archive collection if needed
3. Use `update_card` on each card to move it to the new collection

### "What tables do we have in the analytics database?"

The AI assistant will:
1. Use `list_databases` to find the database
2. Use `get_database_metadata` to list all tables, fields, and relationships

## Tools

Full catalog with parameters: see the [tool catalog site](https://serdnaley.github.io/metabase-mcp/) (generated from the code).

<!-- tools:start (generated by scripts/generate-docs.ts, do not edit) -->

### Read tools (70, always available)

| Toolset | Tools |
|---|---|
| **Search** (`search`) | `search` |
| **Databases** (`databases`) | `list_databases`, `get_database`, `get_database_metadata`, `list_database_schemas`, `get_database_schema` |
| **Tables & Fields** (`tables`) | `get_table`, `get_table_query_metadata`, `get_field`, `get_field_values` |
| **Collections** (`collections`) | `get_collection_tree`, `list_collections`, `get_collection`, `list_collection_items` |
| **Cards** (`cards`) | `list_cards`, `get_card`, `execute_card_query` |
| **Dashboards** (`dashboards`) | `list_dashboards`, `get_dashboard` |
| **Actions** (`actions`) | `list_actions`, `get_action` |
| **Dataset (ad-hoc queries)** (`dataset`) | `execute_query` |
| **Users & Groups** (`users`) | `list_users`, `get_user`, `get_current_user`, `list_groups`, `get_group` |
| **Permissions** (`permissions`) | `get_permissions_graph`, `get_collection_permissions` |
| **Segments** (`segments`) | `list_segments`, `get_segment` |
| **Revisions** (`revisions`) | `list_revisions` |
| **Settings** (`settings`) | `list_settings`, `get_setting` |
| **Alerts & Subscriptions** (`notifications`) | `list_alerts`, `get_alert`, `list_dashboard_subscriptions`, `list_notifications` |
| **X-Rays** (`xrays`) | `generate_xray` |
| **Activity & Tasks** (`activity`) | `get_activity`, `get_recent_items`, `get_popular_items`, `list_tasks`, `get_task` |
| **Snippets** (`snippets`) | `list_snippets`, `get_snippet` |
| **Glossary** (`glossary`) | `list_glossary_terms`, `get_glossary_term` |
| **Documents** (`documents`) | `list_documents`, `get_document` |
| **Timelines** (`timelines`) | `list_timelines`, `get_timeline` |
| **Bookmarks** (`bookmarks`) | `list_bookmarks` |
| **EID Translation** (`eid-translation`) | `translate_entity_ids` |
| **Metrics** (`metrics`) | `list_metrics`, `get_metric`, `run_metric`, `list_metric_dimensions`, `get_metric_dimension_values` |
| **Measures** (`measures`) | `list_measures`, `get_measure` |
| **Transforms** (`transforms`) | `list_transforms`, `get_transform`, `list_transform_runs`, `get_transform_run`, `list_transform_jobs`, `list_transform_tags` |
| **Exports** (`exports`) | `export_card_query`, `export_query`, `export_dashboard_pdf` |

### Write tools (91, hidden in read-only mode)

| Toolset | Tools |
|---|---|
| **Databases** (`databases`) | `create_database`, `update_database`, `delete_database`, `validate_database`, `sync_database_schema` |
| **Tables & Fields** (`tables`) | `update_table`, `update_field`, `rescan_field_values`, `discard_field_values`, `reorder_fields` |
| **Collections** (`collections`) | `create_collection`, `update_collection` |
| **Cards** (`cards`) | `create_card`, `update_card`, `delete_card`, `copy_card`, `create_card_public_link`, `delete_card_public_link` |
| **Dashboards** (`dashboards`) | `create_dashboard`, `update_dashboard`, `delete_dashboard`, `copy_dashboard`, `update_dashboard_cards`, `create_dashboard_public_link`, `delete_dashboard_public_link` |
| **Actions** (`actions`) | `create_action`, `update_action`, `delete_action`, `execute_action`, `create_action_public_link`, `delete_action_public_link` |
| **Users & Groups** (`users`) | `create_user`, `update_user`, `deactivate_user`, `reactivate_user`, `create_group`, `update_group`, `delete_group`, `add_group_member`, `remove_group_member` |
| **Permissions** (`permissions`) | `update_permissions_graph`, `update_collection_permissions` |
| **Segments** (`segments`) | `create_segment`, `update_segment`, `delete_segment` |
| **Revisions** (`revisions`) | `revert_revision` |
| **Settings** (`settings`) | `update_setting` |
| **Alerts & Subscriptions** (`notifications`) | `send_notification`, `create_alert`, `update_alert`, `delete_alert`, `create_dashboard_subscription`, `update_dashboard_subscription`, `delete_dashboard_subscription` |
| **Cache** (`cache`) | `invalidate_cache`, `update_cache_config` |
| **Model Persistence** (`persistence`) | `persist_model`, `unpersist_model`, `refresh_persisted_model` |
| **Uploads** (`upload`) | `upload_csv` |
| **Snippets** (`snippets`) | `create_snippet`, `update_snippet`, `delete_snippet` |
| **Glossary** (`glossary`) | `create_glossary_term`, `update_glossary_term`, `delete_glossary_term` |
| **Documents** (`documents`) | `create_document`, `update_document`, `delete_document` |
| **Timelines** (`timelines`) | `create_timeline`, `update_timeline`, `delete_timeline`, `create_timeline_event`, `update_timeline_event`, `delete_timeline_event` |
| **Bookmarks** (`bookmarks`) | `create_bookmark`, `delete_bookmark` |
| **Moderation** (`moderation`) | `create_moderation_review` |
| **Metrics** (`metrics`) | `create_metric`, `update_metric` |
| **Measures** (`measures`) | `create_measure`, `update_measure` |
| **Transforms** (`transforms`) | `create_transform`, `update_transform`, `delete_transform`, `run_transform`, `cancel_transform_run`, `create_transform_job`, `run_transform_job`, `delete_transform_job`, `create_transform_tag` |

Presets for `METABASE_TOOLSETS`: `all` (everything); `query` (search, databases, tables, dataset, cards, metrics, measures, segments, exports, activity, xrays); `content` (search, collections, cards, dashboards, documents, snippets, timelines, bookmarks, glossary, revisions, moderation, notifications, exports); `admin` (users, permissions, settings, databases, tables, cache, persistence, upload, transforms, actions, activity, eid-translation).

<!-- tools:end -->

## Security

**`execute_query` is available even in read-only mode.** It can execute arbitrary SQL against any database the configured Metabase account has access to. Metabase enforces its own permission model, but this tool does not add additional restrictions.

To prevent write operations, ensure the Metabase API key or account has **read-only database permissions** within Metabase itself.

**Exports can write local files.** `export_card_query`, `export_query` and `export_dashboard_pdf` stay available in read-only mode (they only read from Metabase) and, when given `output_path`, write to that absolute path on the machine running the MCP server. They never overwrite an existing file unless `overwrite: true` is passed. Metabase applies the same access check to an export as to running the query; its separate "Download results" permission exists only on Pro/Enterprise.

**Read-only mode is not a security boundary.** `METABASE_READ_ONLY_MODE` only hides write tools. What a key can really do is set in Metabase: an API key gets the permissions of its group **plus All Users**. For a read-only assistant, put the key in a group with View-only collection access and "Create queries" set to query builder only (or no), and restrict All Users to no more than that. See [docs/read-only-and-permissions.md](docs/read-only-and-permissions.md) for the probe results and a setup checklist.

**HTTP mode requires a bearer token.** `MCP_TRANSPORT=http` refuses to start without `MCP_HTTP_TOKEN` (compared in constant time), unless `MCP_HTTP_ALLOW_NO_AUTH=true` on a loopback host, where Host-header checks block DNS rebinding. The token grants everything the configured Metabase key can do, so treat it like that key and serve the endpoint over TLS outside localhost.

**Raw SQL is one-click.** Read tools are marked `readOnlyHint: true`, including `execute_query` and `export_query`, so clients can auto-approve them. ⚠️ Their SQL is sent as-is: this server does not block `INSERT`/`UPDATE`/`DELETE`/DDL, and both tool descriptions say so. Use a Metabase API key whose group cannot run native queries (or a database user with read-only grants) if SQL must not write — see [docs/read-only-and-permissions.md](docs/read-only-and-permissions.md).

**Action types are restricted.** The `create_action` tool only allows `query` and `implicit` action types. HTTP actions (which could make arbitrary outbound requests) are blocked.

## Development

```bash
bun install
bun run dev                    # Start the MCP server
bun run build                  # Build for npm
bun run generate-types         # Regenerate types from Metabase OpenAPI spec
```

## Testing

Tests run against a real Metabase instance via Docker:

```bash
docker compose up -d             # Start Metabase (pinned version, see docker-compose.yml)
./tests/ci/wait-for-metabase.sh  # Wait for ready (~15s)
bun test                         # 276 tests
docker compose down              # Stop Metabase
```

Verified against Metabase **v0.64.3.4** (the CI pin) and **v0.59.6**. To try another release:
`MB_IMAGE=metabase/metabase:latest docker compose up -d`. CI also runs the suite weekly on
`metabase:latest` as a non-blocking job, so upstream API drift shows up before the pin is bumped.

Actions, transforms and CSV uploads run against the Postgres "Test Warehouse" from
`docker-compose.yml`. Features that need a paid plan or a missing service (moderation, cache
invalidation, model persistence, or the warehouse itself) are skipped explicitly with a
`SKIP … (environment)` log line; any other API error fails the test.

## How It Works

```
AI Client (Claude, Cursor, etc.)
  ↓ MCP protocol (stdio)
MCP Tool (zod schema + handler)
  ↓
Service function (business logic)
  ↓
openapi-fetch (type-safe HTTP client)
  ↓
Metabase REST API
```

The server generates TypeScript types from Metabase's [OpenAPI spec](https://www.metabase.com/docs/master/api.json) and uses [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) for type-safe API calls.

## License

MIT
