import type { MetabaseClient } from "../client.js";

export const listDashboards = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/dashboard", {
    params: { query: {} },
  });
  if (error) throw new Error(`List dashboards failed: ${JSON.stringify(error)}`);
  return data;
};

export const getDashboard = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/dashboard/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Get dashboard failed: ${JSON.stringify(error)}`);
  return data;
};

export const createDashboard = async (
  client: MetabaseClient,
  params: {
    name: string;
    description?: string;
    collection_id?: number;
    parameters?: Record<string, unknown>[];
  }
) => {
  const { data, error } = await client.POST("/api/dashboard", {
    body: {
      name: params.name,
      description: params.description ?? null,
      collection_id: params.collection_id ?? null,
      parameters: (params.parameters as any) ?? null,
    },
  });
  if (error) throw new Error(`Create dashboard failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateDashboard = async (
  client: MetabaseClient,
  id: number,
  params: {
    name?: string;
    description?: string;
    collection_id?: number;
    archived?: boolean;
    parameters?: Record<string, unknown>[];
    enable_embedding?: boolean;
  }
) => {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.description !== undefined) body.description = params.description;
  if (params.collection_id !== undefined) body.collection_id = params.collection_id;
  if (params.archived !== undefined) body.archived = params.archived;
  if (params.parameters !== undefined) body.parameters = params.parameters;
  if (params.enable_embedding !== undefined) body.enable_embedding = params.enable_embedding;

  const { data, error } = await client.PUT("/api/dashboard/{id}", {
    params: { path: { id } },
    body: body as any,
  });
  if (error) throw new Error(`Update dashboard failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteDashboard = async (client: MetabaseClient, id: number) => {
  const { error } = await client.DELETE("/api/dashboard/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Delete dashboard failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const copyDashboard = async (
  client: MetabaseClient,
  fromDashboardId: number,
  params?: {
    name?: string;
    description?: string;
    collection_id?: number;
    is_deep_copy?: boolean;
  }
) => {
  const { data, error } = await client.POST(
    "/api/dashboard/{from-dashboard-id}/copy",
    {
      params: { path: { "from-dashboard-id": fromDashboardId } },
      body: {
        name: params?.name ?? null,
        description: params?.description ?? null,
        collection_id: params?.collection_id ?? null,
        is_deep_copy: params?.is_deep_copy ?? false,
      },
    }
  );
  if (error) throw new Error(`Copy dashboard failed: ${JSON.stringify(error)}`);
  return data;
};

export const createDashboardPublicLink = async (client: MetabaseClient, dashboardId: number) => {
  // The OpenAPI spec defines content?: never for this response, so openapi-fetch
  // won't parse the body (data is undefined). We use the raw response instead.
  const { error, response } = await client.POST("/api/dashboard/{dashboard-id}/public_link", {
    params: { path: { "dashboard-id": dashboardId } },
  });
  if (error) throw new Error(`Create dashboard public link failed: ${JSON.stringify(error)}`);
  try {
    return await response.clone().json();
  } catch {
    // Fallback: fetch the dashboard to get the public_uuid
    const dashboard = await getDashboard(client, dashboardId);
    return dashboard;
  }
};

export const deleteDashboardPublicLink = async (client: MetabaseClient, dashboardId: number) => {
  const { error } = await client.DELETE("/api/dashboard/{dashboard-id}/public_link", {
    params: { path: { "dashboard-id": dashboardId } },
  });
  if (error) throw new Error(`Delete dashboard public link failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const updateDashboardCards = async (
  client: MetabaseClient,
  id: number,
  cards: Array<{
    id?: number;
    card_id?: number;
    row: number;
    col: number;
    size_x: number;
    size_y: number;
    parameter_mappings?: Record<string, unknown>[];
    visualization_settings?: Record<string, unknown>;
    series?: Record<string, unknown>[];
  }>
) => {
  // New cards need a negative temporary ID for Metabase to accept them
  let tempId = -1;
  const cardsWithIds = cards.map((card) => ({
    ...card,
    id: card.id ?? tempId--,
  }));

  const { data, error } = await client.PUT("/api/dashboard/{id}/cards", {
    params: { path: { id } },
    body: { cards: cardsWithIds as any },
  });
  if (error) throw new Error(`Update dashboard cards failed: ${JSON.stringify(error)}`);
  return data;
};
