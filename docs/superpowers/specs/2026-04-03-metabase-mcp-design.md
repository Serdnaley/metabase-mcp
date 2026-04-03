# Metabase MCP — Write Tools Extension

## Overview

An MCP server that extends Metabase's built-in MCP (which is read/query focused) with write tools to create, edit, and manage dashboards, questions, collections, and actions. Distributed as an npm package, run via `npx`.

## Problem

Metabase's built-in MCP exposes 8 tools focused on querying data (search, get_table, construct_query, execute_query, etc.). There are no tools for creating or managing content — dashboards, questions, collections, actions. This MCP fills that gap.

## Tech Stack

- **Runtime**: Node.js (via `npx` distribution)
- **Dev/Build**: Bun (install, build, test, scripts)
- **Language**: TypeScript
- **MCP SDK**: `@modelcontextprotocol/sdk` (stdio transport)
- **HTTP Client**: `openapi-fetch` + `openapi-typescript` (types from Metabase's OpenAPI spec)
- **Validation**: `zod` for tool input schemas
- **Bundler**: `bun build` (outputs Node-compatible JS)
- **Publish**: npm registry

## Architecture

```
MCP Tool (zod schema + handler)
  → Service function (business logic, response formatting)
    → openapi-fetch client (type-safe HTTP, auth middleware)
      → Metabase REST API
```

Functional approach throughout — no classes. Functions grouped by domain, client passed through.

## Project Structure

```
metabase-mcp/
├── src/
│   ├── index.ts                  # Entry point: parse config, create client, register tools, start server
│   ├── config.ts                 # Env var parsing + validation
│   ├── client.ts                 # openapi-fetch client factory + auth middleware
│   ├── services/
│   │   ├── cards.ts
│   │   ├── dashboards.ts
│   │   ├── collections.ts
│   │   ├── databases.ts
│   │   ├── tables.ts
│   │   ├── search.ts
│   │   └── actions.ts
│   └── tools/
│       ├── cards.ts
│       ├── dashboards.ts
│       ├── collections.ts
│       ├── databases.ts
│       ├── tables.ts
│       ├── search.ts
│       ├── actions.ts
│       └── index.ts              # registerAllTools(server, client, config)
├── scripts/
│   └── generate-types.ts         # Downloads api.json, runs openapi-typescript
├── generated/
│   └── metabase-api.d.ts         # Generated types (committed)
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `METABASE_URL` | Yes | Base URL of the Metabase instance |
| `METABASE_API_KEY` | No* | API key for authentication |
| `METABASE_EMAIL` | No* | Email for session-based auth |
| `METABASE_PASSWORD` | No* | Password for session-based auth |
| `METABASE_READ_ONLY_MODE` | No | When `true`, only registers read tools (default: `false`) |

*Either `METABASE_API_KEY` or `METABASE_EMAIL` + `METABASE_PASSWORD` must be provided. If both are set, API key takes precedence.

### Auth Strategy

- **API Key**: Sets `X-API-Key` header on every request
- **Session**: Calls `POST /api/session` on startup with email/password, uses returned token as `X-Metabase-Session` header
- **Validation**: Startup fails with clear error if no auth credentials provided

### Usage

```json
{
  "mcpServers": {
    "metabase": {
      "command": "npx",
      "args": ["-y", "@serdnaley/metabase-mcp"],
      "env": {
        "METABASE_URL": "https://metabase.example.com",
        "METABASE_API_KEY": "mb_xxx"
      }
    }
  }
}
```

## Tools

### Read-Only Mode Behavior

`registerAllTools()` checks `config.readOnly`. When `true`, write tools (marked W below) are not registered. No runtime checks — the tools simply don't exist.

### Search & Discovery

| Tool | Mode | API Endpoint | Description |
|---|---|---|---|
| `search` | R | `GET /api/search` | Search across all Metabase entities |

### Databases

| Tool | Mode | API Endpoint | Description |
|---|---|---|---|
| `list_databases` | R | `GET /api/database` | List all accessible databases |
| `get_database` | R | `GET /api/database/{id}` | Get database details |
| `get_database_metadata` | R | `GET /api/database/{id}/metadata` | Full metadata: tables, fields, types, relationships |
| `list_database_schemas` | R | `GET /api/database/{id}/schemas` | List schemas in a database |
| `get_database_schema` | R | `GET /api/database/{id}/schema/{schema}` | Get tables within a specific schema |

### Tables & Fields

| Tool | Mode | API Endpoint | Description |
|---|---|---|---|
| `get_table` | R | `GET /api/table/{id}` | Get table details and field info |
| `get_table_query_metadata` | R | `GET /api/table/{id}/query_metadata` | Full query metadata (fields, FKs, metrics) |
| `get_field` | R | `GET /api/field/{id}` | Field details: type, fingerprint |
| `get_field_values` | R | `GET /api/field/{id}/values` | Sample values for a field |

### Collections

| Tool | Mode | API Endpoint | Description |
|---|---|---|---|
| `list_collections` | R | `GET /api/collection` | List all collections |
| `get_collection` | R | `GET /api/collection/{id}` | Get collection details |
| `list_collection_items` | R | `GET /api/collection/{id}/items` | Items in a collection |
| `create_collection` | W | `POST /api/collection` | Create a new collection |
| `update_collection` | W | `PUT /api/collection/{id}` | Update collection properties |

### Cards (Questions)

| Tool | Mode | API Endpoint | Description |
|---|---|---|---|
| `list_cards` | R | `GET /api/card` | List all saved questions |
| `get_card` | R | `GET /api/card/{id}` | Card details (query, visualization) |
| `create_card` | W | `POST /api/card` | Create a question (native SQL or structured) |
| `update_card` | W | `PUT /api/card/{id}` | Update question query, display, name |
| `delete_card` | W | `DELETE /api/card/{id}` | Archive/delete a card |
| `copy_card` | W | `POST /api/card/{id}/copy` | Copy a card to a collection |
| `execute_card_query` | R | `POST /api/card/{id}/query` | Run a saved question, return results |

### Dashboards

| Tool | Mode | API Endpoint | Description |
|---|---|---|---|
| `list_dashboards` | R | `GET /api/dashboard` | List all dashboards |
| `get_dashboard` | R | `GET /api/dashboard/{id}` | Dashboard with all cards/layout |
| `create_dashboard` | W | `POST /api/dashboard` | Create a new dashboard |
| `update_dashboard` | W | `PUT /api/dashboard/{id}` | Update dashboard properties |
| `delete_dashboard` | W | `DELETE /api/dashboard/{id}` | Archive/delete a dashboard |
| `copy_dashboard` | W | `POST /api/dashboard/{from-dashboard-id}/copy` | Copy a dashboard |
| `update_dashboard_cards` | W | `PUT /api/dashboard/{id}/cards` | Add/remove/reposition cards |

### Actions

| Tool | Mode | API Endpoint | Description |
|---|---|---|---|
| `list_actions` | R | `GET /api/action` | List all actions |
| `get_action` | R | `GET /api/action/{action-id}` | Action details |
| `create_action` | W | `POST /api/action` | Create an action |
| `update_action` | W | `PUT /api/action/{id}` | Update an action |
| `delete_action` | W | `DELETE /api/action/{action-id}` | Delete an action |
| `execute_action` | W | `POST /api/action/{id}/execute` | Run an action |

### Dataset

| Tool | Mode | API Endpoint | Description |
|---|---|---|---|
| `execute_query` | R | `POST /api/dataset` | Run ad-hoc query (native SQL or structured) |

**Total: 35 tools** (15 read, 20 write)

## Dependencies

### Production
- `@modelcontextprotocol/sdk`
- `openapi-fetch`
- `zod`

### Development
- `openapi-typescript`
- `typescript`
- `@types/node`

## Type Generation

`scripts/generate-types.ts` downloads `https://www.metabase.com/docs/master/api.json` and runs `openapi-typescript` to produce `generated/metabase-api.d.ts`. Generated types are committed to the repo so builds don't require network access.

## Error Handling

Service functions catch API errors and return structured MCP error responses with:
- HTTP status code from Metabase
- Error message from Metabase's response body
- The endpoint that failed

No retry logic — let the AI client decide whether to retry.

## Package Distribution

- Package name: `@serdnaley/metabase-mcp`
- `bin` field in package.json points to bundled `dist/index.js`
- `bun build` produces a single Node-compatible JS bundle
- Published to npm registry
