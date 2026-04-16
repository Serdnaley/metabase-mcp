import type { MetabaseClient } from "../client.js";

export const listBookmarks = async (client: MetabaseClient) => {
  const { data, error } = await (client as any).GET("/api/bookmark", {});
  if (error) throw new Error(`List bookmarks failed: ${JSON.stringify(error)}`);
  return data;
};

export const createBookmark = async (
  client: MetabaseClient,
  params: { type: "card" | "dashboard" | "collection"; item_id: number }
) => {
  const { data, error } = await (client as any).POST(`/api/bookmark/${params.type}/${params.item_id}`, {});
  if (error) throw new Error(`Create bookmark failed: ${JSON.stringify(error)}`);
  return data ?? { success: true };
};

export const deleteBookmark = async (
  client: MetabaseClient,
  params: { type: "card" | "dashboard" | "collection"; item_id: number }
) => {
  const { error } = await (client as any).DELETE(`/api/bookmark/${params.type}/${params.item_id}`, {});
  if (error) throw new Error(`Delete bookmark failed: ${JSON.stringify(error)}`);
  return { success: true };
};
