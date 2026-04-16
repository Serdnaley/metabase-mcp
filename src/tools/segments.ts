import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  listSegments,
  getSegment,
  createSegment,
  updateSegment,
  deleteSegment,
} from "../services/segments.js";

export const registerSegmentTools = (
  server: McpServer,
  client: MetabaseClient,
  config: Config
) => {
  server.tool(
    "list_segments",
    "List all segments",
    {
      table_id: z.number().optional().describe("Filter segments by table ID"),
    },
    async (params) => {
      const result = await listSegments(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_segment",
    "Get segment by ID",
    {
      id: z.number().describe("Segment ID"),
    },
    async ({ id }) => {
      const result = await getSegment(client, id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  if (!config.readOnly) {
    server.tool(
      "create_segment",
      "Create a new segment",
      {
        name: z.string().describe("Segment name"),
        table_id: z.number().describe("ID of the table this segment applies to"),
        definition: z
          .record(z.string(), z.unknown())
          .describe(
            'MBQL filter clause defining the segment, e.g. { "filter": [">", ["field", 4, null], 100] }'
          ),
        description: z.string().optional().describe("Optional segment description"),
      },
      async (params) => {
        const result = await createSegment(client, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "update_segment",
      "Update an existing segment",
      {
        id: z.number().describe("Segment ID"),
        revision_message: z
          .string()
          .describe("Required audit trail message describing the reason for this update"),
        name: z.string().optional().describe("New segment name"),
        definition: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Updated MBQL filter clause"),
        description: z.string().optional().describe("Updated description"),
        archived: z.boolean().optional().describe("Set to true to archive the segment"),
      },
      async ({ id, revision_message, ...params }) => {
        const result = await updateSegment(client, id, {
          revision_message,
          ...params,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "delete_segment",
      "Delete (archive) a segment",
      {
        id: z.number().describe("Segment ID"),
        revision_message: z
          .string()
          .describe("Required audit trail message describing the reason for deletion"),
      },
      async ({ id, revision_message }) => {
        const result = await deleteSegment(client, id, revision_message);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );
  }
};
