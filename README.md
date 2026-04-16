# @serdnaley/metabase-mcp

MCP server for Metabase — comprehensive coverage of the Metabase REST API for AI assistants.

Metabase ships a [built-in MCP](https://www.metabase.com/docs/master/ai/mcp) for querying data. This project goes further: **128 tools** covering dashboards, questions, collections, users, permissions, alerts, settings, and more — so AI assistants can fully manage Metabase, not just read from it.

## Features

- **128 MCP tools** across 26 domains: search, databases, tables, collections, cards, dashboards, actions, dataset, users, groups, permissions, segments, revisions, settings, alerts, subscriptions, glossary, documents, timelines, bookmarks, moderation, snippets, x-rays, cache, persistence, uploads
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

*Either `METABASE_API_KEY` or both `METABASE_EMAIL` + `METABASE_PASSWORD` must be provided. API key is recommended.

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

### Read tools (50 — always available)

| Domain | Tools |
|---|---|
| **Search** | `search` |
| **Databases** | `list_databases`, `get_database`, `get_database_metadata`, `list_database_schemas`, `get_database_schema` |
| **Tables & Fields** | `get_table`, `get_table_query_metadata`, `get_field`, `get_field_values` |
| **Collections** | `list_collections`, `get_collection`, `list_collection_items`, `get_collection_tree` |
| **Cards** | `list_cards`, `get_card`, `execute_card_query` |
| **Dashboards** | `list_dashboards`, `get_dashboard` |
| **Actions** | `list_actions`, `get_action` |
| **Dataset** | `execute_query` |
| **Users & Groups** | `list_users`, `get_user`, `get_current_user`, `list_groups` |
| **Permissions** | `get_permissions_graph`, `get_collection_permissions` |
| **Segments** | `list_segments`, `get_segment` |
| **Revisions** | `list_revisions` |
| **Settings** | `list_settings`, `get_setting` |
| **Alerts** | `list_alerts`, `get_alert`, `list_dashboard_subscriptions` |
| **Activity** | `get_activity`, `list_tasks`, `get_task` |
| **Snippets** | `list_snippets`, `get_snippet` |
| **Glossary** | `list_glossary_terms`, `get_glossary_term` |
| **Documents** | `list_documents`, `get_document` |
| **Timelines** | `list_timelines`, `get_timeline` |
| **Bookmarks** | `list_bookmarks` |
| **X-Rays** | `generate_xray` |
| **EID Translation** | `translate_entity_ids` |

### Write tools (78 — disabled in read-only mode)

| Domain | Tools |
|---|---|
| **Collections** | `create_collection`, `update_collection` |
| **Cards** | `create_card`, `update_card`, `delete_card`, `copy_card`, `create_card_public_link`, `delete_card_public_link` |
| **Dashboards** | `create_dashboard`, `update_dashboard`, `delete_dashboard`, `copy_dashboard`, `update_dashboard_cards`, `create_dashboard_public_link`, `delete_dashboard_public_link` |
| **Actions** | `create_action`, `update_action`, `delete_action`, `execute_action`, `create_action_public_link`, `delete_action_public_link` |
| **Tables & Fields** | `update_table`, `update_field`, `rescan_field_values`, `discard_field_values`, `reorder_fields` |
| **Databases** | `create_database`, `update_database`, `delete_database`, `validate_database`, `sync_database_schema`, `notify_database` |
| **Users & Groups** | `create_user`, `update_user`, `deactivate_user`, `reactivate_user`, `create_group`, `update_group`, `delete_group`, `add_group_member`, `remove_group_member` |
| **Permissions** | `update_permissions_graph`, `update_collection_permissions` |
| **Segments** | `create_segment`, `update_segment`, `delete_segment` |
| **Revisions** | `revert_revision` |
| **Settings** | `update_setting` |
| **Alerts** | `create_alert`, `update_alert`, `delete_alert`, `create_dashboard_subscription`, `update_dashboard_subscription`, `delete_dashboard_subscription` |
| **Snippets** | `create_snippet`, `update_snippet`, `delete_snippet` |
| **Glossary** | `create_glossary_term`, `update_glossary_term`, `delete_glossary_term` |
| **Documents** | `create_document`, `update_document`, `delete_document` |
| **Timelines** | `create_timeline`, `update_timeline`, `delete_timeline`, `create_timeline_event`, `update_timeline_event`, `delete_timeline_event` |
| **Bookmarks** | `create_bookmark`, `delete_bookmark` |
| **Moderation** | `create_moderation_review` |
| **Cache** | `invalidate_cache`, `update_cache_config` |
| **Persistence** | `persist_model`, `unpersist_model`, `refresh_persisted_model` |
| **Upload** | `upload_csv` |

## Security

**`execute_query` is available even in read-only mode.** It can execute arbitrary SQL against any database the configured Metabase account has access to. Metabase enforces its own permission model, but this tool does not add additional restrictions.

To prevent write operations, ensure the Metabase API key or account has **read-only database permissions** within Metabase itself.

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
docker compose up -d             # Start Metabase
./tests/ci/wait-for-metabase.sh  # Wait for ready (~15s)
bun test                         # 202 tests, 668 assertions
docker compose down              # Stop Metabase
```

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
