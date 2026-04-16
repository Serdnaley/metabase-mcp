import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  listTimelines,
  getTimeline,
  createTimeline,
  updateTimeline,
  deleteTimeline,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
} from "../services/timelines.js";

export const registerTimelineTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool("list_timelines", "List all timelines", {
    collection_id: z.number().optional().describe("Filter timelines by collection ID"),
  }, async ({ collection_id }) => {
    const result = await listTimelines(client, { collection_id });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_timeline", "Get a timeline by ID", {
    id: z.number().describe("Timeline ID"),
  }, async ({ id }) => {
    const result = await getTimeline(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  if (!config.readOnly) {
    server.tool("create_timeline", "Create a timeline for annotating charts", {
      name: z.string().describe("Timeline name"),
      collection_id: z.number().optional().describe("Collection ID to place the timeline in"),
      icon: z.string().optional().describe("Icon name (default: star)"),
      default: z.boolean().optional().describe("Whether this is the default timeline"),
    }, async (params) => {
      const result = await createTimeline(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("update_timeline", "Update a timeline", {
      id: z.number().describe("Timeline ID"),
      name: z.string().optional().describe("Updated timeline name"),
      icon: z.string().optional().describe("Updated icon name"),
      default: z.boolean().optional().describe("Whether this is the default timeline"),
      archived: z.boolean().optional().describe("Archive the timeline"),
    }, async ({ id, ...params }) => {
      const result = await updateTimeline(client, id, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("delete_timeline", "Delete a timeline", {
      id: z.number().describe("Timeline ID"),
    }, async ({ id }) => {
      const result = await deleteTimeline(client, id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("create_timeline_event", "Create an event on a timeline", {
      timeline_id: z.number().describe("ID of the timeline to add the event to"),
      name: z.string().describe("Event name"),
      timestamp: z.string().describe("Event timestamp (ISO 8601 format)"),
      description: z.string().optional().describe("Event description"),
      icon: z.string().optional().describe("Icon name (default: star)"),
      timezone: z.string().optional().describe("Timezone for the event (default: UTC)"),
    }, async (params) => {
      const result = await createTimelineEvent(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("update_timeline_event", "Update a timeline event", {
      id: z.number().describe("Timeline event ID"),
      name: z.string().optional().describe("Updated event name"),
      timestamp: z.string().optional().describe("Updated event timestamp (ISO 8601 format)"),
      description: z.string().optional().describe("Updated event description"),
      icon: z.string().optional().describe("Updated icon name"),
      archived: z.boolean().optional().describe("Archive the event"),
    }, async ({ id, ...params }) => {
      const result = await updateTimelineEvent(client, id, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("delete_timeline_event", "Delete a timeline event", {
      id: z.number().describe("Timeline event ID"),
    }, async ({ id }) => {
      const result = await deleteTimelineEvent(client, id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
  }
};
