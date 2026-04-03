import type { MetabaseClient } from "../client.js";

export const listActions = async (
  client: MetabaseClient,
  params?: { model_id?: number }
) => {
  const { data, error } = await client.GET("/api/action", {
    params: { query: { "model-id": params?.model_id } },
  });
  if (error) throw new Error(`List actions failed: ${JSON.stringify(error)}`);
  return data;
};

export const getAction = async (client: MetabaseClient, actionId: number) => {
  const { data, error } = await client.GET("/api/action/{action-id}", {
    params: { path: { "action-id": actionId } },
  });
  if (error) throw new Error(`Get action failed: ${JSON.stringify(error)}`);
  return data;
};

export const createAction = async (
  client: MetabaseClient,
  params: Record<string, unknown>
) => {
  const { data, error } = await client.POST("/api/action", {
    body: params as any,
  });
  if (error) throw new Error(`Create action failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateAction = async (
  client: MetabaseClient,
  id: number,
  params: Record<string, unknown>
) => {
  const { data, error } = await client.PUT("/api/action/{id}", {
    params: { path: { id } },
    body: params as any,
  });
  if (error) throw new Error(`Update action failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteAction = async (client: MetabaseClient, actionId: number) => {
  const { error } = await client.DELETE("/api/action/{action-id}", {
    params: { path: { "action-id": actionId } },
  });
  if (error) throw new Error(`Delete action failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const executeAction = async (
  client: MetabaseClient,
  id: number,
  params?: { parameters?: Record<string, unknown> }
) => {
  const { data, error } = await client.POST("/api/action/{id}/execute", {
    params: { path: { id } },
    body: { parameters: params?.parameters ?? null },
  });
  if (error) throw new Error(`Execute action failed: ${JSON.stringify(error)}`);
  return data;
};
