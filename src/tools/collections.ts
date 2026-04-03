import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { listCollections, getCollection, listCollectionItems, createCollection, updateCollection } from "../services/collections.js";

export const registerCollectionTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool("list_collections", "List all collections", {}, async () => {
    const result = await listCollections(client);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_collection", "Get collection details", { id: z.number().describe("Collection ID") }, async ({ id }) => {
    const result = await getCollection(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("list_collection_items", "List items in a collection (cards, dashboards, sub-collections)", {
    id: z.number().describe("Collection ID"),
    models: z.array(z.enum(["card", "dashboard", "collection", "snippet", "pulse", "timeline"])).optional().describe("Filter by item types"),
    sort_column: z.enum(["name", "last_edited_at", "last_edited_by", "model"]).optional().describe("Column to sort by"),
    sort_direction: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
  }, async ({ id, ...params }) => {
    const result = await listCollectionItems(client, id, params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  if (!config.readOnly) {
    server.tool("create_collection", "Create a new collection", {
      name: z.string().describe("Collection name"),
      description: z.string().optional().describe("Collection description"),
      parent_id: z.number().optional().describe("Parent collection ID"),
    }, async (params) => {
      const result = await createCollection(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("update_collection", "Update collection properties", {
      id: z.number().describe("Collection ID"),
      name: z.string().optional().describe("New name"),
      description: z.string().optional().describe("New description"),
      parent_id: z.number().optional().describe("New parent collection ID"),
      archived: z.boolean().optional().describe("Archive the collection"),
    }, async ({ id, ...params }) => {
      const result = await updateCollection(client, id, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
  }
};
