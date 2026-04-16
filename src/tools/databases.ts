import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  listDatabases,
  getDatabase,
  getDatabaseMetadata,
  listDatabaseSchemas,
  getDatabaseSchema,
  createDatabase,
  updateDatabase,
  deleteDatabase,
  validateDatabase,
  syncDatabaseSchema,
  notifyDatabase,
} from "../services/databases.js";

export const registerDatabaseTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool("list_databases", "List all databases the user has access to", {}, async () => {
    const result = await listDatabases(client);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_database", "Get database details by ID", { id: z.number().describe("Database ID") }, async ({ id }) => {
    const result = await getDatabase(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_database_metadata", "Get full database metadata: tables, fields, types, relationships", { id: z.number().describe("Database ID") }, async ({ id }) => {
    const result = await getDatabaseMetadata(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("list_database_schemas", "List schemas in a database", { id: z.number().describe("Database ID") }, async ({ id }) => {
    const result = await listDatabaseSchemas(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_database_schema", "Get tables within a specific database schema", { id: z.number().describe("Database ID"), schema: z.string().describe("Schema name") }, async ({ id, schema }) => {
    const result = await getDatabaseSchema(client, id, schema);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  if (!config.readOnly) {
    server.tool(
      "create_database",
      "Add a new database connection to Metabase",
      {
        name: z.string().describe("Database display name"),
        engine: z.string().describe("Database engine (postgres, mysql, h2, bigquery, snowflake, etc.)"),
        details: z.record(z.string(), z.unknown()).describe("Connection details (host, port, dbname, user, password, ssl, etc.)"),
      },
      async (params) => {
        const result = await createDatabase(client, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "update_database",
      "Update an existing database connection configuration",
      {
        id: z.number().describe("Database ID"),
        name: z.string().optional().describe("New display name"),
        engine: z.string().optional().describe("Database engine"),
        details: z.record(z.string(), z.unknown()).optional().describe("Connection details to update"),
        is_full_sync: z.boolean().optional().describe("Whether to run a full sync on schedule"),
        auto_run_queries: z.boolean().optional().describe("Whether to automatically run queries when opening the database"),
      },
      async (params) => {
        const result = await updateDatabase(client, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "delete_database",
      "Delete a database connection from Metabase",
      {
        id: z.number().describe("Database ID"),
      },
      async ({ id }) => {
        const result = await deleteDatabase(client, id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "validate_database",
      "Test database connection parameters before saving to verify credentials and connectivity",
      {
        engine: z.string().describe("Database engine (postgres, mysql, h2, bigquery, snowflake, etc.)"),
        details: z.record(z.string(), z.unknown()).describe("Connection details to validate (host, port, dbname, user, password, etc.)"),
      },
      async (params) => {
        const result = await validateDatabase(client, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "sync_database_schema",
      "Trigger a schema resync on a database (use after DDL changes to pick up new or modified tables)",
      {
        id: z.number().describe("Database ID"),
      },
      async ({ id }) => {
        const result = await syncDatabaseSchema(client, id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "notify_database",
      "Send a post-ETL pipeline notification to trigger a schema sync on a database",
      {
        id: z.number().describe("Database ID"),
      },
      async ({ id }) => {
        const result = await notifyDatabase(client, id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );
  }
};
