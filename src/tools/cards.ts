import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { listCards, getCard, createCard, updateCard, deleteCard, copyCard, executeCardQuery } from "../services/cards.js";

export const registerCardTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool("list_cards", "List all saved questions", {}, async () => {
    const result = await listCards(client);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_card", "Get card details (query definition, visualization settings)", { id: z.number().describe("Card ID") }, async ({ id }) => {
    const result = await getCard(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("execute_card_query", "Run a saved question and return results", {
    card_id: z.number().describe("Card ID"),
    parameters: z.record(z.string(), z.unknown()).optional().describe("Query parameters as key-value pairs"),
  }, async ({ card_id, parameters }) => {
    const result = await executeCardQuery(client, card_id, { parameters });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  if (!config.readOnly) {
    server.tool("create_card", "Create a new question (native SQL or structured query)", {
      name: z.string().describe("Question name"),
      dataset_query: z.record(z.string(), z.unknown()).describe('Query definition. For native SQL: { type: "native", native: { query: "SELECT ..." }, database: 1 }. For structured: { type: "query", query: { "source-table": 1 }, database: 1 }'),
      display: z.string().describe('Visualization type: "table", "bar", "line", "pie", "scalar", "row", "area", "combo", "pivot", "smartscalar", "gauge", "progress", "funnel", "map", "scatter", "waterfall"'),
      description: z.string().optional().describe("Question description"),
      collection_id: z.number().optional().describe("Collection to save in"),
      visualization_settings: z.record(z.string(), z.unknown()).optional().describe("Visualization settings"),
    }, async (params) => {
      const result = await createCard(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("update_card", "Update question query, display, name, or other properties", {
      id: z.number().describe("Card ID"),
      name: z.string().optional().describe("New name"),
      dataset_query: z.record(z.string(), z.unknown()).optional().describe("New query definition"),
      display: z.string().optional().describe("New visualization type"),
      description: z.string().optional().describe("New description"),
      collection_id: z.number().optional().describe("Move to collection"),
      visualization_settings: z.record(z.string(), z.unknown()).optional().describe("New visualization settings"),
      archived: z.boolean().optional().describe("Archive the card"),
    }, async ({ id, ...params }) => {
      const result = await updateCard(client, id, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("delete_card", "Delete a card (question)", { id: z.number().describe("Card ID") }, async ({ id }) => {
      const result = await deleteCard(client, id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("copy_card", "Copy a card to a collection", {
      id: z.number().describe("Card ID to copy"),
      collection_id: z.number().optional().describe("Target collection ID"),
    }, async ({ id, collection_id }) => {
      const result = await copyCard(client, id, { collection_id });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
  }
};
