import type { MetabaseClient } from "../client.js";

export const listSettings = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/setting", {} as any);
  if (error) throw new Error(`List settings failed: ${JSON.stringify(error)}`);
  return data;
};

export const getSetting = async (client: MetabaseClient, key: string) => {
  // The /api/setting/{key} endpoint returns plain text in some Metabase versions,
  // so we use parseAs: "text" to avoid a JSON parse error and then try to parse
  // the result ourselves.
  const res = await (client as any).GET("/api/setting/{key}", {
    params: { path: { key } },
    parseAs: "text",
  });
  if (res.error) throw new Error(`Get setting failed: ${JSON.stringify(res.error)}`);
  const raw: unknown = res.data;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
};

export const updateSetting = async (client: MetabaseClient, key: string, value: unknown) => {
  // Same plain-text response handling as getSetting.
  const res = await (client as any).PUT("/api/setting/{key}", {
    params: { path: { key } },
    body: { value } as any,
    parseAs: "text",
  });
  if (res.error) throw new Error(`Update setting failed: ${JSON.stringify(res.error)}`);
  const raw: unknown = res.data;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
};
