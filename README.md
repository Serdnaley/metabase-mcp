# @serdnaley/metabase-mcp

MCP server for Metabase — extends the built-in MCP with write tools for managing dashboards, questions, collections, and actions.

Metabase ships a [built-in MCP](https://www.metabase.com/docs/master/ai/mcp) for querying data. This project adds the missing piece: **creating and managing content** — dashboards, saved questions, collections, and actions — so AI assistants can build things in Metabase, not just read from it.

## Features

- **35 MCP tools** across 7 domains: search, databases, tables, collections, cards (questions), dashboards, actions
- **Full CRUD**: Create, read, update, delete, and copy dashboards, questions, and collections
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

### Read tools (always available)

| Tool | Description |
|---|---|
| `search` | Search across all Metabase entities |
| `list_databases` | List all accessible databases |
| `get_database` | Get database details |
| `get_database_metadata` | Get tables, fields, types, relationships |
| `list_database_schemas` | List schemas in a database |
| `get_database_schema` | Get tables in a schema |
| `get_table` | Get table details |
| `get_table_query_metadata` | Get query metadata (fields, FKs) |
| `get_field` | Get field details |
| `get_field_values` | Get sample field values |
| `list_collections` | List all collections |
| `get_collection` | Get collection details |
| `list_collection_items` | List items in a collection |
| `list_cards` | List all saved questions |
| `get_card` | Get question details |
| `execute_card_query` | Run a saved question |
| `list_dashboards` | List all dashboards |
| `get_dashboard` | Get dashboard with layout |
| `list_actions` | List all actions |
| `get_action` | Get action details |
| `execute_query` | Run ad-hoc SQL or structured queries |

### Write tools (disabled in read-only mode)

| Tool | Description |
|---|---|
| `create_collection` | Create a collection |
| `update_collection` | Update collection properties |
| `create_card` | Create a question (native SQL or structured) |
| `update_card` | Update a question |
| `delete_card` | Delete a question |
| `copy_card` | Copy a question to a collection |
| `create_dashboard` | Create a dashboard |
| `update_dashboard` | Update dashboard properties |
| `delete_dashboard` | Delete a dashboard |
| `copy_dashboard` | Copy a dashboard |
| `update_dashboard_cards` | Add, remove, or reposition cards on a dashboard |
| `create_action` | Create a query or implicit action |
| `update_action` | Update an action |
| `delete_action` | Delete an action |
| `execute_action` | Run an action |

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
bun test                         # 74 tests, 225 assertions
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
