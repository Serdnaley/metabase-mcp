import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { getEmbeddingStatus, setStaticEmbedding, setResourceEmbedding, createEmbedUrl } from "../services/embedding.js";

const text = (result: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(result) }] });
const resource = z.enum(["card", "dashboard"]).describe("What to embed");

export const registerEmbeddingTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool(
    "get_embedding_status",
    "Embedding settings (static / interactive / SDK), whether a signing key exists (never its value), and which cards and dashboards are embeddable. Admin only.",
    {},
    async () => text(await getEmbeddingStatus(client))
  );

  server.tool(
    "create_embed_url",
    "Create a signed static-embedding iframe URL for a card or dashboard that has embedding enabled. Signed locally with the instance's embedding secret key; the key is never returned. Admin only.",
    {
      resource,
      id: z.number().describe("Card or dashboard ID"),
      params: z.record(z.string(), z.unknown()).optional().describe("Values for locked parameters, by slug, e.g. { category: 'Widget' }"),
      expires_in_minutes: z.number().int().positive().max(60 * 24 * 30).optional().describe("Token lifetime (default 10)"),
      bordered: z.boolean().optional().describe("Show a border (default true)"),
      titled: z.boolean().optional().describe("Show the title (default true)"),
      theme: z.enum(["light", "night", "transparent"]).optional().describe("Color theme"),
    },
    async (params) => text(await createEmbedUrl(client, config.metabaseUrl, params))
  );

  if (!config.readOnly) {
    server.tool(
      "set_static_embedding",
      "Turn static (signed) embedding on or off for the whole instance. Turning it off breaks existing embeds. Admin only.",
      { enabled: z.boolean().describe("true to enable, false to disable") },
      async ({ enabled }) => text(await setStaticEmbedding(client, enabled))
    );

    server.tool(
      "set_resource_embedding",
      "Allow or stop static embedding of one card or dashboard, and choose per parameter whether embedders may change it (enabled), must set it in the token (locked) or never see it (disabled). Admin only.",
      {
        resource,
        id: z.number().describe("Card or dashboard ID"),
        enabled: z.boolean().describe("Allow embedding"),
        embedding_params: z
          .record(z.string(), z.enum(["enabled", "locked", "disabled"]))
          .optional()
          .describe("Per parameter slug: 'enabled' | 'locked' | 'disabled'"),
      },
      async ({ resource, id, ...params }) => text(await setResourceEmbedding(client, resource, id, params))
    );
  }
};
