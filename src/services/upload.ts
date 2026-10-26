import type { MetabaseClient } from "../client.js";

export const uploadCsv = async (
  client: MetabaseClient,
  params: { file: string; table_name: string; collection_id?: number }
) => {
  // Metabase expects multipart/form-data with a real file part
  const fileName = params.table_name.endsWith(".csv") ? params.table_name : `${params.table_name}.csv`;
  const form = new FormData();
  form.append("file", new Blob([params.file], { type: "text/csv" }), fileName);
  // collection_id is required; Metabase accepts "root" for the root collection
  form.append("collection_id", params.collection_id !== undefined ? String(params.collection_id) : "root");

  const { data, error } = await client.POST("/api/upload/csv", {
    body: form as any,
    bodySerializer: (body: unknown) => body as FormData,
  });
  if (error) throw new Error(`Upload CSV failed: ${JSON.stringify(error)}`);
  return data;
};
