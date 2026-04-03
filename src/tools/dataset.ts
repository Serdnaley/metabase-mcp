import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import { executeQuery } from "../services/dataset.js";

export const registerDatasetTools = (server: McpServer, client: MetabaseClient) => {
  server.tool("execute_query", "Run an ad-hoc query (native SQL or structured) and return results", {
    database: z.number().describe("Database ID to query"),
    type: z.enum(["native", "query"]).describe("Query type: native SQL or structured"),
    native: z.object({
      query: z.string().describe("SQL query string"),
      template_tags: z.record(z.string(), z.unknown()).optional().describe("Template tags for parameterized queries"),
    }).optional().describe('Required when type is "native"'),
    query: z.record(z.string(), z.unknown()).optional().describe('Required when type is "query". Structured query definition'),
  }, async (params) => {
    const result = await executeQuery(client, params as any);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });
};
