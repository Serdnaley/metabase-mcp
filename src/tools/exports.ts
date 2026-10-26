import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { exportCardQuery, exportQuery, exportDashboardPdf, DEFAULT_MAX_INLINE_CHARS } from "../services/exports.js";

const text = (result: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
});

const outputInputs = {
  output_path: z
    .string()
    .optional()
    .describe("Absolute path on the MCP server's machine to save the file to. Required for xlsx/pdf; for csv/json omit it to get the content inline."),
  overwrite: z.boolean().optional().describe("Replace output_path if it exists (default false)"),
  max_inline_chars: z
    .number()
    .optional()
    .describe(`Max characters returned inline for csv/json (default ${DEFAULT_MAX_INLINE_CHARS}); longer output is truncated`),
};

const formatSchema = z.enum(["csv", "json", "xlsx"]).describe("File format");

// Exports only read from Metabase, so they stay available in read-only mode.
// They can write local files (output_path), never over an existing one unless asked.
export const registerExportTools = (server: McpServer, client: MetabaseClient, _config: Config) => {
  server.tool(
    "export_card_query",
    "Export a saved question's full results as csv, json or xlsx (all rows, unlike execute_card_query's 2000-row cap)",
    {
      card_id: z.number().describe("Card ID"),
      format: formatSchema,
      parameter_values: z.record(z.string(), z.unknown()).optional().describe("Template tag values, as for execute_card_query"),
      format_rows: z.boolean().optional().describe("Apply Metabase column formatting (default false: raw values)"),
      ...outputInputs,
    },
    async ({ card_id, ...params }) => text(await exportCardQuery(client, card_id, params))
  );

  server.tool(
    "export_query",
    "Export an ad-hoc query's results as csv, json or xlsx. WARNING: the SQL is sent as-is; this server does not block INSERT/UPDATE/DELETE/DDL. Whether it can change data depends only on the Metabase API key's permissions and the database user's grants.",
    {
      query: z.record(z.string(), z.unknown()).describe("dataset_query, e.g. { database: 1, type: 'native', native: { query: 'SELECT ...' } }"),
      format: formatSchema,
      format_rows: z.boolean().optional().describe("Apply Metabase column formatting (default false)"),
      ...outputInputs,
    },
    async (params) => text(await exportQuery(client, params))
  );

  server.tool(
    "export_dashboard_pdf",
    "Render a dashboard to PDF on the Metabase server and save it to output_path. Metabase 0.64+.",
    {
      dashboard_id: z.number().describe("Dashboard ID"),
      output_path: z.string().describe("Absolute path to save the PDF to"),
      overwrite: z.boolean().optional().describe("Replace output_path if it exists (default false)"),
      paper_size: z.enum(["a4", "letter"]).optional().describe("Paper size (default a4)"),
      parameters: z
        .array(z.record(z.string(), z.unknown()))
        .optional()
        .describe("Dashboard filter values, e.g. [{ id: '<parameter id>', value: ['Widget'] }]"),
    },
    async ({ dashboard_id, ...params }) => text(await exportDashboardPdf(client, dashboard_id, params))
  );
};
