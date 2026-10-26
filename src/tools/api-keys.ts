import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { listApiKeys, createApiKey, updateApiKey, regenerateApiKey, deleteApiKey } from "../services/api-keys.js";

const text = (result: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(result) }] });

export const registerApiKeyTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool(
    "list_api_keys",
    "List Metabase API keys (masked) with the group each one acts as. Admin only.",
    {},
    async () => text(await listApiKeys(client))
  );

  if (!config.readOnly) {
    server.tool(
      "create_api_key",
      "Create an API key that acts with the permissions of one group. The full key (unmasked_key) is returned only once: store it right away. Admin only.",
      {
        name: z.string().describe("Key name, e.g. 'etl-pipeline'"),
        group_id: z.number().describe("Group whose permissions the key gets (see list_groups). Note: every key is also in All Users."),
      },
      async (params) => text(await createApiKey(client, params))
    );

    server.tool(
      "update_api_key",
      "Rename an API key or move it to another group. Admin only.",
      {
        id: z.number().describe("API key ID"),
        name: z.string().optional().describe("New name"),
        group_id: z.number().optional().describe("New group ID"),
      },
      async ({ id, ...params }) => text(await updateApiKey(client, id, params))
    );

    server.tool(
      "regenerate_api_key",
      "Replace an API key's secret. The old key stops working immediately; the new one (unmasked_key) is shown only once. Admin only.",
      { id: z.number().describe("API key ID") },
      async ({ id }) => text(await regenerateApiKey(client, id))
    );

    server.tool(
      "delete_api_key",
      "Delete an API key; anything using it loses access immediately. Admin only.",
      { id: z.number().describe("API key ID") },
      async ({ id }) => text(await deleteApiKey(client, id))
    );
  }
};
