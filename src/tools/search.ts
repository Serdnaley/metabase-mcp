import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import { search as searchService } from "../services/search.js";

export const registerSearchTools = (server: McpServer, client: MetabaseClient) => {
  server.tool(
    "search",
    "Search across all Metabase entities (cards, dashboards, collections, tables, etc.)",
    { q: z.string().describe("Search query string"), models: z.array(z.enum(["card","dashboard","collection","table","database","action","segment","metric"])).optional().describe("Filter by entity types"), collection: z.string().optional().describe("Filter by collection ID"), archived: z.boolean().optional().describe("Include archived items (default: false)") },
    async (params) => {
      const result = await searchService(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
};
