import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { listRevisions, revertRevision } from "../services/revisions.js";

export const registerRevisionTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool(
    "list_revisions",
    "List revision history for a card or dashboard",
    {
      entity: z.enum(["card", "dashboard"]).describe("Entity type"),
      id: z.number().describe("Card or dashboard ID"),
    },
    async (params) => {
      const result = await listRevisions(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  if (!config.readOnly) {
    server.tool(
      "revert_revision",
      "Revert a card or dashboard to a prior revision",
      {
        entity: z.enum(["card", "dashboard"]).describe("Entity type"),
        id: z.number().describe("Card or dashboard ID"),
        revision_id: z.number().describe("Revision ID to revert to"),
      },
      async (params) => {
        const result = await revertRevision(client, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );
  }
};
