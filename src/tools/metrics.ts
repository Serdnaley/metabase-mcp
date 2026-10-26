import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  listMetrics,
  getMetric,
  createMetric,
  updateMetric,
  runMetric,
  listMetricDimensions,
  getMetricDimensionValues,
} from "../services/metrics.js";

const text = (result: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
});

const filterSchema = z.object({
  dimension_id: z.string().describe("Dimension ID from list_metric_dimensions"),
  operator: z
    .string()
    .describe("Filter operator: '=', '!=', '>', '>=', '<', '<=', 'between', 'contains', 'does-not-contain', 'starts-with', 'ends-with', 'is-null', 'not-null', 'is-empty', 'not-empty', 'time-interval'"),
  values: z
    .array(z.unknown())
    .optional()
    .describe("Operator arguments, e.g. ['Widget'] for '=', [10, 20] for 'between', [-30, 'day'] for 'time-interval'"),
});

const breakoutSchema = z.object({
  dimension_id: z.string().describe("Dimension ID from list_metric_dimensions"),
  temporal_unit: z
    .string()
    .optional()
    .describe("For date dimensions: 'day', 'week', 'month', 'quarter', 'year', ..."),
});

export const registerMetricTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool(
    "list_metrics",
    "List metrics: the curated, governed numbers defined in Metabase (e.g. Revenue, Number of Orders)",
    {},
    async () => text(await listMetrics(client))
  );

  server.tool(
    "get_metric",
    "Get a metric's definition (Metabase 0.64+ also returns its dimensions)",
    { id: z.number().describe("Metric (card) ID") },
    async ({ id }) => text(await getMetric(client, id))
  );

  server.tool(
    "run_metric",
    "Compute a metric (or measure) with optional filters and breakouts, without writing a query. Get dimension IDs from list_metric_dimensions. For metric math pass a raw definition, e.g. { expression: ['/', {}, ['metric', {'lib/uuid': 'a'}, 1], ['metric', {'lib/uuid': 'b'}, 2]] }. Metabase 0.60+.",
    {
      metric_id: z.number().optional().describe("Metric ID to compute"),
      measure_id: z.number().optional().describe("Measure ID to compute (instead of a metric)"),
      filters: z.array(filterSchema).optional().describe("Filters on the metric's dimensions (combined with AND)"),
      breakouts: z.array(breakoutSchema).optional().describe("Group the result by these dimensions"),
      definition: z
        .record(z.string(), z.unknown())
        .optional()
        .describe("Raw /api/metric/dataset definition (expression, filters, projections); overrides the other inputs"),
    },
    async (params) => text(await runMetric(client, params))
  );

  server.tool(
    "list_metric_dimensions",
    "List the dimensions (columns) a metric can be filtered or broken out by, with their IDs. Metabase 0.64+.",
    { id: z.number().describe("Metric ID") },
    async ({ id }) => text(await listMetricDimensions(client, id))
  );

  server.tool(
    "get_metric_dimension_values",
    "Get the distinct values of a metric dimension, optionally searching them. Useful before filtering. Metabase 0.64+.",
    {
      id: z.number().describe("Metric ID"),
      dimension_id: z.string().describe("Dimension ID from list_metric_dimensions"),
      query: z.string().optional().describe("Search text; omit to list values"),
    },
    async ({ id, dimension_id, query }) => text(await getMetricDimensionValues(client, id, dimension_id, query))
  );

  if (!config.readOnly) {
    server.tool(
      "create_metric",
      "Create a metric: a saved aggregation others can reuse. dataset_query must aggregate exactly once, e.g. { database: 1, type: 'query', query: { 'source-table': 2, aggregation: [['sum', ['field', 5, null]]] } }",
      {
        name: z.string().describe("Metric name"),
        dataset_query: z.record(z.string(), z.unknown()).describe("Query with a single aggregation (legacy MBQL or MBQL 5)"),
        description: z.string().optional().describe("What the metric means"),
        collection_id: z.number().optional().describe("Collection to save it in"),
      },
      async (params) => text(await createMetric(client, params))
    );

    server.tool(
      "update_metric",
      "Update a metric's name, description, definition or collection; archived: true archives it",
      {
        id: z.number().describe("Metric ID"),
        name: z.string().optional().describe("New name"),
        dataset_query: z.record(z.string(), z.unknown()).optional().describe("New definition (single aggregation)"),
        description: z.string().optional().describe("New description"),
        collection_id: z.number().optional().describe("Move to collection"),
        archived: z.boolean().optional().describe("Archive (true) or restore (false)"),
      },
      async ({ id, ...params }) => text(await updateMetric(client, id, params))
    );
  }
};
