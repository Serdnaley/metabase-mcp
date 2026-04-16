import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { listSettings, getSetting, updateSetting } from "../services/settings.js";

export const registerSettingTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool(
    "list_settings",
    "List all Metabase instance settings",
    {},
    async () => {
      const result = await listSettings(client);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_setting",
    "Get a specific Metabase setting value",
    {
      key: z.string().describe("Setting key (e.g., 'site-name', 'enable-public-sharing')"),
    },
    async ({ key }) => {
      const result = await getSetting(client, key);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  if (!config.readOnly) {
    server.tool(
      "update_setting",
      "Update a Metabase setting value",
      {
        key: z.string().describe("Setting key"),
        value: z.unknown().describe("New setting value"),
      },
      async ({ key, value }) => {
        const result = await updateSetting(client, key, value);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );
  }
};
