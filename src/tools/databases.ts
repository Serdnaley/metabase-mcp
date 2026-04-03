import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import { listDatabases, getDatabase, getDatabaseMetadata, listDatabaseSchemas, getDatabaseSchema } from "../services/databases.js";

export const registerDatabaseTools = (server: McpServer, client: MetabaseClient) => {
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
};
