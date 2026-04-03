import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { listActions, getAction, createAction, updateAction, deleteAction, executeAction } from "../services/actions.js";

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
    server.tool("create_action", "Create a new action (HTTP, query, or implicit)", {
      action: z.record(z.string(), z.unknown()).describe('Action definition. Must include "type" (http, query, or implicit), "name", "model_id", and type-specific fields'),
    }, async ({ action }) => {
      const result = await createAction(client, action as Record<string, unknown>);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("update_action", "Update an action", {
      id: z.number().describe("Action ID"),
      action: z.record(z.string(), z.unknown()).describe("Fields to update"),
    }, async ({ id, action }) => {
      const result = await updateAction(client, id, action as Record<string, unknown>);
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
  }
};
