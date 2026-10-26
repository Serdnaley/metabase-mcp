import type { MetabaseClient } from "../client.js";

export type RecentsContext = "views" | "selections";

/** Recently viewed / selected items of the current user (replaces the removed /api/activity feed). */
export const getRecentItems = async (
  client: MetabaseClient,
  context: RecentsContext[] = ["views"]
) => {
  const { data, error } = await (client as any).GET("/api/activity/recents", {
    params: { query: { context } },
    querySerializer: { array: { style: "form", explode: true } },
  });
  if (error) throw new Error(`Get recent items failed: ${JSON.stringify(error)}`);
  return data;
};

/** Most popular dashboards, questions, tables etc. across the instance. */
export const getPopularItems = async (client: MetabaseClient) => {
  const { data, error } = await (client as any).GET("/api/activity/popular_items", {});
  if (error) throw new Error(`Get popular items failed: ${JSON.stringify(error)}`);
  return data;
};

/** Deprecated alias kept for get_activity: recent views + popular items. */
export const getActivity = async (client: MetabaseClient) => {
  const [recents, popular] = await Promise.all([getRecentItems(client), getPopularItems(client)]);
  return { ...(recents as object), ...(popular as object) };
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
