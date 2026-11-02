import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { ENTITY_TYPES, FINDING_KINDS, listContentFindings, dismissContentFindings } from "../services/content-diagnostics.js";

const text = (result: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(result) }] });

export const registerContentDiagnosticsTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool(
    "list_content_findings",
    "Content health findings from Metabase's background checkers, for cleanup: stale (unused for a long time), slow (slow queries or dashboards), duplicated (same name), imbalanced (empty, sparse or crowded collections and dashboards). Each finding has an id for dismiss_content_findings. Paid plans (Pro/Enterprise), Metabase 0.65+.",
    {
      kind: z.enum(FINDING_KINDS).describe("Which findings to list"),
      entity_types: z.array(z.enum(ENTITY_TYPES)).optional().describe("Only these entity types"),
      query: z.string().optional().describe("Only items whose name contains this text"),
      include_personal_collections: z.boolean().optional().describe("Include items in personal collections"),
      sort_column: z
        .string()
        .optional()
        .describe("Sort by: detected-at, entity-type, name, created-at, created-by, collection-name, or per kind last-active-at (stale), duration-ms (slow), duplicate-count (duplicated), content-count / finding-type (imbalanced)"),
      sort_direction: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
      threshold_days: z.number().int().positive().optional().describe("stale: inactive at least this many days"),
      min_duration_ms: z.number().int().positive().optional().describe("slow: slower than this"),
      min_duplicate_count: z.number().int().positive().optional().describe("duplicated: at least this many duplicates"),
      finding_types: z.array(z.enum(["empty", "sparse", "crowded"])).optional().describe("imbalanced: which checks"),
    },
    async ({ kind, ...q }) => text(await listContentFindings(client, kind, q))
  );

  if (!config.readOnly) {
    server.tool(
      "dismiss_content_findings",
      "Dismiss content findings by id (e.g. a stale dashboard that is meant to stay). Dismissal is global: the findings leave every user's lists. Paid plans, Metabase 0.65+.",
      { ids: z.array(z.number().int().positive()).min(1).max(500).describe("Finding IDs from list_content_findings") },
      async ({ ids }) => text(await dismissContentFindings(client, ids))
    );
  }
};
