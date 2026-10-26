import type { MetabaseClient } from "../client.js";
import { apiError } from "./version.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyClient = (client: MetabaseClient): any => client;

const compactKey = (k: any) => ({
  id: k.id,
  name: k.name,
  group: k.group ? { id: k.group.id, name: k.group.name } : undefined,
  masked_key: k.masked_key,
  // Only present right after create/regenerate: Metabase shows the key once
  ...(k.unmasked_key ? { unmasked_key: k.unmasked_key } : {}),
  created_at: k.created_at,
  updated_at: k.updated_at,
  updated_by: k.updated_by?.common_name,
});

export const listApiKeys = async (client: MetabaseClient) => {
  const { data, error } = await anyClient(client).GET("/api/api-key", {});
  if (error) throw await apiError(client, "List API keys", error);
  return (Array.isArray(data) ? data : []).map(compactKey);
};

export const createApiKey = async (client: MetabaseClient, params: { name: string; group_id: number }) => {
  const { data, error } = await anyClient(client).POST("/api/api-key", { body: params });
  if (error) throw await apiError(client, "Create API key", error);
  return compactKey(data);
};

export const updateApiKey = async (
  client: MetabaseClient,
  id: number,
  params: { name?: string; group_id?: number }
) => {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.group_id !== undefined) body.group_id = params.group_id;
  const { data, error } = await anyClient(client).PUT("/api/api-key/{id}", { params: { path: { id } }, body });
  if (error) throw await apiError(client, "Update API key", error);
  return compactKey(data);
};

export const regenerateApiKey = async (client: MetabaseClient, id: number) => {
  const { data, error } = await anyClient(client).PUT("/api/api-key/{id}/regenerate", { params: { path: { id } } });
  if (error) throw await apiError(client, "Regenerate API key", error);
  return compactKey(data);
};

export const deleteApiKey = async (client: MetabaseClient, id: number) => {
  const { error } = await anyClient(client).DELETE("/api/api-key/{id}", { params: { path: { id } } });
  if (error) throw await apiError(client, "Delete API key", error);
  return { success: true };
};
