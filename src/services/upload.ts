import type { MetabaseClient } from "../client.js";

export const uploadCsv = async (
  client: MetabaseClient,
  params: { file: string; table_name: string; collection_id?: number }
) => {
  // CSV upload requires multipart form, use raw fetch-based approach
  const { data, error } = await client.POST("/api/upload/csv", {
    body: {
      file: params.file,
      table_name: params.table_name,
      collection_id: params.collection_id,
    } as any,
  });
  if (error) throw new Error(`Upload CSV failed: ${JSON.stringify(error)}`);
  return data;
};
