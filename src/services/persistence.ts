import type { MetabaseClient } from "../client.js";

export const persistModel = async (client: MetabaseClient, cardId: number) => {
  const { data, error } = await (client as any).POST("/api/persist/card/{id}", {
    params: { path: { id: cardId } },
  });
  if (error) throw new Error(`Persist model failed: ${JSON.stringify(error)}`);
  return data ?? { success: true };
};

export const unpersistModel = async (client: MetabaseClient, cardId: number) => {
  const { error } = await (client as any).DELETE("/api/persist/card/{id}", {
    params: { path: { id: cardId } },
  });
  if (error) throw new Error(`Unpersist model failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const refreshPersistedModel = async (client: MetabaseClient, cardId: number) => {
  const { data, error } = await (client as any).POST("/api/persist/card/{id}/refresh", {
    params: { path: { id: cardId } },
  });
  if (error) throw new Error(`Refresh persisted model failed: ${JSON.stringify(error)}`);
  return data ?? { success: true };
};
