import { z } from "zod";

export const configSchema = z
  .object({
    metabaseUrl: z.string().url(),
    apiKey: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    readOnly: z.boolean().default(false),
  })
  .refine(
    (c) => c.apiKey || (c.email && c.password),
    "Either METABASE_API_KEY or METABASE_EMAIL + METABASE_PASSWORD must be set"
  );

export type Config = z.infer<typeof configSchema>;

export const loadConfig = (): Config => {
  const raw = {
    metabaseUrl: process.env.METABASE_URL?.replace(/\/+$/, ""),
    apiKey: process.env.METABASE_API_KEY,
    email: process.env.METABASE_EMAIL,
    password: process.env.METABASE_PASSWORD,
    readOnly: process.env.METABASE_READ_ONLY_MODE === "true",
  };

  const result = configSchema.safeParse(raw);
  if (!result.success) {
    const errors = result.error.issues.map((i) => i.message).join(", ");
    console.error(`Configuration error: ${errors}`);
    process.exit(1);
  }

  return result.data;
};
