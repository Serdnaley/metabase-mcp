import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import { generateXray } from "../services/xrays.js";

export const registerXrayTools = (server: McpServer, client: MetabaseClient) => {
  server.tool(
    "generate_xray",
    "Generate an automatic X-ray exploratory dashboard for a table",
    {
      table_id: z.number().describe("Table ID to generate X-ray for"),
    },
    async ({ table_id }) => {
      const result = await generateXray(client, table_id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
};
