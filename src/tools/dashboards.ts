import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { listDashboards, getDashboard, createDashboard, updateDashboard, deleteDashboard, copyDashboard, updateDashboardCards } from "../services/dashboards.js";

export const registerDashboardTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool("list_dashboards", "List all dashboards", {}, async () => {
    const result = await listDashboards(client);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_dashboard", "Get dashboard with all cards and layout", { id: z.number().describe("Dashboard ID") }, async ({ id }) => {
    const result = await getDashboard(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  if (!config.readOnly) {
    server.tool("create_dashboard", "Create a new dashboard", {
      name: z.string().describe("Dashboard name"),
      description: z.string().optional().describe("Dashboard description"),
      collection_id: z.number().optional().describe("Collection to save in"),
      parameters: z.array(z.record(z.string(), z.unknown())).optional().describe("Dashboard filter parameters"),
    }, async (params) => {
      const result = await createDashboard(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("update_dashboard", "Update dashboard properties (name, description, filters)", {
      id: z.number().describe("Dashboard ID"),
      name: z.string().optional().describe("New name"),
      description: z.string().optional().describe("New description"),
      collection_id: z.number().optional().describe("Move to collection"),
      archived: z.boolean().optional().describe("Archive the dashboard"),
      parameters: z.array(z.record(z.string(), z.unknown())).optional().describe("Updated filter parameters"),
    }, async ({ id, ...params }) => {
      const result = await updateDashboard(client, id, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("delete_dashboard", "Delete a dashboard", { id: z.number().describe("Dashboard ID") }, async ({ id }) => {
      const result = await deleteDashboard(client, id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("copy_dashboard", "Copy a dashboard to a collection", {
      from_dashboard_id: z.number().describe("Dashboard ID to copy"),
      name: z.string().optional().describe("Name for the copy"),
      description: z.string().optional().describe("Description for the copy"),
      collection_id: z.number().optional().describe("Target collection ID"),
      is_deep_copy: z.boolean().optional().describe("Deep copy cards too (default: false)"),
    }, async ({ from_dashboard_id, ...params }) => {
      const result = await copyDashboard(client, from_dashboard_id, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("update_dashboard_cards", "Add, remove, or reposition cards on a dashboard", {
      id: z.number().describe("Dashboard ID"),
      cards: z.array(z.object({
        id: z.number().optional().describe("Existing dashcard ID (for updates)"),
        card_id: z.number().optional().describe("Card (question) ID to add"),
        row: z.number().describe("Row position (0-based)"),
        col: z.number().describe("Column position (0-based)"),
        size_x: z.number().describe("Width in grid units"),
        size_y: z.number().describe("Height in grid units"),
        parameter_mappings: z.array(z.record(z.string(), z.unknown())).optional().describe("Parameter mappings for filters"),
        visualization_settings: z.record(z.string(), z.unknown()).optional().describe("Per-card visualization overrides"),
        series: z.array(z.record(z.string(), z.unknown())).optional().describe("Additional series for multi-series cards"),
      })).describe("Array of card positions and settings"),
    }, async ({ id, cards }) => {
      const result = await updateDashboardCards(client, id, cards);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
  }
};
