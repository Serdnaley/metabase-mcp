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

export const createDatabase = async (
  client: MetabaseClient,
  params: { name: string; engine: string; details: Record<string, unknown> }
) => {
  const { data, error } = await client.POST("/api/database", {
    body: {
      name: params.name,
      engine: params.engine,
      details: params.details,
    } as any,
  });
  if (error) throw new Error(`Create database failed: ${JSON.stringify(error)}`);
  return data ?? { success: true };
};

export const updateDatabase = async (
  client: MetabaseClient,
  params: {
    id: number;
    name?: string;
    engine?: string;
    details?: Record<string, unknown>;
    is_full_sync?: boolean;
    auto_run_queries?: boolean;
  }
) => {
  const { id, ...rest } = params;
  const body: Record<string, unknown> = {};
  if (rest.name !== undefined) body.name = rest.name;
  if (rest.engine !== undefined) body.engine = rest.engine;
  if (rest.details !== undefined) body.details = rest.details;
  if (rest.is_full_sync !== undefined) body.is_full_sync = rest.is_full_sync;
  if (rest.auto_run_queries !== undefined) body.auto_run_queries = rest.auto_run_queries;

  const { data, error } = await client.PUT("/api/database/{id}", {
    params: { path: { id } },
    body: body as any,
  });
  if (error) throw new Error(`Update database failed: ${JSON.stringify(error)}`);
  return data ?? { success: true };
};

export const deleteDatabase = async (client: MetabaseClient, id: number) => {
  const { error } = await client.DELETE("/api/database/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Delete database failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const validateDatabase = async (
  client: MetabaseClient,
  params: { engine: string; details: Record<string, unknown> }
) => {
  const { data, error } = await client.POST("/api/database/validate", {
    body: {
      details: {
        engine: params.engine,
        details: params.details,
      },
    } as any,
  });
  if (error) throw new Error(`Validate database failed: ${JSON.stringify(error)}`);
  return data ?? { success: true };
};

export const syncDatabaseSchema = async (client: MetabaseClient, id: number) => {
  const { error } = await client.POST("/api/database/{id}/sync_schema", {
    params: { path: { id } },
  } as any);
  if (error) throw new Error(`Sync database schema failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const notifyDatabase = async (client: MetabaseClient, id: number) => {
  const { error } = await client.POST("/api/notify/db/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Notify database failed: ${JSON.stringify(error)}`);
  return { success: true };
};
