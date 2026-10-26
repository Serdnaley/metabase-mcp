import { z } from "zod";

export const configSchema = z
  .object({
    metabaseUrl: z.string().url(),
    apiKey: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    readOnly: z.boolean().default(false),
    customHeaders: z.record(z.string(), z.string()).optional(),
  })
  .refine(
    (c) => c.apiKey || (c.email && c.password),
    "Either METABASE_API_KEY or METABASE_EMAIL + METABASE_PASSWORD must be set"
  );

export type Config = z.infer<typeof configSchema>;

/**
 * Parses METABASE_CUSTOM_HEADERS: either a JSON object
 * (`{"CF-Access-Client-Id": "abc"}`) or `Name: value` pairs separated by
 * newlines or `;`. Throws on anything else so a typo fails at startup
 * instead of silently dropping a header.
 */
export const parseCustomHeaders = (
  raw: string | undefined
): Record<string, string> => {
  if (!raw || !raw.trim()) return {};
  const text = raw.trim();
  const headers: Record<string, string> = {};

  if (text.startsWith("{") || text.startsWith("[")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("METABASE_CUSTOM_HEADERS is not valid JSON");
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("METABASE_CUSTOM_HEADERS must be a JSON object");
    }
    for (const [name, value] of Object.entries(parsed)) {
      if (typeof value !== "string") {
        throw new Error(`METABASE_CUSTOM_HEADERS: value of "${name}" must be a string`);
      }
      headers[name.trim()] = value;
    }
  } else {
    for (const line of text.split(/[\n;]/)) {
      if (!line.trim()) continue;
      const idx = line.indexOf(":");
      if (idx <= 0) {
        throw new Error(`METABASE_CUSTOM_HEADERS: expected "Name: value", got "${line.trim()}"`);
      }
      headers[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }

  for (const name of Object.keys(headers)) {
    if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name)) {
      throw new Error(`METABASE_CUSTOM_HEADERS: invalid header name "${name}"`);
    }
  }
  return headers;
};

/** Unset and empty env vars are the same thing (bundle hosts pass "" for blank optional fields). */
const envValue = (name: string): string | undefined => {
  const v = process.env[name];
  return v !== undefined && v.trim() !== "" ? v : undefined;
};

export const loadConfig = (): Config => {
  let customHeaders: Record<string, string>;
  try {
    customHeaders = parseCustomHeaders(process.env.METABASE_CUSTOM_HEADERS);
  } catch (err) {
    console.error(`Configuration error: ${(err as Error).message}`);
    process.exit(1);
  }

  const raw = {
    metabaseUrl: envValue("METABASE_URL")?.replace(/\/+$/, ""),
    apiKey: envValue("METABASE_API_KEY"),
    email: envValue("METABASE_EMAIL"),
    password: envValue("METABASE_PASSWORD"),
    readOnly: process.env.METABASE_READ_ONLY_MODE === "true",
    customHeaders,
  };

  const result = configSchema.safeParse(raw);
  if (!result.success) {
    const errors = result.error.issues.map((i) => i.message).join(", ");
    console.error(`Configuration error: ${errors}`);
    process.exit(1);
  }

  return result.data;
};
