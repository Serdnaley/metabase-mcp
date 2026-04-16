import type { MetabaseClient } from "../client.js";

export const listTimelines = async (client: MetabaseClient, params?: { collection_id?: number }) => {
  const query: Record<string, unknown> = {};
  if (params?.collection_id !== undefined) query.collection_id = params.collection_id;
  const { data, error } = await (client as any).GET("/api/timeline", { params: { query } });
  if (error) throw new Error(`List timelines failed: ${JSON.stringify(error)}`);
  return data;
};

export const getTimeline = async (client: MetabaseClient, id: number) => {
  const { data, error } = await (client as any).GET("/api/timeline/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Get timeline failed: ${JSON.stringify(error)}`);
  return data;
};

export const createTimeline = async (
  client: MetabaseClient,
  params: { name: string; collection_id?: number; icon?: string; default?: boolean }
) => {
  const { data, error } = await (client as any).POST("/api/timeline", {
    body: {
      name: params.name,
      collection_id: params.collection_id ?? null,
      icon: params.icon ?? "star",
      default: params.default ?? false,
    },
  });
  if (error) throw new Error(`Create timeline failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateTimeline = async (
  client: MetabaseClient,
  id: number,
  params: { name?: string; icon?: string; default?: boolean; archived?: boolean }
) => {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.icon !== undefined) body.icon = params.icon;
  if (params.default !== undefined) body.default = params.default;
  if (params.archived !== undefined) body.archived = params.archived;
  const { data, error } = await (client as any).PUT("/api/timeline/{id}", {
    params: { path: { id } },
    body,
  });
  if (error) throw new Error(`Update timeline failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteTimeline = async (client: MetabaseClient, id: number) => {
  const { error } = await (client as any).DELETE("/api/timeline/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Delete timeline failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const createTimelineEvent = async (
  client: MetabaseClient,
  params: { timeline_id: number; name: string; timestamp: string; description?: string; icon?: string; timezone?: string }
) => {
  // Metabase requires a full ISO 8601 datetime string; if only a date is supplied
  // (e.g. "2026-04-15") append midnight UTC so the API accepts it.
  const timestamp = params.timestamp.includes("T")
    ? params.timestamp
    : `${params.timestamp}T00:00:00Z`;

  const { data, error } = await (client as any).POST("/api/timeline-event", {
    body: {
      timeline_id: params.timeline_id,
      name: params.name,
      timestamp,
      description: params.description ?? null,
      icon: params.icon ?? "star",
      timezone: params.timezone ?? "UTC",
      time_matters: false,
    },
  });
  if (error) throw new Error(`Create timeline event failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateTimelineEvent = async (
  client: MetabaseClient,
  id: number,
  params: { name?: string; timestamp?: string; description?: string; icon?: string; archived?: boolean }
) => {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.timestamp !== undefined) body.timestamp = params.timestamp;
  if (params.description !== undefined) body.description = params.description;
  if (params.icon !== undefined) body.icon = params.icon;
  if (params.archived !== undefined) body.archived = params.archived;
  const { data, error } = await (client as any).PUT("/api/timeline-event/{id}", {
    params: { path: { id } },
    body,
  });
  if (error) throw new Error(`Update timeline event failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteTimelineEvent = async (client: MetabaseClient, id: number) => {
  const { error } = await (client as any).DELETE("/api/timeline-event/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Delete timeline event failed: ${JSON.stringify(error)}`);
  return { success: true };
};
