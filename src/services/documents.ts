import type { MetabaseClient } from "../client.js";

export const listDocuments = async (client: MetabaseClient) => {
  const { data, error } = await (client as any).GET("/api/document", {});
  if (error) throw new Error(`List documents failed: ${JSON.stringify(error)}`);
  return data;
};

export const getDocument = async (client: MetabaseClient, id: number) => {
  const { data, error } = await (client as any).GET("/api/document/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Get document failed: ${JSON.stringify(error)}`);
  return data;
};

export const createDocument = async (
  client: MetabaseClient,
  params: { name: string; collection_id?: number; content?: Record<string, unknown> }
) => {
  const { data, error } = await (client as any).POST("/api/document", {
    body: {
      name: params.name,
      collection_id: params.collection_id ?? null,
      content: params.content ?? null,
    },
  });
  if (error) throw new Error(`Create document failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateDocument = async (
  client: MetabaseClient,
  id: number,
  params: { name?: string; collection_id?: number; content?: Record<string, unknown>; archived?: boolean }
) => {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.collection_id !== undefined) body.collection_id = params.collection_id;
  if (params.content !== undefined) body.content = params.content;
  if (params.archived !== undefined) body.archived = params.archived;
  const { data, error } = await (client as any).PUT("/api/document/{id}", {
    params: { path: { id } },
    body,
  });
  if (error) throw new Error(`Update document failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteDocument = async (client: MetabaseClient, id: number) => {
  const { error } = await (client as any).DELETE("/api/document/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Delete document failed: ${JSON.stringify(error)}`);
  return { success: true };
};
