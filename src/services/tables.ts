import type { MetabaseClient } from "../client.js";

export const getTable = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/table/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Get table failed: ${JSON.stringify(error)}`);
  return data;
};

export const getTableQueryMetadata = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/table/{id}/query_metadata", {
    params: {
      path: { id },
      query: {
        include_sensitive_fields: false,
        include_hidden_fields: false,
        include_editable_data_model: false,
      },
    },
  });
  if (error) throw new Error(`Get table query metadata failed: ${JSON.stringify(error)}`);
  return data;
};

export const getField = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/field/{id}", {
    params: {
      path: { id },
      query: { include_editable_data_model: false },
    },
  });
  if (error) throw new Error(`Get field failed: ${JSON.stringify(error)}`);
  return data;
};

export const getFieldValues = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/field/{id}/values", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Get field values failed: ${JSON.stringify(error)}`);
  return data;
};
