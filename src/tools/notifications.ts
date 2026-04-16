import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  listAlerts,
  getAlert,
  createAlert,
  updateAlert,
  deleteAlert,
  listDashboardSubscriptions,
  createDashboardSubscription,
  updateDashboardSubscription,
  deleteDashboardSubscription,
} from "../services/notifications.js";

export const registerNotificationTools = (
  server: McpServer,
  client: MetabaseClient,
  config: Config
) => {
  server.tool("list_alerts", "List all alerts configured in Metabase", {}, async () => {
    const result = await listAlerts(client);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool(
    "get_alert",
    "Get details of a specific alert",
    { id: z.number().describe("Alert ID") },
    async ({ id }) => {
      const result = await getAlert(client, id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "list_dashboard_subscriptions",
    "List email/Slack subscriptions for a dashboard",
    { dashboard_id: z.number().describe("Dashboard ID") },
    async ({ dashboard_id }) => {
      const result = await listDashboardSubscriptions(client, dashboard_id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  if (!config.readOnly) {
    server.tool(
      "create_alert",
      "Create an alert on a saved question. Alerts notify recipients via email or Slack when query results meet a condition.",
      {
        card_id: z.number().describe("Card ID to alert on"),
        alert_condition: z
          .enum(["rows", "goal"])
          .describe(
            "'rows' = alert when the question returns any results, 'goal' = alert when the goal line is met or exceeded"
          ),
        alert_first_only: z
          .boolean()
          .optional()
          .describe("Only send the alert on the first occurrence (default: false)"),
        alert_above_goal: z
          .boolean()
          .optional()
          .describe(
            "For goal alerts — true to alert when above goal, false to alert when below goal"
          ),
        channels: z
          .array(z.record(z.string(), z.unknown()))
          .describe(
            "Notification channels. Example for email: [{ channel_type: 'email', recipients: [{ id: userId }], schedule_type: 'daily', schedule_hour: 9, enabled: true }]. Example for Slack: [{ channel_type: 'slack', details: { channel: '#alerts' }, schedule_type: 'daily', schedule_hour: 9, enabled: true }]"
          ),
      },
      async (params) => {
        const result = await createAlert(client, {
          card: { id: params.card_id },
          alert_condition: params.alert_condition,
          alert_first_only: params.alert_first_only,
          alert_above_goal: params.alert_above_goal,
          channels: params.channels,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "update_alert",
      "Update an existing alert. Only the fields you provide will be changed.",
      {
        id: z.number().describe("Alert ID"),
        alert_condition: z
          .enum(["rows", "goal"])
          .optional()
          .describe("Alert condition: 'rows' or 'goal'"),
        alert_first_only: z
          .boolean()
          .optional()
          .describe("Only alert on first occurrence"),
        alert_above_goal: z
          .boolean()
          .optional()
          .describe("Alert when above goal (true) or below (false)"),
        channels: z
          .array(z.record(z.string(), z.unknown()))
          .optional()
          .describe("Updated notification channels array"),
      },
      async ({ id, ...rest }) => {
        const body: Record<string, unknown> = {};
        if (rest.alert_condition !== undefined) body.alert_condition = rest.alert_condition;
        if (rest.alert_first_only !== undefined) body.alert_first_only = rest.alert_first_only;
        if (rest.alert_above_goal !== undefined) body.alert_above_goal = rest.alert_above_goal;
        if (rest.channels !== undefined) body.channels = rest.channels;
        const result = await updateAlert(client, id, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "delete_alert",
      "Delete an alert",
      { id: z.number().describe("Alert ID") },
      async ({ id }) => {
        const result = await deleteAlert(client, id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "create_dashboard_subscription",
      "Create an email or Slack subscription for a dashboard. Subscriptions deliver a snapshot of the dashboard on a schedule.",
      {
        dashboard_id: z.number().describe("Dashboard ID"),
        channels: z
          .array(z.record(z.string(), z.unknown()))
          .describe(
            "Notification channels. Example for email: [{ channel_type: 'email', recipients: [{ id: userId }], schedule_type: 'weekly', schedule_day: 'mon', schedule_hour: 8, enabled: true }]. Example for Slack: [{ channel_type: 'slack', details: { channel: '#reports' }, schedule_type: 'daily', schedule_hour: 9, enabled: true }]"
          ),
        parameters: z
          .array(z.record(z.string(), z.unknown()))
          .optional()
          .describe("Dashboard filter parameter values to use in the subscription"),
      },
      async ({ dashboard_id, channels, parameters }) => {
        const result = await createDashboardSubscription(client, dashboard_id, {
          channels,
          parameters,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "update_dashboard_subscription",
      "Update a dashboard subscription (schedule, channels, parameters)",
      {
        id: z.number().describe("Subscription ID"),
        channels: z.array(z.record(z.string(), z.unknown())).optional().describe("Updated notification channels"),
        parameters: z.array(z.record(z.string(), z.unknown())).optional().describe("Updated dashboard filter parameters"),
      },
      async ({ id, ...rest }) => {
        const body: Record<string, unknown> = {};
        if (rest.channels !== undefined) body.channels = rest.channels;
        if (rest.parameters !== undefined) body.parameters = rest.parameters;
        const result = await updateDashboardSubscription(client, id, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "delete_dashboard_subscription",
      "Delete a dashboard subscription",
      {
        id: z.number().describe("Subscription ID"),
      },
      async ({ id }) => {
        const result = await deleteDashboardSubscription(client, id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );
  }
};
