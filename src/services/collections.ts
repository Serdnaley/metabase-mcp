import type { MetabaseClient } from "../client.js";

export const listCollections = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/collection", {
    params: {
      query: {
        archived: false,
        "exclude-other-user-collections": false,
        "personal-only": false,
      },
    },
  });
  if (error) throw new Error(`List collections failed: ${JSON.stringify(error)}`);
  return data;
};

export const getCollection = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/collection/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Get collection failed: ${JSON.stringify(error)}`);
  return data;
};

export const listCollectionItems = async (
  client: MetabaseClient,
  id: number,
  params?: { models?: string[]; sort_column?: string; sort_direction?: string }
) => {
  const { data, error } = await client.GET("/api/collection/{id}/items", {
    params: {
      path: { id },
      query: {
        models: params?.models as any,
        sort_column: params?.sort_column as any,
        sort_direction: params?.sort_direction as any,
        archived: false,
        include_can_run_adhoc_query: false,
        show_dashboard_questions: false,
      },
    },
  });
  if (error) throw new Error(`List collection items failed: ${JSON.stringify(error)}`);
  return data;
};

export const createCollection = async (
  client: MetabaseClient,
  params: { name: string; description?: string; parent_id?: number }
) => {
  const { data, error } = await client.POST("/api/collection", {
    body: {
      name: params.name,
      description: params.description ?? null,
      parent_id: params.parent_id ?? null,
    },
  });
  if (error) throw new Error(`Create collection failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateCollection = async (
  client: MetabaseClient,
  id: number,
  params: { name?: string; description?: string; parent_id?: number; archived?: boolean }
) => {
  const { data, error } = await client.PUT("/api/collection/{id}", {
    params: { path: { id } },
    body: {
      name: params.name ?? null,
      description: params.description ?? null,
      parent_id: params.parent_id ?? null,
      archived: params.archived ?? false,
    },
  });
  if (error) throw new Error(`Update collection failed: ${JSON.stringify(error)}`);
  return data;
};
