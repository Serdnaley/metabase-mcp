import type { MetabaseClient } from "../client.js";
import { normalizeDefinition } from "./segments.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyClient = (client: MetabaseClient): any => client;

// Measures are reusable, table-scoped aggregations ("Revenue = sum of Total").
// Like segments, Metabase 0.60+ wants a full query as the definition; a bare
// `{ aggregation: [...] }` is wrapped. table_id is still required by 0.59 and
// ignored by 0.64 (which derives it from the definition), so it is always sent.

export const listMeasures = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/measure", {});
  if (error) throw new Error(`List measures failed: ${JSON.stringify(error)}`);
  return data;
};

export const getMeasure = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/measure/{id}", { params: { path: { id } } });
  if (error) throw new Error(`Get measure failed: ${JSON.stringify(error)}`);
  return data;
};

export const createMeasure = async (
  client: MetabaseClient,
  params: { name: string; table_id: number; definition: Record<string, unknown>; description?: string }
) => {
  const body: Record<string, unknown> = {
    name: params.name,
    table_id: params.table_id,
    definition: await normalizeDefinition(client, params.table_id, params.definition),
  };
  if (params.description !== undefined) body.description = params.description;
  const { data, error } = await anyClient(client).POST("/api/measure", { body });
  if (error) throw new Error(`Create measure failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateMeasure = async (
  client: MetabaseClient,
  id: number,
  params: {
    revision_message: string;
    name?: string;
    definition?: Record<string, unknown>;
    description?: string;
    archived?: boolean;
  }
) => {
  const body: Record<string, unknown> = { revision_message: params.revision_message };
  if (params.name !== undefined) body.name = params.name;
  if (params.description !== undefined) body.description = params.description;
  if (params.archived !== undefined) body.archived = params.archived;
  if (params.definition !== undefined) {
    const current = (await getMeasure(client, id)) as any;
    body.definition = await normalizeDefinition(client, current.table_id, params.definition);
  }
  const { data, error } = await anyClient(client).PUT("/api/measure/{id}", { params: { path: { id } }, body });
  if (error) throw new Error(`Update measure failed: ${JSON.stringify(error)}`);
  return data;
};
