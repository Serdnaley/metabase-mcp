import type { MetabaseClient } from "../client.js";

export const updateTable = async (
  client: MetabaseClient,
  id: number,
  params: { display_name?: string; description?: string; visibility_type?: string; entity_type?: string }
) => {
  const body: Record<string, unknown> = {};
  if (params.display_name !== undefined) body.display_name = params.display_name;
  if (params.description !== undefined) body.description = params.description;
  if (params.visibility_type !== undefined) body.visibility_type = params.visibility_type;
  if (params.entity_type !== undefined) body.entity_type = params.entity_type;
  const { data, error } = await client.PUT("/api/table/{id}", {
    params: { path: { id } },
    body: body as any,
  });
  if (error) throw new Error(`Update table failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateField = async (
  client: MetabaseClient,
  id: number,
  params: {
    display_name?: string;
    description?: string;
    semantic_type?: string;
    visibility_type?: string;
    has_field_values?: string;
    fk_target_field_id?: number;
    coercion_strategy?: string;
  }
) => {
  const body: Record<string, unknown> = {};
  if (params.display_name !== undefined) body.display_name = params.display_name;
  if (params.description !== undefined) body.description = params.description;
  if (params.semantic_type !== undefined) body.semantic_type = params.semantic_type;
  if (params.visibility_type !== undefined) body.visibility_type = params.visibility_type;
  if (params.has_field_values !== undefined) body.has_field_values = params.has_field_values;
  if (params.fk_target_field_id !== undefined) body.fk_target_field_id = params.fk_target_field_id;
  if (params.coercion_strategy !== undefined) body.coercion_strategy = params.coercion_strategy;
  const { data, error } = await client.PUT("/api/field/{id}", {
    params: { path: { id } },
    body: body as any,
  });
  if (error) throw new Error(`Update field failed: ${JSON.stringify(error)}`);
  return data;
};

export const rescanFieldValues = async (client: MetabaseClient, id: number) => {
  const { error } = await client.POST("/api/field/{id}/rescan_values", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Rescan field values failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const discardFieldValues = async (client: MetabaseClient, id: number) => {
  const { error } = await client.POST("/api/field/{id}/discard_values", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Discard field values failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const reorderFields = async (client: MetabaseClient, id: number, fieldOrder: number[]) => {
  const { error } = await client.PUT("/api/table/{id}/fields/order", {
    params: { path: { id } },
    body: fieldOrder as any,
  });
  if (error) throw new Error(`Reorder fields failed: ${JSON.stringify(error)}`);
  return { success: true };
};

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
