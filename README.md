# @serdnaley/metabase-mcp

MCP server for Metabase — comprehensive coverage of the Metabase REST API for AI assistants.

Headless by design: it authenticates with a Metabase **API key** (or email/password), with no OAuth flow and no browser, so it runs in CI, agents and servers, and works on every Metabase tier, including free OSS. **161 tools** cover dashboards, questions, collections, users, permissions, alerts, settings and more, so AI assistants can fully manage Metabase, not just read from it.

**Comparison:** how this server stacks up against Metabase's built-in MCP and other Metabase MCP servers: [docs/comparison.md](docs/comparison.md).

## Features

- **161 MCP tools** across 30 toolsets: search, databases, tables, collections, cards, dashboards, actions, dataset, users, groups, permissions, segments, revisions, settings, alerts, subscriptions, glossary, documents, timelines, bookmarks, moderation, snippets, x-rays, cache, persistence, uploads, metrics, measures, transforms, exports
- **Full CRUD**: Create, read, update, delete across all domains
- **Admin automation**: User/group management, permissions, settings, database connections
- **Read-only mode**: Restrict to read-only tools via a single env var
- **Type-safe**: HTTP client generated from Metabase's OpenAPI spec
- **Two auth modes**: API key (recommended) or email/password session
- **Zero config**: Runs via `npx` — no installation needed

## Installation

<details>
<summary><strong>Claude Desktop</strong></summary>

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

## Configuration

| Variable | Required | Description |
|---|---|---|
| `METABASE_URL` | Yes | Base URL of your Metabase instance |
| `METABASE_API_KEY` | No* | API key for authentication |
| `METABASE_EMAIL` | No* | Email for session-based auth |
| `METABASE_PASSWORD` | No* | Password for session-based auth |
| `METABASE_READ_ONLY_MODE` | No | Set to `true` to disable write tools |
| `METABASE_CUSTOM_HEADERS` | No | Extra HTTP headers sent on every request, including the session login (see below) |

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
bun test                         # 216 tests
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
