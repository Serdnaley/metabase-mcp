import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { resultLimits } from "../config.js";
import { resultShapeInputs, shapeQueryResult } from "../results.js";
import {
  listExplorationDimensions,
  listMyExplorations,
  getExploration,
  getExplorationQueryResult,
  createExploration,
  updateExploration,
  deleteExploration,
  restartExplorationThread,
  cancelExplorationThread,
} from "../services/explorations.js";

const text = (result: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(result) }] });

const waitInput = z
  .number()
  .int()
  .min(0)
  .max(120)
  .optional()
  .describe("Seconds to wait for planning and queries to finish (default 30, 0 = return at once)");

export const registerExplorationTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool(
    "list_exploration_dimensions",
    "Metrics that explorations can use, each with the dimensions it can be broken down by (id, name, type, table). Pass these ids to create_exploration. Metabase 0.65+.",
    { q: z.string().optional().describe("Case-insensitive filter on metric and dimension names") },
    async ({ q }) => text(await listExplorationDimensions(client, { q }))
  );

  server.tool(
    "list_my_explorations",
    "Explorations the current user created or edited, most recently touched first. Metabase 0.65+.",
    {
      limit: z.number().int().positive().max(200).optional().describe("Page size (default 50)"),
      offset: z.number().int().min(0).optional().describe("Skip this many explorations"),
    },
    async (params) => text(await listMyExplorations(client, params))
  );

  server.tool(
    "get_exploration",
    "One exploration: its threads, pages (one per metric × dimension × chart variant) and generated queries with status and row counts. Use get_exploration_query_result for the rows. Metabase 0.65+.",
    { id: z.number().describe("Exploration ID") },
    async ({ id }) => text(await getExploration(client, id))
  );

  server.tool(
    "get_exploration_query_result",
    "Rows of one finished exploration query (query ids come from get_exploration), as compact columns + rows. Metabase 0.65+.",
    { query_id: z.number().describe("Exploration query ID"), ...resultShapeInputs },
    async ({ query_id, max_rows, offset, verbose }) => {
      const result = await getExplorationQueryResult(client, query_id);
      return text(shapeQueryResult(result, resultLimits(config), { max_rows, offset, verbose }));
    }
  );

  if (!config.readOnly) {
    server.tool(
      "create_exploration",
      "Explore metrics across dimensions: Metabase plans and runs one query per eligible metric × dimension × chart variant (trend, top values + other, by segment...) and saves them with a Summary document. Get metric and dimension ids from list_exploration_dimensions; each dimension must apply to at least one chosen metric. Waits for the queries to finish (wait_seconds). Works on every tier, no AI provider needed. Metabase 0.65+.",
      {
        name: z.string().min(1).max(254).describe("Exploration name"),
        metric_ids: z.array(z.number()).min(1).describe("Metric card IDs"),
        dimension_ids: z.array(z.string()).min(1).describe("Dimension IDs (UUIDs) from list_exploration_dimensions"),
        description: z.string().optional().describe("Description"),
        collection_id: z.number().optional().describe("Collection to save in (default: root)"),
        prompt: z.string().optional().describe("Research question to record with the exploration"),
        timeline_ids: z.array(z.number()).optional().describe("Timelines whose events to overlay"),
        wait_seconds: waitInput,
      },
      async (params) => text(await createExploration(client, params))
    );

    server.tool(
      "update_exploration",
      "Rename an exploration, move it to another collection, or archive/unarchive it. Metabase 0.65+.",
      {
        id: z.number().describe("Exploration ID"),
        name: z.string().min(1).max(254).optional().describe("New name"),
        collection_id: z.number().nullable().optional().describe("Target collection (null = root)"),
        archived: z.boolean().optional().describe("Archive (true) or restore (false)"),
      },
      async ({ id, ...params }) => text(await updateExploration(client, id, params))
    );

    server.tool(
      "delete_exploration",
      "Permanently delete an exploration with its threads, queries and Summary document. To keep it recoverable, archive it with update_exploration instead. Metabase 0.65+.",
      { id: z.number().describe("Exploration ID") },
      async ({ id }) => text(await deleteExploration(client, id))
    );

    server.tool(
      "restart_exploration_thread",
      "Re-run a finished (completed, failed or canceled) exploration thread with the same metrics and dimensions, e.g. after the data changed. Metabase 0.65+.",
      { thread_id: z.number().describe("Thread ID from get_exploration"), wait_seconds: waitInput },
      async ({ thread_id, wait_seconds }) => text(await restartExplorationThread(client, thread_id, wait_seconds))
    );

    server.tool(
      "cancel_exploration_thread",
      "Stop a running exploration thread; its pending queries are marked canceled. Metabase 0.65+.",
      { thread_id: z.number().describe("Thread ID from get_exploration") },
      async ({ thread_id }) => text(await cancelExplorationThread(client, thread_id))
    );
  }
};
