import type { MetabaseClient } from "../client.js";

export const getPermissionsGraph = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/permissions/graph", {});
  if (error) throw new Error(`Get permissions graph failed: ${JSON.stringify(error)}`);
  return data;
};

export const updatePermissionsGraph = async (
  client: MetabaseClient,
  graph: Record<string, unknown>
) => {
  const { data, error } = await client.PUT("/api/permissions/graph", {
    params: { query: { force: null, "skip-graph": null } },
    body: graph as any,
  });
  if (error) throw new Error(`Update permissions graph failed: ${JSON.stringify(error)}`);
  return data;
};

export const getCollectionPermissions = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/collection/graph", {});
  if (error) throw new Error(`Get collection permissions failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateCollectionPermissions = async (
  client: MetabaseClient,
  graph: Record<string, unknown>
) => {
  const { data, error } = await client.PUT("/api/collection/graph", {
    params: { query: { force: null, "skip-graph": null } },
    body: graph as any,
  });
  if (error) throw new Error(`Update collection permissions failed: ${JSON.stringify(error)}`);
  return data;
};
