import type { MetabaseClient } from "../client.js";

export const listCards = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/card", {
    params: { query: { f: "all" } },
  });
  if (error) throw new Error(`List cards failed: ${JSON.stringify(error)}`);
  return data;
};

export const getCard = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/card/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Get card failed: ${JSON.stringify(error)}`);
  return data;
};

export const createCard = async (
  client: MetabaseClient,
  params: {
    name: string;
    dataset_query: Record<string, unknown>;
    display: string;
    description?: string;
    collection_id?: number;
    visualization_settings?: Record<string, unknown>;
  }
) => {
  const { data, error } = await client.POST("/api/card", {
    body: {
      name: params.name,
      dataset_query: params.dataset_query as any,
      display: params.display as any,
      description: params.description ?? null,
      collection_id: params.collection_id ?? null,
      visualization_settings: (params.visualization_settings ?? {}) as any,
    },
  });
  if (error) throw new Error(`Create card failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateCard = async (
  client: MetabaseClient,
  id: number,
  params: {
    name?: string;
    dataset_query?: Record<string, unknown>;
    display?: string;
    description?: string;
    collection_id?: number;
    visualization_settings?: Record<string, unknown>;
    archived?: boolean;
  }
) => {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.dataset_query !== undefined) body.dataset_query = params.dataset_query;
  if (params.display !== undefined) body.display = params.display;
  if (params.description !== undefined) body.description = params.description;
  if (params.collection_id !== undefined) body.collection_id = params.collection_id;
  if (params.visualization_settings !== undefined) body.visualization_settings = params.visualization_settings;
  if (params.archived !== undefined) body.archived = params.archived;

  const { data, error } = await client.PUT("/api/card/{id}", {
    params: { path: { id } },
    body: body as any,
  });
  if (error) throw new Error(`Update card failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteCard = async (client: MetabaseClient, id: number) => {
  const { error } = await client.DELETE("/api/card/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Delete card failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const copyCard = async (
  client: MetabaseClient,
  id: number,
  params?: { collection_id?: number }
) => {
  const { data, error } = await client.POST("/api/card/{id}/copy", {
    params: { path: { id } },
    body: { collection_id: params?.collection_id } as any,
  });
  if (error) throw new Error(`Copy card failed: ${JSON.stringify(error)}`);
  return data;
};

export const createCardPublicLink = async (client: MetabaseClient, cardId: number) => {
  // The OpenAPI spec defines content?: never for this response, so openapi-fetch
  // won't parse the body (data is undefined). We use the raw response instead.
  const { error, response } = await client.POST("/api/card/{card-id}/public_link", {
    params: { path: { "card-id": cardId } },
  });
  if (error) throw new Error(`Create card public link failed: ${JSON.stringify(error)}`);
  try {
    return await response.clone().json();
  } catch {
    // Fallback: fetch the card to get the public_uuid
    const card = await getCard(client, cardId);
    return card;
  }
};

export const deleteCardPublicLink = async (client: MetabaseClient, cardId: number) => {
  const { error } = await client.DELETE("/api/card/{card-id}/public_link", {
    params: { path: { "card-id": cardId } },
  });
  if (error) throw new Error(`Delete card public link failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const executeCardQuery = async (
  client: MetabaseClient,
  cardId: number,
  params?: { parameter_values?: Record<string, unknown> }
) => {
  let parameters: unknown[] | undefined;

  if (params?.parameter_values && Object.keys(params.parameter_values).length > 0) {
    // Fetch the card to get template tag metadata
    const card = (await getCard(client, cardId)) as any;
    const templateTags = card?.dataset_query?.native?.["template-tags"] || {};

    parameters = Object.entries(params.parameter_values).map(([name, value]) => {
      const tag = templateTags[name];
      const tagType = tag?.type || "text";

      // Map template tag types to Metabase parameter types
      let paramType = "category";
      if (tagType === "date" || tag?.["widget-type"]?.startsWith("date")) {
        paramType = tag?.["widget-type"] || "date/single";
      } else if (tagType === "number") {
        paramType = "number/=";
      } else if (tagType === "text") {
        paramType = "category";
      }

      return {
        type: paramType,
        target: ["variable", ["template-tag", name]],
        value,
      };
    });
  }

  const { data, error } = await client.POST("/api/card/{card-id}/query", {
    params: { path: { "card-id": cardId } },
    body: {
      ignore_cache: false,
      parameters,
    } as any,
  });
  if (error) throw new Error(`Execute card query failed: ${JSON.stringify(error)}`);
  return data;
};
