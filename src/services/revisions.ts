import type { MetabaseClient } from "../client.js";

export const listRevisions = async (
  client: MetabaseClient,
  params: { entity: string; id: number }
) => {
  const { data, error } = await client.GET("/api/revision", {
    params: { query: { entity: params.entity, id: params.id } },
  } as any);
  if (error) throw new Error(`List revisions failed: ${JSON.stringify(error)}`);
  return data;
};

export const revertRevision = async (
  client: MetabaseClient,
  params: { entity: string; id: number; revision_id: number }
) => {
  const { data, error } = await client.POST("/api/revision/revert", {
    body: {
      entity: params.entity,
      id: params.id,
      revision_id: params.revision_id,
    } as any,
  });
  if (error) throw new Error(`Revert revision failed: ${JSON.stringify(error)}`);
  return data;
};
