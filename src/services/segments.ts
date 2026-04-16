import type { MetabaseClient } from "../client.js";

export const listSegments = async (client: MetabaseClient, params?: { table_id?: number }) => {
  const { data, error } = await client.GET("/api/segment", {
    params: params?.table_id !== undefined ? { query: { table_id: params.table_id } } : {},
  } as any);
  if (error) throw new Error(`List segments failed: ${JSON.stringify(error)}`);
  return data;
};

export const getSegment = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/segment/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Get segment failed: ${JSON.stringify(error)}`);
  return data;
};

export const createSegment = async (
  client: MetabaseClient,
  params: {
    name: string;
    table_id: number;
    definition: Record<string, unknown>;
    description?: string;
  }
) => {
  const { data, error } = await client.POST("/api/segment", {
    body: {
      name: params.name,
      table_id: params.table_id,
      definition: params.definition,
      description: params.description ?? null,
    } as any,
  });
  if (error) throw new Error(`Create segment failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateSegment = async (
  client: MetabaseClient,
  id: number,
  params: {
    name?: string;
    definition?: Record<string, unknown>;
    description?: string;
    archived?: boolean;
    revision_message: string;
  }
) => {
  const body: Record<string, unknown> = {
    id,
    revision_message: params.revision_message,
  };
  if (params.name !== undefined) body.name = params.name;
  if (params.definition !== undefined) body.definition = params.definition;
  if (params.description !== undefined) body.description = params.description;
  if (params.archived !== undefined) body.archived = params.archived;

  const { data, error } = await client.PUT("/api/segment/{id}", {
    params: { path: { id } },
    body: body as any,
  });
  if (error) throw new Error(`Update segment failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteSegment = async (
  client: MetabaseClient,
  id: number,
  revisionMessage: string
) => {
  const { error } = await client.DELETE("/api/segment/{id}", {
    params: { path: { id }, query: { revision_message: revisionMessage } },
  });
  if (error) throw new Error(`Delete segment failed: ${JSON.stringify(error)}`);
  return { success: true };
};
