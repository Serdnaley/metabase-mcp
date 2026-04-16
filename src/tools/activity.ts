import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import { getActivity, listTasks, getTask } from "../services/activity.js";

export const registerActivityTools = (server: McpServer, client: MetabaseClient) => {
  server.tool("get_activity", "Get recent activity feed (user actions, views, etc.)", {}, async () => {
    const result = await getActivity(client);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("list_tasks", "List all scheduled background tasks and their status", {}, async () => {
    const result = await listTasks(client);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_task", "Get details of a specific background task", {
    id: z.number().describe("Task ID"),
  }, async ({ id }) => {
    const result = await getTask(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });
};
