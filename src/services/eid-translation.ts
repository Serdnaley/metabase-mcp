import type { MetabaseClient } from "../client.js";

export const translateEntityIds = async (
  client: MetabaseClient,
  params: { entity_ids: Record<string, string[]> }
) => {
  const { data, error } = await (client as any).POST("/api/eid-translation/translate", {
    body: params.entity_ids,
  });
  if (error) throw new Error(`Translate entity IDs failed: ${JSON.stringify(error)}`);
  return data;
};
