import type { MetabaseClient } from "../client.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyClient = (client: MetabaseClient): any => client;

export const listAlerts = async (client: MetabaseClient) => {
  const { data, error } = await anyClient(client).GET("/api/alert", {});
  if (error) throw new Error(`List alerts failed: ${JSON.stringify(error)}`);
  return data;
};

export const getAlert = async (client: MetabaseClient, id: number) => {
  const { data, error } = await anyClient(client).GET("/api/alert/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Get alert failed: ${JSON.stringify(error)}`);
  return data;
};

export const createAlert = async (
  client: MetabaseClient,
  params: {
    card: { id: number; include_csv?: boolean; include_xls?: boolean };
    alert_condition: "rows" | "goal";
    alert_first_only?: boolean;
    alert_above_goal?: boolean;
    channels: Record<string, unknown>[];
  }
) => {
  const { data, error } = await anyClient(client).POST("/api/alert", {
    body: {
      card: params.card,
      alert_condition: params.alert_condition,
      alert_first_only: params.alert_first_only ?? false,
      alert_above_goal: params.alert_above_goal ?? null,
      channels: params.channels,
    },
  });
  if (error) throw new Error(`Create alert failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateAlert = async (
  client: MetabaseClient,
  id: number,
  params: Record<string, unknown>
) => {
  const { data, error } = await anyClient(client).PUT("/api/alert/{id}", {
    params: { path: { id } },
    body: params,
  });
  if (error) throw new Error(`Update alert failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteAlert = async (client: MetabaseClient, id: number) => {
  const { error } = await anyClient(client).DELETE("/api/alert/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Delete alert failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const listDashboardSubscriptions = async (
  client: MetabaseClient,
  dashboardId: number
) => {
  const { data, error } = await anyClient(client).GET(
    "/api/dashboard/{dashboard-id}/subscriptions",
    {
      params: { path: { "dashboard-id": dashboardId } },
    }
  );
  if (error)
    throw new Error(
      `List dashboard subscriptions failed: ${JSON.stringify(error)}`
    );
  return data;
};

export const createDashboardSubscription = async (
  client: MetabaseClient,
  dashboardId: number,
  params: {
    channels: Record<string, unknown>[];
    parameters?: Record<string, unknown>[];
  }
) => {
  const { data, error } = await anyClient(client).POST(
    "/api/dashboard/{dashboard-id}/subscription",
    {
      params: { path: { "dashboard-id": dashboardId } },
      body: params,
    }
  );
  if (error)
    throw new Error(
      `Create dashboard subscription failed: ${JSON.stringify(error)}`
    );
  return data;
};

export const updateDashboardSubscription = async (
  client: MetabaseClient,
  subscriptionId: number,
  params: Record<string, unknown>
) => {
  const { data, error } = await anyClient(client).PUT("/api/pulse/{id}", {
    params: { path: { id: subscriptionId } },
    body: params,
  });
  if (error) throw new Error(`Update dashboard subscription failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteDashboardSubscription = async (
  client: MetabaseClient,
  subscriptionId: number
) => {
  const { error } = await anyClient(client).DELETE("/api/pulse/{id}", {
    params: { path: { id: subscriptionId } },
  });
  if (error) throw new Error(`Delete dashboard subscription failed: ${JSON.stringify(error)}`);
  return { success: true };
};
