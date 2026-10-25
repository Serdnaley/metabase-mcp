import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import { getActivity, getRecentItems, getPopularItems, listTasks, getTask } from "../services/activity.js";

export const registerActivityTools = (server: McpServer, client: MetabaseClient) => {
  server.tool("get_activity", "Get recent activity: the current user's recently viewed items plus the instance's popular items (prefer get_recent_items / get_popular_items)", {}, async () => {
    const result = await getActivity(client);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_recent_items", "Get the current user's recently viewed and/or selected items (dashboards, questions, tables, collections, documents)", {
    context: z.array(z.enum(["views", "selections"])).optional().describe("Which recents to return (default ['views'])"),
  }, async ({ context }) => {
    const result = await getRecentItems(client, context);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_popular_items", "Get the most popular dashboards, questions and tables across the instance", {}, async () => {
    const result = await getPopularItems(client);
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
