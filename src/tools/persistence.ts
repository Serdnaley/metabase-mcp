import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { persistModel, unpersistModel, refreshPersistedModel } from "../services/persistence.js";

export const registerPersistenceTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  if (!config.readOnly) {
    server.tool(
      "persist_model",
      "Enable persistence (materialization) for a model card",
      {
        card_id: z.number().describe("Model card ID to enable persistence for"),
      },
      async ({ card_id }) => {
        const result = await persistModel(client, card_id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "unpersist_model",
      "Disable persistence (materialization) for a model card",
      {
        card_id: z.number().describe("Model card ID to disable persistence for"),
      },
      async ({ card_id }) => {
        const result = await unpersistModel(client, card_id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "refresh_persisted_model",
      "Manually trigger a refresh of the materialized data for a persisted model",
      {
        card_id: z.number().describe("Model card ID to refresh persisted data for"),
      },
      async ({ card_id }) => {
        const result = await refreshPersistedModel(client, card_id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );
  }
};
