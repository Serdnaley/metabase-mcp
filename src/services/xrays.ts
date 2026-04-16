import type { MetabaseClient } from "../client.js";

export const generateXray = async (client: MetabaseClient, tableId: number) => {
  const { data, error } = await (client as any).GET("/api/automagic-dashboards/table/{id}", {
    params: { path: { id: tableId } },
  });
  if (error) throw new Error(`Generate X-ray failed: ${JSON.stringify(error)}`);
  return data;
};
