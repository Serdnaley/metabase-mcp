import type { MetabaseClient } from "../client.js";

export const listUsers = async (client: MetabaseClient, params?: { query?: string }) => {
  const { data, error } = await client.GET("/api/user", {
    params: {
      query: {
        query: params?.query,
        include_deactivated: false,
      },
    },
  });
  if (error) throw new Error(`List users failed: ${JSON.stringify(error)}`);
  return data;
};

export const getUser = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/user/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Get user failed: ${JSON.stringify(error)}`);
  return data;
};

export const getCurrentUser = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/user/current");
  if (error) throw new Error(`Get current user failed: ${JSON.stringify(error)}`);
  return data;
};

export const createUser = async (
  client: MetabaseClient,
  params: { first_name?: string; last_name?: string; email: string; password?: string; group_ids?: number[] }
) => {
  const body: Record<string, unknown> = { email: params.email };
  if (params.first_name !== undefined) body.first_name = params.first_name;
  if (params.last_name !== undefined) body.last_name = params.last_name;
  if (params.group_ids !== undefined) {
    body.user_group_memberships = params.group_ids.map((id) => ({ id }));
  }

  const { data, error } = await client.POST("/api/user", {
    body: body as any,
  });
  if (error) throw new Error(`Create user failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateUser = async (
  client: MetabaseClient,
  id: number,
  params: { first_name?: string; last_name?: string; email?: string; locale?: string }
) => {
  const body: Record<string, unknown> = {};
  if (params.first_name !== undefined) body.first_name = params.first_name;
  if (params.last_name !== undefined) body.last_name = params.last_name;
  if (params.email !== undefined) body.email = params.email;
  if (params.locale !== undefined) body.locale = params.locale;

  const { data, error } = await client.PUT("/api/user/{id}", {
    params: { path: { id } },
    body: body as any,
  });
  if (error) throw new Error(`Update user failed: ${JSON.stringify(error)}`);
  return data;
};

export const deactivateUser = async (client: MetabaseClient, id: number) => {
  const { error } = await client.DELETE("/api/user/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Deactivate user failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const reactivateUser = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.PUT("/api/user/{id}/reactivate" as any, {
    params: { path: { id } },
  });
  if (error) throw new Error(`Reactivate user failed: ${JSON.stringify(error)}`);
  return data;
};

export const listGroups = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/permissions/group");
  if (error) throw new Error(`List groups failed: ${JSON.stringify(error)}`);
  return data;
};

export const createGroup = async (client: MetabaseClient, params: { name: string }) => {
  const { data, error } = await client.POST("/api/permissions/group", {
    body: { name: params.name },
  });
  if (error) throw new Error(`Create group failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateGroup = async (client: MetabaseClient, id: number, params: { name: string }) => {
  const { data, error } = await client.PUT("/api/permissions/group/{group-id}", {
    params: { path: { "group-id": id } },
    body: { name: params.name },
  });
  if (error) throw new Error(`Update group failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteGroup = async (client: MetabaseClient, id: number) => {
  const { error } = await client.DELETE("/api/permissions/group/{group-id}", {
    params: { path: { "group-id": id } },
  });
  if (error) throw new Error(`Delete group failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const addGroupMember = async (
  client: MetabaseClient,
  params: { group_id: number; user_id: number }
) => {
  const { data, error } = await client.POST("/api/permissions/membership", {
    body: {
      group_id: params.group_id,
      user_id: params.user_id,
      is_group_manager: false,
    },
  });
  if (error) throw new Error(`Add group member failed: ${JSON.stringify(error)}`);
  return data;
};

export const removeGroupMember = async (client: MetabaseClient, membershipId: number) => {
  const { error } = await client.DELETE("/api/permissions/membership/{id}", {
    params: { path: { id: membershipId } },
  });
  if (error) throw new Error(`Remove group member failed: ${JSON.stringify(error)}`);
  return { success: true };
};
