import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import { translateEntityIds } from "../services/eid-translation.js";

export const registerEidTranslationTools = (server: McpServer, client: MetabaseClient) => {
  server.tool("translate_entity_ids", "Translate serialization entity IDs to API integer IDs", {
    entity_ids: z.record(z.string(), z.array(z.string())).describe('Map of entity type to array of entity IDs. Example: { "card": ["abc123", "def456"], "dashboard": ["ghi789"] }'),
  }, async ({ entity_ids }) => {
    const result = await translateEntityIds(client, { entity_ids });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });
};
