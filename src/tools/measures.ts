import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { listMeasures, getMeasure, createMeasure, updateMeasure } from "../services/measures.js";

const text = (result: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
});

const definitionSchema = z
  .record(z.string(), z.unknown())
  .describe(
    "Aggregation defining the measure, e.g. { aggregation: [['sum', ['field', 5, null]]] }, or a full query ({ database, type: 'query', query: { 'source-table', aggregation } })"
  );

export const registerMeasureTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool(
    "list_measures",
    "List measures: reusable, table-scoped aggregations (e.g. 'Revenue = sum of Total')",
    {},
    async () => text(await listMeasures(client))
  );

  server.tool(
    "get_measure",
    "Get a measure by ID",
    { id: z.number().describe("Measure ID") },
    async ({ id }) => text(await getMeasure(client, id))
  );

  if (!config.readOnly) {
    server.tool(
      "create_measure",
      "Create a measure on a table. Run it with run_metric (measure_id).",
      {
        name: z.string().describe("Measure name"),
        table_id: z.number().describe("Table the measure aggregates"),
        definition: definitionSchema,
        description: z.string().optional().describe("What the measure means"),
      },
      async (params) => text(await createMeasure(client, params))
    );

    server.tool(
      "update_measure",
      "Update a measure; archived: true archives it",
      {
        id: z.number().describe("Measure ID"),
        revision_message: z.string().describe("Audit message describing the change"),
        name: z.string().optional().describe("New name"),
        definition: definitionSchema.optional(),
        description: z.string().optional().describe("New description"),
        archived: z.boolean().optional().describe("Archive (true) or restore (false)"),
      },
      async ({ id, ...params }) => text(await updateMeasure(client, id, params))
    );
  }
};
