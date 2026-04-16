import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  getPermissionsGraph,
  updatePermissionsGraph,
  getCollectionPermissions,
  updateCollectionPermissions,
} from "../services/permissions.js";

export const registerPermissionTools = (
  server: McpServer,
  client: MetabaseClient,
  config: Config
) => {
  server.tool(
    "get_permissions_graph",
    "Get the full data permissions graph (view-data and create-queries permissions per group per database)",
    {},
    async () => {
      const result = await getPermissionsGraph(client);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_collection_permissions",
    "Get the collection permissions graph (which groups can access which collections)",
    {},
    async () => {
      const result = await getCollectionPermissions(client);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  if (!config.readOnly) {
    server.tool(
      "update_permissions_graph",
      "Update the data permissions graph. Must include the 'revision' field from get_permissions_graph for optimistic locking.",
      {
        graph: z
          .record(z.string(), z.unknown())
          .describe(
            "Full permissions graph object with 'revision' and 'groups' keys"
          ),
      },
      async ({ graph }) => {
        const result = await updatePermissionsGraph(client, graph);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "update_collection_permissions",
      "Update the collection permissions graph. Must include the 'revision' field from get_collection_permissions for optimistic locking.",
      {
        graph: z
          .record(z.string(), z.unknown())
          .describe(
            "Full collection permissions graph object with 'revision' and 'groups' keys"
          ),
      },
      async ({ graph }) => {
        const result = await updateCollectionPermissions(client, graph);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );
  }
};
