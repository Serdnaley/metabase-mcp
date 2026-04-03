# @serdnaley/metabase-mcp

MCP server for Metabase — extends the built-in MCP with write tools for managing dashboards, questions, collections, and actions.

## Features

- **35 MCP tools** across 7 domains: search, databases, tables, collections, cards, dashboards, actions
- **Read & write**: Create, update, delete dashboards, questions, and collections
- **Read-only mode**: Restrict to read-only tools via environment variable
- **Type-safe**: Generated from Metabase's OpenAPI spec
- **Two auth modes**: API key or email/password session

## Quick Start

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

## Configuration

| Variable | Required | Description |
|---|---|---|
| `METABASE_URL` | Yes | Base URL of your Metabase instance |
| `METABASE_API_KEY` | No* | API key for authentication |
| `METABASE_EMAIL` | No* | Email for session-based auth |
| `METABASE_PASSWORD` | No* | Password for session-based auth |
| `METABASE_READ_ONLY_MODE` | No | Set to `true` to disable write tools |

*Either `METABASE_API_KEY` or both `METABASE_EMAIL` + `METABASE_PASSWORD` must be provided.

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
| `create_card` | Create a question |
| `update_card` | Update a question |
| `delete_card` | Delete a question |
| `copy_card` | Copy a question |
| `create_dashboard` | Create a dashboard |
| `update_dashboard` | Update dashboard properties |
| `delete_dashboard` | Delete a dashboard |
| `copy_dashboard` | Copy a dashboard |
| `update_dashboard_cards` | Manage cards on a dashboard |
| `create_action` | Create an action |
| `update_action` | Update an action |
| `delete_action` | Delete an action |
| `execute_action` | Run an action |

## Security Notice

**`execute_query` is always available, even in read-only mode.** This tool can run arbitrary SQL (including `INSERT`, `UPDATE`, `DELETE`, `DROP`) against any database the configured Metabase account has access to. Metabase enforces its own permission model, but this tool does not add additional restrictions.

If you need to prevent all write operations at the MCP level, ensure the Metabase API key or account used has read-only database permissions within Metabase itself.

## Development

```bash
bun install
bun run dev                    # Run with bun
bun run build                  # Build for npm
bun run generate-types         # Regenerate OpenAPI types
```

## Testing

```bash
docker compose up -d           # Start Metabase
./tests/ci/wait-for-metabase.sh  # Wait for ready
bun test                       # Run tests (74 tests, 225 assertions)
```

## License

MIT
