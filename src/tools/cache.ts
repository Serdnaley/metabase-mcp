import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { invalidateCache, updateCacheConfig } from "../services/cache.js";

export const registerCacheTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  if (!config.readOnly) {
    server.tool(
      "invalidate_cache",
      "Invalidate cached query results",
      {
        database: z.number().optional().describe("Database ID to invalidate"),
        dashboard: z.number().optional().describe("Dashboard ID to invalidate"),
        card: z.number().optional().describe("Card ID to invalidate"),
      },
      async (params) => {
        const result = await invalidateCache(client, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "update_cache_config",
      "Update cache strategy for a model (database, dashboard, or card)",
      {
        model: z.string().describe("Cache target type: 'root', 'database', 'dashboard', or 'question'"),
        model_id: z.number().describe("ID of the target (0 for root)"),
        strategy: z.record(z.string(), z.unknown()).describe(
          "Cache strategy, e.g. { type: 'duration', duration: 3600, unit: 'seconds' } or { type: 'schedule', schedule: 'cron expression' }"
        ),
      },
      async (params) => {
        const result = await updateCacheConfig(client, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );
  }
};
