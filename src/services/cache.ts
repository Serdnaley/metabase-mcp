import type { MetabaseClient } from "../client.js";

export const invalidateCache = async (
  client: MetabaseClient,
  params?: { database?: number; dashboard?: number; card?: number }
) => {
  const { data, error } = await client.POST("/api/cache/invalidate", {
    params: { query: params },
  } as any);
  if (error) throw new Error(`Invalidate cache failed: ${JSON.stringify(error)}`);
  return data ?? { success: true };
};

export const updateCacheConfig = async (
  client: MetabaseClient,
  params: { model: string; model_id: number; strategy: Record<string, unknown> }
) => {
  const { data, error } = await client.PUT("/api/cache", {
    body: params as any,
  } as any);
  if (error) throw new Error(`Update cache config failed: ${JSON.stringify(error)}`);
  return data;
};
