import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  listNotifications,
  sendNotificationNow,
  listAlerts,
  getAlert,
  createAlert,
  updateAlert,
  deleteAlert,
  listDashboardSubscriptions,
  createDashboardSubscription,
  updateDashboardSubscription,
  deleteDashboardSubscription,
  type AlertChannel,
} from "../services/notifications.js";

const text = (result: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
});

const sendConditionSchema = z
  .enum(["has_result", "goal_above", "goal_below"])
  .describe("'has_result' = the question returns any rows; 'goal_above'/'goal_below' = the goal line is crossed");

const alertChannelsSchema = z
  .array(
    z.union([
      z.object({
        type: z.literal("email"),
        user_ids: z.array(z.number()).optional().describe("Metabase user IDs to email"),
        emails: z.array(z.string()).optional().describe("External email addresses"),
      }),
      z.object({
        type: z.literal("slack"),
        channel: z.string().describe("Slack channel, e.g. '#alerts'"),
      }),
    ])
  )
  .describe("Where to deliver the alert, e.g. [{ type: 'email', user_ids: [1] }] or [{ type: 'slack', channel: '#alerts' }]");

const cronSchema = z
  .string()
  .describe("Quartz cron schedule for checking the alert, e.g. '0 0 9 * * ? *' (daily 09:00, the default) or '0 0 * * * ? *' (hourly)");

export const registerNotificationTools = (
  server: McpServer,
  client: MetabaseClient,
  config: Config
) => {
  server.tool(
    "list_alerts",
    "List question alerts (card notifications). Optionally filter by card.",
    {
      card_id: z.number().optional().describe("Only alerts on this card"),
      include_inactive: z.boolean().optional().describe("Include deactivated (deleted) alerts"),
    },
    async (params) => text(await listAlerts(client, params))
  );

  server.tool(
    "get_alert",
    "Get details of a specific alert (notification ID)",
    { id: z.number().describe("Alert (notification) ID") },
    async ({ id }) => text(await getAlert(client, id))
  );

  server.tool(
    "list_dashboard_subscriptions",
    "List email/Slack subscriptions for a dashboard",
    { dashboard_id: z.number().describe("Dashboard ID") },
    async ({ dashboard_id }) => text(await listDashboardSubscriptions(client, dashboard_id))
  );

  server.tool(
    "list_notifications",
    "List notifications of any kind (question alerts, system-event notifications). Alerts are payload_type 'notification/card'. Use list_alerts for alerts only.",
    {
      payload_type: z.string().optional().describe("e.g. 'notification/card' (alerts) or 'notification/system-event'"),
      card_id: z.number().optional().describe("Only notifications on this card"),
      creator_id: z.number().optional().describe("Only notifications created by this user"),
      recipient_id: z.number().optional().describe("Only notifications this user receives"),
      include_inactive: z.boolean().optional().describe("Include deactivated notifications"),
    },
    async (params) => text(await listNotifications(client, params))
  );

  if (!config.readOnly) {
    server.tool(
      "send_notification",
      "Send a notification (e.g. an alert) right now, outside its schedule. Delivers real emails/Slack messages. Metabase 0.64+ allows this only for its creator or an admin.",
      {
        id: z.number().describe("Notification (alert) ID"),
        handler_ids: z.array(z.number()).optional().describe("Only send via these handler (channel) IDs; default all"),
      },
      async ({ id, handler_ids }) => text(await sendNotificationNow(client, id, { handler_ids }))
    );

    server.tool(
      "create_alert",
      "Create an alert on a saved question. Metabase checks the question on the cron schedule and notifies the channels when the condition is met.",
      {
        card_id: z.number().describe("Card ID to alert on"),
        send_condition: sendConditionSchema.optional().describe("Alert condition (default 'has_result')"),
        send_once: z.boolean().optional().describe("Stop after the first notification (default false)"),
        channels: alertChannelsSchema,
        cron_schedule: cronSchema.optional(),
      },
      async (params) => text(await createAlert(client, { ...params, channels: params.channels as AlertChannel[] }))
    );

    server.tool(
      "update_alert",
      "Update an existing alert. Only the fields you provide will be changed.",
      {
        id: z.number().describe("Alert (notification) ID"),
        send_condition: sendConditionSchema.optional(),
        send_once: z.boolean().optional().describe("Stop after the first notification"),
        channels: alertChannelsSchema.optional().describe("Replaces all delivery channels"),
        cron_schedule: cronSchema.optional(),
        active: z.boolean().optional().describe("Re-activate (true) or deactivate (false) the alert"),
      },
      async ({ id, ...rest }) =>
        text(await updateAlert(client, id, { ...rest, channels: rest.channels as AlertChannel[] | undefined }))
    );

    server.tool(
      "delete_alert",
      "Delete an alert (Metabase deactivates it; it can be restored with update_alert active=true)",
      { id: z.number().describe("Alert (notification) ID") },
      async ({ id }) => text(await deleteAlert(client, id))
    );

    server.tool(
      "create_dashboard_subscription",
      "Create an email or Slack subscription for a dashboard. Subscriptions deliver a snapshot of the dashboard on a schedule. By default includes every question on the dashboard.",
      {
        dashboard_id: z.number().describe("Dashboard ID"),
        name: z.string().optional().describe("Subscription name (default: dashboard name)"),
        channels: z
          .array(z.record(z.string(), z.unknown()))
          .describe(
            "Delivery channels. Email: [{ channel_type: 'email', enabled: true, recipients: [{ id: userId }, { email: 'a@b.c' }], schedule_type: 'weekly', schedule_day: 'mon', schedule_hour: 8 }]. Slack: [{ channel_type: 'slack', enabled: true, details: { channel: '#reports' }, schedule_type: 'daily', schedule_hour: 9 }]"
          ),
        parameters: z
          .array(z.record(z.string(), z.unknown()))
          .optional()
          .describe("Dashboard filter values to apply in the subscription"),
        cards: z
          .array(z.record(z.string(), z.unknown()))
          .optional()
          .describe("Cards to include: [{ id: cardId, dashboard_card_id, include_csv, include_xls }]. Default: all dashboard questions"),
      },
      async ({ dashboard_id, ...rest }) => text(await createDashboardSubscription(client, dashboard_id, rest))
    );

    server.tool(
      "update_dashboard_subscription",
      "Update a dashboard subscription (name, schedule, channels, parameters, cards)",
      {
        id: z.number().describe("Subscription ID"),
        name: z.string().optional().describe("Updated name"),
        channels: z.array(z.record(z.string(), z.unknown())).optional().describe("Updated delivery channels"),
        parameters: z.array(z.record(z.string(), z.unknown())).optional().describe("Updated dashboard filter values"),
        cards: z.array(z.record(z.string(), z.unknown())).optional().describe("Updated cards list"),
      },
      async ({ id, ...rest }) => {
        const body: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(rest)) if (v !== undefined) body[k] = v;
        return text(await updateDashboardSubscription(client, id, body));
      }
    );

    server.tool(
      "delete_dashboard_subscription",
      "Delete a dashboard subscription (Metabase archives it)",
      { id: z.number().describe("Subscription ID") },
      async ({ id }) => text(await deleteDashboardSubscription(client, id))
    );
  }
};
