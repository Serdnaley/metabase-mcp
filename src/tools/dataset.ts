import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { resultLimits } from "../config.js";
import { executeQuery } from "../services/dataset.js";
import { resultShapeInputs, shapeQueryResult } from "../results.js";

export const registerDatasetTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool("execute_query", "Run an ad-hoc query (native SQL or structured) and return results as compact columns + rows (paged with max_rows/offset). WARNING: the SQL is sent as-is; this server does not block INSERT/UPDATE/DELETE/DDL. Whether it can change data depends only on the Metabase API key's permissions and the database user's grants.", {
    database: z.number().describe("Database ID to query"),
    type: z.enum(["native", "query"]).describe("Query type: native SQL or structured"),
    native: z.object({
      query: z.string().describe("SQL query string"),
      template_tags: z.record(z.string(), z.unknown()).optional().describe("Template tags for parameterized queries"),
    }).optional().describe('Required when type is "native"'),
    query: z.record(z.string(), z.unknown()).optional().describe('Required when type is "query". Structured query definition'),
    ...resultShapeInputs,
  }, async ({ max_rows, offset, verbose, ...params }) => {
    const result = await executeQuery(client, params as any);
    const shaped = shapeQueryResult(result, resultLimits(config), { max_rows, offset, verbose });
    return { content: [{ type: "text", text: JSON.stringify(shaped) }] };
  });
};
