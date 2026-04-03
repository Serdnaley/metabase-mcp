import type { MetabaseClient } from "../client.js";

export const executeQuery = async (
  client: MetabaseClient,
  params: {
    database: number;
    type: "native" | "query";
    native?: { query: string; template_tags?: Record<string, unknown> };
    query?: Record<string, unknown>;
  }
) => {
  const { data, error } = await client.POST("/api/dataset", {
    body: {
      database: params.database,
      type: params.type,
      native: params.native,
      query: params.query,
    } as any,
  });
  if (error) throw new Error(`Execute query failed: ${JSON.stringify(error)}`);
  return data;
};
