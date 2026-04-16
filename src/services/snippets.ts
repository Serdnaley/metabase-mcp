import type { MetabaseClient } from "../client.js";

export const listSnippets = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/native-query-snippet", {} as any);
  if (error) throw new Error(`List snippets failed: ${JSON.stringify(error)}`);
  return data;
};

export const getSnippet = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/native-query-snippet/{id}", {
    params: { path: { id } },
  } as any);
  if (error) throw new Error(`Get snippet failed: ${JSON.stringify(error)}`);
  return data;
};

export const createSnippet = async (
  client: MetabaseClient,
  params: { name: string; content: string; description?: string; collection_id?: number }
) => {
  const { data, error } = await client.POST("/api/native-query-snippet", {
    body: {
      name: params.name,
      content: params.content,
      description: params.description ?? null,
      collection_id: params.collection_id ?? null,
    } as any,
  });
  if (error) throw new Error(`Create snippet failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateSnippet = async (
  client: MetabaseClient,
  id: number,
  params: { name?: string; content?: string; description?: string; archived?: boolean }
) => {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.content !== undefined) body.content = params.content;
  if (params.description !== undefined) body.description = params.description;
  if (params.archived !== undefined) body.archived = params.archived;
  const { data, error } = await client.PUT("/api/native-query-snippet/{id}", {
    params: { path: { id } },
    body: body as any,
  } as any);
  if (error) throw new Error(`Update snippet failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteSnippet = async (client: MetabaseClient, id: number) => {
  // Snippets are archived, not deleted
  return updateSnippet(client, id, { archived: true });
};
