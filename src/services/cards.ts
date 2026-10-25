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
    type?: "question" | "model" | "metric";
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
      type: (params.type ?? "question") as any,
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
    type?: "question" | "model" | "metric";
    result_metadata?: Record<string, unknown>[];
    enable_embedding?: boolean;
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
  if (params.type !== undefined) body.type = params.type;
  if (params.result_metadata !== undefined) body.result_metadata = params.result_metadata;
  if (params.enable_embedding !== undefined) body.enable_embedding = params.enable_embedding;

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
    // Fetch the card to get template tag + parameter metadata
    const card = (await getCard(client, cardId)) as any;
    const dq = card?.dataset_query;
    // Legacy MBQL keeps tags under native; MBQL 5 (Metabase 0.57+) under stages[0]
    // MBQL 5 stores them as an array of tags, legacy as a map keyed by name
    const rawTags = dq?.native?.["template-tags"] ?? dq?.stages?.[0]?.["template-tags"] ?? {};
    const templateTags: Record<string, any> = Array.isArray(rawTags)
      ? Object.fromEntries(rawTags.map((t: any) => [t?.name, t]))
      : rawTags;
    const cardParams: any[] = Array.isArray(card?.parameters) ? card.parameters : [];

    parameters = Object.entries(params.parameter_values).map(([name, value]) => {
      const tag = templateTags[name];
      const cardParam = cardParams.find(
        (p) =>
          p?.slug === name ||
          (Array.isArray(p?.target) && JSON.stringify(p.target).includes(`["template-tag","${name}"]`))
      );

      // Map template tag types to Metabase parameter types
      const tagType = tag?.type || "text";
      let paramType = "category";
      if (tagType === "date") {
        // Raw date variables only accept date/single (Metabase 0.60+ validates this);
        // widget-type only matters for field filters
        paramType = "date/single";
      } else if (tagType === "dimension" && tag?.["widget-type"]?.startsWith("date")) {
        paramType = tag["widget-type"];
      } else if (tagType === "number") {
        paramType = "number/=";
      } else if (tagType === "dimension" && tag?.["widget-type"]) {
        paramType = tag["widget-type"];
      }

      const target =
        cardParam?.target ??
        (tagType === "dimension"
          ? ["dimension", ["template-tag", name]]
          : ["variable", ["template-tag", name]]);

      // Metabase 0.60+ requires parameters[].id; it matches the template tag / card parameter id
      const id = cardParam?.id ?? tag?.id ?? name;

      return { id, type: cardParam?.type ?? paramType, target, value };
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
