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

const loginWithSession = async (
  baseUrl: string,
  email: string,
  password: string
): Promise<string> => {
  const res = await fetch(`${baseUrl}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

  if (config.apiKey) {
    client.use(createAuthMiddleware(config));
  } else if (config.email && config.password) {
    const token = await loginWithSession(
      config.metabaseUrl,
      config.email,
      config.password
    );
    client.use(createSessionMiddleware(token));
  }

  return client;
};
