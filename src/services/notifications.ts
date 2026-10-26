import type { MetabaseClient } from "../client.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyClient = (client: MetabaseClient): any => client;

// ── Alerts ────────────────────────────────────────────────────────────────
// Since Metabase 0.54 alerts are card notifications under /api/notification.
// The old /api/alert write routes no longer exist (only GET remains for compat).

export type AlertSendCondition = "has_result" | "goal_above" | "goal_below";

export type AlertChannel =
  | { type: "email"; user_ids?: number[]; emails?: string[] }
  | { type: "slack"; channel: string };

const DEFAULT_ALERT_CRON = "0 0 9 * * ? *"; // daily at 09:00 (Quartz)

const buildHandlers = (channels: AlertChannel[]) =>
  channels.map((ch) => {
    if (ch.type === "slack") {
      return {
        channel_type: "channel/slack",
        recipients: [{ type: "notification-recipient/raw-value", details: { value: ch.channel } }],
      };
    }
    return {
      channel_type: "channel/email",
      recipients: [
        ...(ch.user_ids ?? []).map((user_id) => ({ type: "notification-recipient/user", user_id })),
        ...(ch.emails ?? []).map((value) => ({ type: "notification-recipient/raw-value", details: { value } })),
      ],
    };
  });

const buildSubscriptions = (cronSchedule: string) => [
  { type: "notification-subscription/cron", cron_schedule: cronSchedule },
];

export const listAlerts = async (
  client: MetabaseClient,
  params?: { card_id?: number; include_inactive?: boolean }
) => {
  const query: Record<string, unknown> = { payload_type: "notification/card" };
  if (params?.card_id !== undefined) query.card_id = params.card_id;
  if (params?.include_inactive !== undefined) query.include_inactive = params.include_inactive;
  const { data, error } = await client.GET("/api/notification", { params: { query } });
  if (error) throw new Error(`List alerts failed: ${JSON.stringify(error)}`);
  return data;
};

export const getAlert = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/notification/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Get alert failed: ${JSON.stringify(error)}`);
  return data;
};

export const createAlert = async (
  client: MetabaseClient,
  params: {
    card_id: number;
    send_condition?: AlertSendCondition;
    send_once?: boolean;
    channels: AlertChannel[];
    cron_schedule?: string;
  }
) => {
  const { data, error } = await anyClient(client).POST("/api/notification", {
    body: {
      payload_type: "notification/card",
      payload: {
        card_id: params.card_id,
        send_condition: params.send_condition ?? "has_result",
        send_once: params.send_once ?? false,
      },
      handlers: buildHandlers(params.channels),
      subscriptions: buildSubscriptions(params.cron_schedule ?? DEFAULT_ALERT_CRON),
    },
  });
  if (error) throw new Error(`Create alert failed: ${JSON.stringify(error)}`);
  return data;
};

/**
 * PUT /api/notification/{id} takes the whole notification, so fetch it,
 * merge the requested changes and send it back.
 */
export const updateAlert = async (
  client: MetabaseClient,
  id: number,
  params: {
    send_condition?: AlertSendCondition;
    send_once?: boolean;
    channels?: AlertChannel[];
    cron_schedule?: string;
    active?: boolean;
  }
) => {
  const current = (await getAlert(client, id)) as any;
  if (current?.payload_type !== "notification/card") {
    throw new Error(`Update alert failed: notification ${id} is not a card alert (${current?.payload_type})`);
  }
  const body = { ...current, payload: { ...current.payload } };
  if (params.send_condition !== undefined) body.payload.send_condition = params.send_condition;
  if (params.send_once !== undefined) body.payload.send_once = params.send_once;
  if (params.channels !== undefined) body.handlers = buildHandlers(params.channels);
  if (params.cron_schedule !== undefined) body.subscriptions = buildSubscriptions(params.cron_schedule);
  if (params.active !== undefined) body.active = params.active;

  const { data, error } = await client.PUT("/api/notification/{id}", {
    params: { path: { id } },
    body,
  });
  if (error) throw new Error(`Update alert failed: ${JSON.stringify(error)}`);
  return data;
};

/** Metabase has no hard delete for notifications — deactivating is what the UI does. */
export const deleteAlert = async (client: MetabaseClient, id: number) => {
  await updateAlert(client, id, { active: false });
  return { success: true };
};

// ── Dashboard subscriptions ─────────────────────────────────────────────────
// Still pulses: GET/POST /api/pulse, PUT /api/pulse/{id}; no DELETE (archive instead).

export const listDashboardSubscriptions = async (client: MetabaseClient, dashboardId: number) => {
  const { data, error } = await client.GET("/api/pulse", {
    params: { query: { dashboard_id: dashboardId } },
  });
  if (error) throw new Error(`List dashboard subscriptions failed: ${JSON.stringify(error)}`);
  return data;
};

export const createDashboardSubscription = async (
  client: MetabaseClient,
  dashboardId: number,
  params: {
    name?: string;
    channels: Record<string, unknown>[];
    parameters?: Record<string, unknown>[];
    cards?: Record<string, unknown>[];
  }
) => {
  let cards = params.cards;
  let name = params.name;
  if (!cards || !name) {
    const { data: dashboard, error } = await client.GET("/api/dashboard/{id}", {
      params: { path: { id: dashboardId } },
    });
    if (error) throw new Error(`Create dashboard subscription failed: ${JSON.stringify(error)}`);
    name ??= (dashboard as any)?.name ?? `Dashboard ${dashboardId}`;
    // Default: every question card on the dashboard, no attachments
    cards ??= ((dashboard as any)?.dashcards ?? [])
      .filter((dc: any) => dc.card_id)
      .map((dc: any) => ({ id: dc.card_id, include_csv: false, include_xls: false, dashboard_card_id: dc.id }));
  }
  const { data, error } = await anyClient(client).POST("/api/pulse", {
    body: {
      name,
      dashboard_id: dashboardId,
      cards,
      channels: params.channels,
      parameters: params.parameters ?? [],
    },
  });
  if (error) throw new Error(`Create dashboard subscription failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateDashboardSubscription = async (
  client: MetabaseClient,
  subscriptionId: number,
  params: Record<string, unknown>
) => {
  const { data, error } = await client.PUT("/api/pulse/{id}", {
    params: { path: { id: subscriptionId } },
    body: params,
  });
  if (error) throw new Error(`Update dashboard subscription failed: ${JSON.stringify(error)}`);
  return data;
};

/** Pulses can't be hard-deleted via the API; archiving removes them from the dashboard. */
export const deleteDashboardSubscription = async (client: MetabaseClient, subscriptionId: number) => {
  await updateDashboardSubscription(client, subscriptionId, { archived: true });
  return { success: true };
};

// ── Generic notifications (alerts, dashboard subscriptions migrated to notifications, system events) ──

export const listNotifications = async (
  client: MetabaseClient,
  params?: {
    payload_type?: string;
    card_id?: number;
    creator_id?: number;
    recipient_id?: number;
    include_inactive?: boolean;
  }
) => {
  const query: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params ?? {})) if (v !== undefined) query[k] = v;
  const { data, error } = await client.GET("/api/notification", { params: { query } });
  if (error) throw new Error(`List notifications failed: ${JSON.stringify(error)}`);
  return data;
};

/** Send a notification now, outside its schedule (0.64+: needs creator or admin). */
export const sendNotificationNow = async (
  client: MetabaseClient,
  id: number,
  params?: { handler_ids?: number[] }
) => {
  const body: Record<string, unknown> = {};
  if (params?.handler_ids?.length) body.handler_ids = params.handler_ids;
  const { error } = await client.POST("/api/notification/{id}/send", {
    params: { path: { id } },
    body,
  });
  if (error) throw new Error(`Send notification failed: ${JSON.stringify(error)}`);
  return { success: true };
};
