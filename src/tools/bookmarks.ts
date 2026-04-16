import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { listBookmarks, createBookmark, deleteBookmark } from "../services/bookmarks.js";

export const registerBookmarkTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool("list_bookmarks", "List all bookmarks for the current user", {}, async () => {
    const result = await listBookmarks(client);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  if (!config.readOnly) {
    server.tool("create_bookmark", "Bookmark a card, dashboard, or collection", {
      type: z.enum(["card", "dashboard", "collection"]).describe("Type of item to bookmark"),
      item_id: z.number().describe("ID of the item to bookmark"),
    }, async (params) => {
      const result = await createBookmark(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("delete_bookmark", "Remove a bookmark from a card, dashboard, or collection", {
      type: z.enum(["card", "dashboard", "collection"]).describe("Type of bookmarked item"),
      item_id: z.number().describe("ID of the bookmarked item"),
    }, async (params) => {
      const result = await deleteBookmark(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
  }
};
