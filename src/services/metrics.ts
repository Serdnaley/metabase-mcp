import type { MetabaseClient } from "../client.js";
import { createCard, getCard, listCards, updateCard } from "./cards.js";
import { apiError } from "./version.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyClient = (client: MetabaseClient): any => client;

// Metrics are cards with type "metric". Metabase 0.60+ adds a dedicated /api/metric
// API (list, run with breakouts/filters, metric math); 0.64 adds metric dimensions.

const isMissingEndpoint = (error: unknown) =>
  JSON.stringify(error ?? "").includes("API endpoint does not exist");

export const listMetrics = async (client: MetabaseClient) => {
  const { data, error } = await anyClient(client).GET("/api/metric", {});
  if (!error) return data;
  if (!isMissingEndpoint(error)) throw await apiError(client, "List metrics", error);
  // Older Metabase: metrics are only reachable as cards
  const cards = (await listCards(client)) as unknown as any[];
  return { data: (Array.isArray(cards) ? cards : []).filter((c) => c?.type === "metric") };
};

export const getMetric = async (client: MetabaseClient, id: number) => {
  const { data, error } = await anyClient(client).GET("/api/metric/{id}", { params: { path: { id } } });
  if (!error) return data;
  if (!isMissingEndpoint(error)) throw await apiError(client, "Get metric", error);
  const card = (await getCard(client, id)) as any;
  if (card?.type !== "metric") throw new Error(`Get metric failed: card ${id} is not a metric`);
  return card;
};

export const createMetric = async (
  client: MetabaseClient,
  params: {
    name: string;
    dataset_query: Record<string, unknown>;
    description?: string;
    collection_id?: number;
  }
) =>
  createCard(client, {
    name: params.name,
    dataset_query: params.dataset_query,
    display: "scalar",
    description: params.description,
    collection_id: params.collection_id,
    type: "metric",
  } as any);

export const updateMetric = async (
  client: MetabaseClient,
  id: number,
  params: {
    name?: string;
    dataset_query?: Record<string, unknown>;
    description?: string;
    collection_id?: number;
    archived?: boolean;
  }
) => updateCard(client, id, params as any);

// ── Running metrics (0.60+) ───────────────────────────────────────────────

export type MetricFilter = {
  dimension_id: string;
  operator: string;
  values?: unknown[];
};

export type MetricBreakout = { dimension_id: string; temporal_unit?: string };

export type RunMetricParams = {
  metric_id?: number;
  measure_id?: number;
  filters?: MetricFilter[];
  breakouts?: MetricBreakout[];
  definition?: Record<string, unknown>;
};

/**
 * Build a /api/metric/dataset definition from a single metric (or measure) plus
 * simple filters and breakouts. `definition` (raw, for metric math) wins if given.
 */
export const buildMetricDefinition = (params: RunMetricParams): Record<string, unknown> => {
  if (params.definition) return params.definition;
  const kind = params.metric_id !== undefined ? "metric" : "measure";
  const id = params.metric_id ?? params.measure_id;
  if (id === undefined) throw new Error("Run metric failed: pass metric_id, measure_id or definition");
  const uuid = "a";
  const definition: Record<string, unknown> = { expression: [kind, { "lib/uuid": uuid }, id] };
  if (params.filters?.length) {
    const clauses = params.filters.map((f) => [f.operator, {}, ["dimension", {}, f.dimension_id], ...(f.values ?? [])]);
    definition.filters = [{ "lib/uuid": uuid, filter: clauses.length === 1 ? clauses[0] : ["and", {}, ...clauses] }];
  }
  if (params.breakouts?.length) {
    definition.projections = [
      {
        type: kind,
        id,
        "lib/uuid": uuid,
        projection: params.breakouts.map((b) => [
          "dimension",
          b.temporal_unit ? { "temporal-unit": b.temporal_unit } : {},
          b.dimension_id,
        ]),
      },
    ];
  }
  return definition;
};

export const runMetric = async (client: MetabaseClient, params: RunMetricParams) => {
  const { data, error } = await anyClient(client).POST("/api/metric/dataset", {
    body: { definition: buildMetricDefinition(params) },
  });
  if (error) throw await apiError(client, "Run metric", error, 60);
  return data;
};

// ── Metric dimensions (0.64+) ─────────────────────────────────────────────

export const listMetricDimensions = async (client: MetabaseClient, id: number) => {
  const { data, error } = await anyClient(client).GET("/api/metric/{id}/dimension", {
    params: { path: { id } },
  });
  if (error) throw await apiError(client, "List metric dimensions", error, 64);
  // Compact view: the raw response repeats group metadata on every dimension
  const added = Array.isArray(data?.added) ? data.added : [];
  return added.map((d: any) => ({
    id: d.id,
    name: d.name,
    display_name: d.display_name,
    effective_type: d.effective_type,
    semantic_type: d.semantic_type,
    group: d.group?.display_name,
    has_field_values: d.has_field_values,
  }));
};

export const getMetricDimensionValues = async (
  client: MetabaseClient,
  id: number,
  dimensionId: string,
  query?: string
) => {
  const path = query
    ? "/api/metric/{id}/dimension/{dimension-key}/search"
    : "/api/metric/{id}/dimension/{dimension-key}/values";
  const { data, error } = await anyClient(client).GET(path, {
    params: { path: { id, "dimension-key": dimensionId }, ...(query ? { query: { query } } : {}) },
  });
  if (error) throw await apiError(client, "Get metric dimension values", error, 64);
  return data;
};
