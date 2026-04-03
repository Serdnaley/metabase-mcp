import type { MetabaseClient } from "../client.js";

export const listDatabases = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/database", {
    params: {
      query: {
        include_analytics: false,
        saved: false,
        include_editable_data_model: false,
        exclude_uneditable_details: true,
        include_only_uploadable: false,
      },
    },
  });
  if (error) throw new Error(`List databases failed: ${JSON.stringify(error)}`);
  return data;
};

export const getDatabase = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/database/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Get database failed: ${JSON.stringify(error)}`);
  return data;
};

export const getDatabaseMetadata = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/database/{id}/metadata", {
    params: {
      path: { id },
      query: {
        include_hidden: false,
        include_editable_data_model: false,
        remove_inactive: true,
        skip_fields: false,
      },
    },
  });
  if (error) throw new Error(`Get database metadata failed: ${JSON.stringify(error)}`);
  return data;
};

export const listDatabaseSchemas = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/database/{id}/schemas", {
    params: {
      path: { id },
      query: {
        include_editable_data_model: false,
        include_hidden: false,
        include_workspace: false,
      },
    },
  });
  if (error) throw new Error(`List database schemas failed: ${JSON.stringify(error)}`);
  return data;
};

export const getDatabaseSchema = async (client: MetabaseClient, id: number, schema: string) => {
  const { data, error } = await client.GET("/api/database/{id}/schema/{schema}", {
    params: {
      path: { id, schema },
      query: {
        include_hidden: false,
        include_editable_data_model: false,
      },
    },
  });
  if (error) throw new Error(`Get database schema failed: ${JSON.stringify(error)}`);
  return data;
};
