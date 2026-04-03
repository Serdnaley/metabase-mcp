import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import { getTable, getTableQueryMetadata, getField, getFieldValues } from "../services/tables.js";

export const registerTableTools = (server: McpServer, client: MetabaseClient) => {
  server.tool("get_table", "Get table details and field info", { id: z.number().describe("Table ID") }, async ({ id }) => {
    const result = await getTable(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_table_query_metadata", "Get full query metadata for a table (fields, FKs, metrics)", { id: z.number().describe("Table ID") }, async ({ id }) => {
    const result = await getTableQueryMetadata(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_field", "Get field details including type, special type, fingerprint", { id: z.number().describe("Field ID") }, async ({ id }) => {
    const result = await getField(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_field_values", "Get sample values for a field", { id: z.number().describe("Field ID") }, async ({ id }) => {
    const result = await getFieldValues(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });
};
