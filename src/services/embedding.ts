import { createHmac } from "node:crypto";
import type { MetabaseClient } from "../client.js";
import { apiError } from "./version.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyClient = (client: MetabaseClient): any => client;

/** GET /api/setting/:key answers text/plain for strings, JSON otherwise. */
const getSetting = async (client: MetabaseClient, key: string): Promise<unknown> => {
  const { data, error } = await anyClient(client).GET("/api/setting/{key}", {
    params: { path: { key } },
    parseAs: "text",
  });
  if (error) throw await apiError(client, `Get setting ${key}`, error);
  if (typeof data !== "string" || data === "") return null;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

const putSetting = async (client: MetabaseClient, key: string, value: unknown) => {
  const { error } = await anyClient(client).PUT("/api/setting/{key}", { params: { path: { key } }, body: { value } });
  if (error) throw await apiError(client, `Update setting ${key}`, error);
};

const STATUS_KEYS = [
  "enable-embedding-static",
  "enable-embedding-interactive",
  "enable-embedding-sdk",
  "enable-embedding-simple",
  "enable-embedding",
  "embedding-app-origins-interactive",
  "embedding-app-origins-sdk",
  "embedding-app-origin",
];

/** Embedding settings, whether a signing key exists (never its value) and what is embeddable. */
export const getEmbeddingStatus = async (client: MetabaseClient) => {
  const { data, error } = await anyClient(client).GET("/api/setting", {});
  if (error) throw await apiError(client, "Get embedding status", error);
  const settings: Record<string, unknown> = {};
  let secretKeySet = false;
  for (const s of Array.isArray(data) ? data : []) {
    if (STATUS_KEYS.includes(s.key)) settings[s.key] = s.value ?? s.default ?? null;
    if (s.key === "embedding-secret-key") secretKeySet = s.value !== null && s.value !== undefined;
  }
  const embeddable = async (path: string) => {
    const r = await anyClient(client).GET(path, {});
    return Array.isArray(r.data) ? r.data.map((x: any) => ({ id: x.id, name: x.name })) : [];
  };
  return {
    settings,
    secret_key_set: secretKeySet,
    embeddable_cards: await embeddable("/api/card/embeddable"),
    embeddable_dashboards: await embeddable("/api/dashboard/embeddable"),
  };
};

/** Turn static (signed) embedding on or off for the instance. */
export const setStaticEmbedding = async (client: MetabaseClient, enabled: boolean) => {
  await putSetting(client, "enable-embedding-static", enabled);
  return getEmbeddingStatus(client);
};

export type EmbedResource = "card" | "dashboard";
export type EmbedParamMode = "enabled" | "locked" | "disabled";

/** Allow (or stop) static embedding of one card/dashboard and set how each parameter is exposed. */
export const setResourceEmbedding = async (
  client: MetabaseClient,
  resource: EmbedResource,
  id: number,
  params: { enabled: boolean; embedding_params?: Record<string, EmbedParamMode> }
) => {
  const body: Record<string, unknown> = { enable_embedding: params.enabled };
  if (params.embedding_params) body.embedding_params = params.embedding_params;
  const path = resource === "card" ? "/api/card/{id}" : "/api/dashboard/{id}";
  const { data, error } = await anyClient(client).PUT(path, { params: { path: { id } }, body });
  if (error) throw await apiError(client, `Update ${resource} embedding`, error);
  return { id: data?.id, name: data?.name, enable_embedding: data?.enable_embedding, embedding_params: data?.embedding_params };
};

const b64url = (input: string | Buffer) =>
  Buffer.from(input).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

/** HS256 JWT, the format Metabase static embedding expects. */
export const signEmbedToken = (payload: Record<string, unknown>, secret: string): string => {
  const head = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(createHmac("sha256", secret).update(`${head}.${body}`).digest());
  return `${head}.${body}.${sig}`;
};

/**
 * Signed iframe URL for a card/dashboard that has embedding enabled. Reads the instance's
 * embedding secret key (admin only) and signs locally; the key never leaves this process.
 */
export const createEmbedUrl = async (
  client: MetabaseClient,
  fallbackSiteUrl: string,
  params: {
    resource: EmbedResource;
    id: number;
    params?: Record<string, unknown>;
    expires_in_minutes?: number;
    bordered?: boolean;
    titled?: boolean;
    theme?: "light" | "night" | "transparent";
  }
) => {
  const secret = await getSetting(client, "embedding-secret-key");
  if (typeof secret !== "string" || !secret) {
    throw new Error("No embedding secret key: enable static embedding first (set_static_embedding)");
  }
  const site = ((await getSetting(client, "site-url").catch(() => null)) as string | null) || fallbackSiteUrl;
  const minutes = params.expires_in_minutes ?? 10;
  const exp = Math.round(Date.now() / 1000) + minutes * 60;
  // Metabase's token calls cards "question"
  const kind = params.resource === "card" ? "question" : "dashboard";
  const token = signEmbedToken({ resource: { [kind]: params.id }, params: params.params ?? {}, exp }, secret);
  const hash = [
    `bordered=${params.bordered ?? true}`,
    `titled=${params.titled ?? true}`,
    ...(params.theme && params.theme !== "light" ? [`theme=${params.theme}`] : []),
  ].join("&");
  return {
    url: `${String(site).replace(/\/+$/, "")}/embed/${kind}/${token}#${hash}`,
    expires_at: new Date(exp * 1000).toISOString(),
    note: "Anyone with this URL can view the resource until it expires. Locked parameters are fixed in the token.",
  };
};
