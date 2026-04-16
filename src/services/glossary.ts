import type { MetabaseClient } from "../client.js";

export const listGlossaryTerms = async (client: MetabaseClient) => {
  const { data, error } = await (client as any).GET("/api/glossary", {});
  if (error) throw new Error(`List glossary terms failed: ${JSON.stringify(error)}`);
  return data;
};

export const getGlossaryTerm = async (client: MetabaseClient, id: number) => {
  const { data, error } = await (client as any).GET("/api/glossary/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Get glossary term failed: ${JSON.stringify(error)}`);
  return data;
};

export const createGlossaryTerm = async (
  client: MetabaseClient,
  params: { term: string; definition: string }
) => {
  const { data, error } = await (client as any).POST("/api/glossary", {
    body: params,
  });
  if (error) throw new Error(`Create glossary term failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateGlossaryTerm = async (
  client: MetabaseClient,
  id: number,
  params: { term?: string; definition?: string }
) => {
  const body: Record<string, unknown> = {};
  if (params.term !== undefined) body.term = params.term;
  if (params.definition !== undefined) body.definition = params.definition;
  const { data, error } = await (client as any).PUT("/api/glossary/{id}", {
    params: { path: { id } },
    body,
  });
  if (error) throw new Error(`Update glossary term failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteGlossaryTerm = async (client: MetabaseClient, id: number) => {
  const { error } = await (client as any).DELETE("/api/glossary/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Delete glossary term failed: ${JSON.stringify(error)}`);
  return { success: true };
};
