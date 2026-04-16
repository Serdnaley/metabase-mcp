import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { createModerationReview } from "../services/moderation.js";

export const registerModerationTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  if (!config.readOnly) {
    server.tool("create_moderation_review", "Mark a card or dashboard as verified or remove verification (Pro/Enterprise)", {
      moderated_item_id: z.number().describe("Card or dashboard ID"),
      moderated_item_type: z.enum(["card", "dashboard"]).describe("Item type"),
      status: z.enum(["verified"]).nullable().describe("Set to 'verified' to verify, or null to remove verification"),
    }, async (params) => {
      const result = await createModerationReview(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
  }
};
