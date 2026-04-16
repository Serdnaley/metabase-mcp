import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { listSnippets, getSnippet, createSnippet, updateSnippet, deleteSnippet } from "../services/snippets.js";

export const registerSnippetTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool("list_snippets", "List all SQL snippets", {}, async () => {
    const result = await listSnippets(client);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_snippet", "Get a SQL snippet by ID", {
    id: z.number().describe("Snippet ID"),
  }, async ({ id }) => {
    const result = await getSnippet(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  if (!config.readOnly) {
    server.tool("create_snippet", "Create a reusable SQL snippet", {
      name: z.string().describe("Snippet name"),
      content: z.string().describe("SQL content"),
      description: z.string().optional().describe("Description"),
      collection_id: z.number().optional().describe("Snippet collection ID"),
    }, async (params) => {
      const result = await createSnippet(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("update_snippet", "Update a SQL snippet", {
      id: z.number().describe("Snippet ID"),
      name: z.string().optional().describe("New name"),
      content: z.string().optional().describe("New SQL content"),
      description: z.string().optional().describe("New description"),
      archived: z.boolean().optional().describe("Archive the snippet"),
    }, async ({ id, ...params }) => {
      const result = await updateSnippet(client, id, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("delete_snippet", "Archive (soft-delete) a SQL snippet", {
      id: z.number().describe("Snippet ID"),
    }, async ({ id }) => {
      const result = await deleteSnippet(client, id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
  }
};
