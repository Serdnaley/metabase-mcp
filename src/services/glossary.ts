import type { MetabaseClient } from "../client.js";

export const listGlossaryTerms = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/glossary", {});
  if (error) throw new Error(`List glossary terms failed: ${JSON.stringify(error)}`);
  return data;
};

/** Metabase has no GET /api/glossary/{id}; look the term up in the list. */
export const getGlossaryTerm = async (client: MetabaseClient, id: number) => {
  const list = (await listGlossaryTerms(client)) as any;
  const terms: any[] = Array.isArray(list) ? list : list?.data ?? [];
  const term = terms.find((t) => t?.id === id);
  if (!term) throw new Error(`Get glossary term failed: term ${id} not found`);
  return term;
};

export const createGlossaryTerm = async (
  client: MetabaseClient,
  params: { term: string; definition: string }
) => {
  const { data, error } = await client.POST("/api/glossary", {
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
  // PUT requires both term and definition; fill the missing one from the current term
  let current: any = {};
  if (params.term === undefined || params.definition === undefined) current = await getGlossaryTerm(client, id);
  const body: Record<string, unknown> = {
    term: params.term ?? current.term,
    definition: params.definition ?? current.definition,
  };
  const { data, error } = await (client as any).PUT("/api/glossary/{id}", {
    params: { path: { id } },
    body,
  });
  if (error) throw new Error(`Update glossary term failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteGlossaryTerm = async (client: MetabaseClient, id: number) => {
  const { error } = await client.DELETE("/api/glossary/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Delete glossary term failed: ${JSON.stringify(error)}`);
  return { success: true };
};
