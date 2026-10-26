import type { MetabaseClient } from "../client.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyClient = (client: MetabaseClient): any => client;

export type MetabaseVersion = { tag: string; major: number; minor: number };

const cache = new WeakMap<MetabaseClient, Promise<MetabaseVersion | null>>();

/** Parse "v0.64.3.4" / "v1.64.3" into { major: 64, minor: 3 } (the 0.x / 1.x prefix is OSS vs EE). */
export const parseVersionTag = (tag: string): MetabaseVersion | null => {
  const m = /^v?\d+\.(\d+)(?:\.(\d+))?/.exec(tag);
  if (!m) return null;
  return { tag, major: Number(m[1]), minor: Number(m[2] ?? 0) };
};

/** Metabase version of the connected instance (cached per client); null if it can't be read. */
export const getMetabaseVersion = (client: MetabaseClient): Promise<MetabaseVersion | null> => {
  let pending = cache.get(client);
  if (!pending) {
    pending = (async () => {
      const { data } = await anyClient(client).GET("/api/session/properties", {});
      const tag = data?.version?.tag;
      return typeof tag === "string" ? parseVersionTag(tag) : null;
    })().catch(() => null);
    cache.set(client, pending);
  }
  return pending;
};

const isMissingEndpoint = (error: unknown) =>
  typeof error === "string"
    ? /API endpoint does not exist/i.test(error)
    : JSON.stringify(error ?? "").includes("API endpoint does not exist");

/**
 * Error for a failed call. If the endpoint is missing and the instance is older than
 * `minMajor`, say so plainly instead of returning Metabase's generic 404 text.
 */
export const apiError = async (
  client: MetabaseClient,
  action: string,
  error: unknown,
  minMajor?: number
): Promise<Error> => {
  if (minMajor !== undefined && isMissingEndpoint(error)) {
    const version = await getMetabaseVersion(client);
    if (version && version.major < minMajor) {
      return new Error(
        `${action} failed: requires Metabase 0.${minMajor} or newer (connected instance is ${version.tag})`
      );
    }
  }
  return new Error(`${action} failed: ${JSON.stringify(error)}`);
};
