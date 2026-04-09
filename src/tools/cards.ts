import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { listCards, getCard, createCard, updateCard, deleteCard, copyCard, executeCardQuery, createCardPublicLink, deleteCardPublicLink } from "../services/cards.js";

export const registerCardTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool("list_cards", "List all saved questions", {}, async () => {
    const result = await listCards(client);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_card", "Get card details (query definition, visualization settings)", { id: z.number().describe("Card ID") }, async ({ id }) => {
    const result = await getCard(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("execute_card_query", "Run a saved question and return results. For parameterized cards, pass template tag values as key-value pairs. For date/range parameters, pass value as 'start~end' (e.g. '2024-01-01~2024-12-31')", {
    card_id: z.number().describe("Card ID"),
    parameter_values: z.record(z.string(), z.unknown()).optional().describe("Template tag parameter values as { paramName: value } pairs. For date: '2024-01-01'. For date/range: '2024-01-01~2024-12-31'. For number: 100. For text: 'value'."),
  }, async ({ card_id, parameter_values }) => {
    const result = await executeCardQuery(client, card_id, { parameter_values });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  if (!config.readOnly) {
    server.tool("create_card", "Create a new question (native SQL or structured query)", {
      name: z.string().describe("Question name"),
      dataset_query: z.record(z.string(), z.unknown()).describe('Query definition. For native SQL: { type: "native", native: { query: "SELECT ..." }, database: 1 }. For structured: { type: "query", query: { "source-table": 1 }, database: 1 }'),
      display: z.string().describe('Visualization type: "table", "bar", "line", "pie", "scalar", "row", "area", "combo", "pivot", "smartscalar", "gauge", "progress", "funnel", "map", "scatter", "waterfall". Important: set visualization_settings alongside this to configure chart dimensions/metrics.'),
      description: z.string().optional().describe("Question description"),
      collection_id: z.number().optional().describe("Collection to save in"),
      visualization_settings: z.record(z.string(), z.unknown()).optional().describe("Visualization settings — must be configured for charts to render correctly. For pie: { \"pie.dimension\": \"COLUMN\", \"pie.metric\": \"COLUMN\" }. For bar/line/area: { \"graph.dimensions\": [\"COLUMN\"], \"graph.metrics\": [\"COLUMN\"] }. For scatter: { \"graph.dimensions\": [\"X_COL\"], \"graph.metrics\": [\"Y_COL\"] }. For funnel: { \"funnel.dimension\": \"COLUMN\", \"funnel.metric\": \"COLUMN\" }. For table: { \"table.pivot_column\": \"COL\", \"table.cell_column\": \"COL\" }. Column names must match SQL aliases or structured query field names."),
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
      visualization_settings: z.record(z.string(), z.unknown()).optional().describe("Visualization settings — must be configured for charts to render correctly. For pie: { \"pie.dimension\": \"COLUMN\", \"pie.metric\": \"COLUMN\" }. For bar/line/area: { \"graph.dimensions\": [\"COLUMN\"], \"graph.metrics\": [\"COLUMN\"] }. For scatter: { \"graph.dimensions\": [\"X_COL\"], \"graph.metrics\": [\"Y_COL\"] }. For funnel: { \"funnel.dimension\": \"COLUMN\", \"funnel.metric\": \"COLUMN\" }. Column names must match SQL aliases or structured query field names."),
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

    server.tool("create_card_public_link", "Generate a public sharing link for a card. Returns the card with a public_uuid field. The public URL is {metabase_url}/public/question/{uuid}. Public sharing must be enabled in Metabase admin settings.", {
      card_id: z.number().describe("Card ID"),
    }, async ({ card_id }) => {
      const result = await createCardPublicLink(client, card_id);
      const uuid = (result as any)?.uuid ?? (result as any)?.public_uuid;
      const publicUrl = uuid ? `${config.metabaseUrl}/public/question/${uuid}` : undefined;
      return { content: [{ type: "text", text: JSON.stringify({ ...result as any, public_url: publicUrl }, null, 2) }] };
    });

    server.tool("delete_card_public_link", "Remove the public sharing link from a card", {
      card_id: z.number().describe("Card ID"),
    }, async ({ card_id }) => {
      const result = await deleteCardPublicLink(client, card_id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
  }
};
