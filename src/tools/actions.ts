import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { listActions, getAction, createAction, updateAction, deleteAction, executeAction, createActionPublicLink, deleteActionPublicLink } from "../services/actions.js";

export const registerActionTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool("list_actions", "List all actions", {
    model_id: z.number().optional().describe("Filter by model ID"),
  }, async (params) => {
    const result = await listActions(client, params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_action", "Get action details", { action_id: z.number().describe("Action ID") }, async ({ action_id }) => {
    const result = await getAction(client, action_id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  if (!config.readOnly) {
    server.tool("create_action", "Create a new action (query or implicit only — HTTP actions are not supported)", {
      name: z.string().describe("Action name"),
      type: z.enum(["query", "implicit"]).describe("Action type (query or implicit)"),
      model_id: z.number().describe("Model card ID this action belongs to"),
      database_id: z.number().optional().describe("Database ID (required for query actions)"),
      dataset_query: z.record(z.string(), z.unknown()).optional().describe("Query definition for query-type actions"),
      description: z.string().optional().describe("Action description"),
    }, async (params) => {
      const result = await createAction(client, params as Record<string, unknown>);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("update_action", "Update an action (cannot change type to http)", {
      id: z.number().describe("Action ID"),
      name: z.string().optional().describe("New action name"),
      description: z.string().optional().describe("New description"),
      dataset_query: z.record(z.string(), z.unknown()).optional().describe("New query definition"),
      database_id: z.number().optional().describe("New database ID"),
    }, async ({ id, ...params }) => {
      const body: Record<string, unknown> = {};
      if (params.name !== undefined) body.name = params.name;
      if (params.description !== undefined) body.description = params.description;
      if (params.dataset_query !== undefined) body.dataset_query = params.dataset_query;
      if (params.database_id !== undefined) body.database_id = params.database_id;
      const result = await updateAction(client, id, body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("delete_action", "Delete an action", { action_id: z.number().describe("Action ID") }, async ({ action_id }) => {
      const result = await deleteAction(client, action_id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("execute_action", "Run an action with optional parameters", {
      id: z.number().describe("Action ID"),
      parameters: z.record(z.string(), z.unknown()).optional().describe("Action parameters as key-value pairs"),
    }, async ({ id, parameters }) => {
      const result = await executeAction(client, id, { parameters: parameters as Record<string, unknown> | undefined });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("create_action_public_link", "Generate a public link for an action form", {
      action_id: z.number().describe("Action ID"),
    }, async ({ action_id }) => {
      const result = await createActionPublicLink(client, action_id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("delete_action_public_link", "Remove the public link from an action", {
      action_id: z.number().describe("Action ID"),
    }, async ({ action_id }) => {
      const result = await deleteActionPublicLink(client, action_id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
  }
};
