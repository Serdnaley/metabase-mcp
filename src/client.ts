import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "../generated/metabase-api.js";
import type { Config } from "./config.js";

export type MetabaseClient = ReturnType<typeof createClient<paths>>;

const createAuthMiddleware = (config: Config): Middleware => ({
  async onRequest({ request }) {
    if (config.apiKey) {
      request.headers.set("X-API-Key", config.apiKey);
    }
    return request;
  },
});

/**
 * Sends METABASE_CUSTOM_HEADERS on every request (e.g. Cloudflare Access
 * service tokens). Registered before auth, so auth headers always win.
 */
const createCustomHeadersMiddleware = (
  headers: Record<string, string>
): Middleware => ({
  async onRequest({ request }) {
    for (const [name, value] of Object.entries(headers)) {
      request.headers.set(name, value);
    }
    return request;
  },
});

/**
 * Metabase error bodies often carry full Java stack traces ("trace", "via") —
 * tens of KB that flood the LLM context. Strip them, keep message/cause/errors.
 */
const STRIPPED_ERROR_KEYS = ["trace", "via", "stacktrace"];
const createErrorCompactionMiddleware = (): Middleware => ({
  async onResponse({ response }) {
    if (response.ok) return response;
    if (!response.headers.get("content-type")?.includes("application/json")) return response;
    const text = await response.clone().text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return response;
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) return response;
    const record = body as Record<string, unknown>;
    if (!STRIPPED_ERROR_KEYS.some((k) => k in record)) return response;
    for (const key of STRIPPED_ERROR_KEYS) delete record[key];
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    return new Response(JSON.stringify(record), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
});

const loginWithSession = async (
  baseUrl: string,
  email: string,
  password: string,
  customHeaders: Record<string, string> = {}
): Promise<string> => {
  const res = await fetch(`${baseUrl}/api/session`, {
    method: "POST",
    headers: { ...customHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Metabase login failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { id: string };
  return data.id;
};

const createSessionMiddleware = (sessionToken: string): Middleware => ({
  async onRequest({ request }) {
    request.headers.set("X-Metabase-Session", sessionToken);
    return request;
  },
});

export const createMetabaseClient = async (
  config: Config
): Promise<MetabaseClient> => {
  const client = createClient<paths>({ baseUrl: config.metabaseUrl });
  const customHeaders = config.customHeaders ?? {};
  client.use(createErrorCompactionMiddleware());

  if (Object.keys(customHeaders).length > 0) {
    client.use(createCustomHeadersMiddleware(customHeaders));
  }

  if (config.apiKey) {
    client.use(createAuthMiddleware(config));
  } else if (config.email && config.password) {
    const token = await loginWithSession(
      config.metabaseUrl,
      config.email,
      config.password,
      customHeaders
    );
    client.use(createSessionMiddleware(token));
  }

  return client;
};
