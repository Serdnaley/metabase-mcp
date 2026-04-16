import type { MetabaseClient } from "../client.js";

export const createModerationReview = async (
  client: MetabaseClient,
  params: {
    moderated_item_id: number;
    moderated_item_type: "card" | "dashboard";
    status: "verified" | null;
  }
) => {
  const { data, error } = await (client as any).POST("/api/moderation-review", {
    body: {
      moderated_item_id: params.moderated_item_id,
      moderated_item_type: params.moderated_item_type,
      status: params.status,
    },
  });
  if (error) throw new Error(`Create moderation review failed: ${JSON.stringify(error)}`);
  return data;
};
