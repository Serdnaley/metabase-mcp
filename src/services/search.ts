import type { MetabaseClient } from "../client.js";

export const search = async (
  client: MetabaseClient,
  params: { q: string; models?: string[]; collection?: string }
) => {
  const { data, error } = await client.GET("/api/search", {
    params: {
      query: {
        q: params.q,
        models: params.models as any,
        collection: params.collection as any,
        archived: false,
        model_ancestors: false,
        include_dashboard_questions: false,
        include_metadata: false,
      },
    },
  });

  if (error) throw new Error(`Search failed: ${JSON.stringify(error)}`);
  return data;
};
