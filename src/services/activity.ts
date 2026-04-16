import type { MetabaseClient } from "../client.js";

export const getActivity = async (client: MetabaseClient) => {
  const { data, error } = await (client as any).GET("/api/activity", {});
  if (error) throw new Error(`Get activity failed: ${JSON.stringify(error)}`);
  return data;
};

export const listTasks = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/task", {} as any);
  if (error) throw new Error(`List tasks failed: ${JSON.stringify(error)}`);
  return data;
};

export const getTask = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/task/{id}", {
    params: { path: { id } },
  } as any);
  if (error) throw new Error(`Get task failed: ${JSON.stringify(error)}`);
  return data;
};
