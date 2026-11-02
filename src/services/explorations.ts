import type { MetabaseClient } from "../client.js";
import { apiError } from "./version.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyClient = (client: MetabaseClient): any => client;

// Explorations (Metabase 0.65+, all tiers): pick metrics and dimensions, Metabase plans and
// runs one query per eligible (metric, dimension, chart variant) and groups them into pages.
// Planning is asynchronous: create returns at once, GET /api/exploration/:id fills in later.

const MIN_MAJOR = 65;

type CatalogDimension = {
  id: string;
  name: string;
  column?: string;
  type?: string;
  semantic_type?: string;
  table?: string;
};

type CatalogMetric = {
  id: number;
  name: string;
  description?: string;
  table_id?: number;
  dimension_ids: string[];
  dimension_mappings: unknown[];
};

/** Metrics usable in explorations plus their dimensions (raw catalog from /api/exploration/dimensions). */
const fetchCatalog = async (client: MetabaseClient, q?: string) => {
  const { data, error } = await anyClient(client).GET("/api/exploration/dimensions", {
    params: { query: q ? { q } : {} },
  });
  if (error) throw await apiError(client, "List exploration dimensions", error, MIN_MAJOR);
  const dimensions = new Map<string, CatalogDimension>();
  for (const group of data?.dimension_groups ?? []) {
    for (const d of group.dimensions ?? []) {
      dimensions.set(d.id, {
        id: d.id,
        name: d.display_name ?? d.name,
        column: d.name,
        type: d.effective_type ?? undefined,
        semantic_type: d.semantic_type ?? undefined,
        table: d.group?.display_name ?? undefined,
      });
    }
  }
  const metrics: CatalogMetric[] = (data?.metrics ?? []).map((m: any) => ({
    id: m.id,
    name: m.name,
    description: m.description ?? undefined,
    table_id: m.table_id ?? undefined,
    dimension_ids: m.dimension_ids ?? [],
    dimension_mappings: m.dimension_mappings ?? [],
  }));
  return { metrics, dimensions };
};

/** Metrics available to explorations, each with the dimensions it can be broken down by. */
export const listExplorationDimensions = async (client: MetabaseClient, params: { q?: string } = {}) => {
  const { metrics, dimensions } = await fetchCatalog(client, params.q);
  return {
    metrics: metrics.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      table_id: m.table_id,
      dimensions: m.dimension_ids.map((id) => dimensions.get(id) ?? { id, name: id }),
    })),
  };
};

const compactQuery = (q: any) => ({
  id: q.id,
  name: q.name,
  status: q.status,
  query_type: q.query_type,
  display: q.display,
  page_id: q.page_id,
  metric_card_id: q.card_id ?? undefined,
  dimension_id: q.dimension_id ?? undefined,
  segment_name: q.segment_name ?? undefined,
  row_count: q.row_count ?? undefined,
  error_message: q.error_message ?? undefined,
});

const compactThread = (t: any) => ({
  id: t.id,
  status: t.status,
  prompt: t.prompt ?? undefined,
  started_at: t.started_at,
  completed_at: t.completed_at ?? undefined,
  canceled_at: t.canceled_at ?? undefined,
  blocks: (t.blocks ?? []).map((b: any) => ({
    id: b.id,
    name: b.name,
    pages: (b.pages ?? []).map((p: any) => ({
      id: p.id,
      name: p.long_name ?? p.name,
      query_ids: p.query_ids,
      ...(p.starred ? { starred: true } : {}),
      ...(p.hidden ? { hidden: true } : {}),
    })),
  })),
  queries: (t.queries ?? []).map(compactQuery),
});

const compactExploration = (e: any) => ({
  id: e.id,
  name: e.name,
  description: e.description ?? undefined,
  collection_id: e.collection_id ?? null,
  archived: e.archived,
  summary_document_id: e.document?.id,
  created_at: e.created_at,
  updated_at: e.updated_at,
  threads: (e.threads ?? []).map(compactThread),
});

/** Explorations the current user created or edited, most recently touched first. */
export const listMyExplorations = async (client: MetabaseClient, params: { limit?: number; offset?: number } = {}) => {
  const { data, error } = await anyClient(client).GET("/api/exploration/mine", {
    params: { query: { limit: params.limit ?? 50, offset: params.offset ?? 0 } },
  });
  if (error) throw await apiError(client, "List explorations", error, MIN_MAJOR);
  return {
    total: data?.total,
    explorations: (data?.data ?? []).map((e: any) => ({
      id: e.id,
      name: e.name,
      description: e.description ?? undefined,
      collection_id: e.collection_id ?? null,
      updated_at: e.updated_at,
      last_touched_at: e.current_user_last_touched_at ?? undefined,
    })),
  };
};

const fetchExploration = async (client: MetabaseClient, id: number) => {
  const { data, error } = await anyClient(client).GET("/api/exploration/{id}", { params: { path: { id } } });
  if (error) throw await apiError(client, "Get exploration", error, MIN_MAJOR);
  return data;
};

/** One exploration with its threads, pages and generated queries (without result rows). */
export const getExploration = async (client: MetabaseClient, id: number) =>
  compactExploration(await fetchExploration(client, id));

const isSettled = (e: any) => (e?.threads ?? []).every((t: any) => t.completed_at || t.canceled_at);

const waitForPlan = async (client: MetabaseClient, id: number, waitSeconds: number) => {
  const deadline = Date.now() + waitSeconds * 1000;
  let e = await fetchExploration(client, id);
  while (!isSettled(e) && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 1000));
    e = await fetchExploration(client, id);
  }
  const out: Record<string, unknown> = compactExploration(e);
  if (!isSettled(e)) out.note = `Still running after ${waitSeconds}s; call get_exploration later.`;
  return out;
};

export type CreateExplorationParams = {
  name: string;
  metric_ids: number[];
  dimension_ids: string[];
  description?: string;
  collection_id?: number;
  prompt?: string;
  timeline_ids?: number[];
  /** Seconds to wait for planning and queries to finish (0 = return at once) */
  wait_seconds?: number;
};

/**
 * Create an exploration from metric card IDs and dimension IDs (see listExplorationDimensions).
 * Each metric is sent with its dimension mappings and each dimension with its display metadata,
 * as the Metabase UI does: without the mappings the planner finds no (metric, dimension) pair.
 */
export const createExploration = async (client: MetabaseClient, params: CreateExplorationParams) => {
  const { metrics, dimensions } = await fetchCatalog(client);
  const blockMetrics = params.metric_ids.map((id) => {
    const m = metrics.find((x) => x.id === id);
    if (!m) throw new Error(`Create exploration failed: card ${id} is not a metric available to explorations (see list_exploration_dimensions)`);
    return { card_id: id, dimension_mappings: m.dimension_mappings };
  });
  const blockDimensions = params.dimension_ids.map((id) => {
    const d = dimensions.get(id);
    if (!d) throw new Error(`Create exploration failed: unknown dimension ${id} (see list_exploration_dimensions)`);
    return { "dimension-id": id, "display-name": d.name, "effective-type": d.type ?? null, "semantic-type": d.semantic_type ?? null };
  });
  const unusable = blockDimensions.filter(
    (d) => !params.metric_ids.some((mid) => metrics.find((m) => m.id === mid)!.dimension_ids.includes(d["dimension-id"]))
  );
  if (unusable.length) {
    throw new Error(
      `Create exploration failed: dimension(s) ${unusable.map((d) => d["dimension-id"]).join(", ")} apply to none of the chosen metrics`
    );
  }
  const body: Record<string, unknown> = {
    name: params.name,
    blocks: [{ metrics: blockMetrics, dimensions: blockDimensions }],
  };
  if (params.description !== undefined) body.description = params.description;
  if (params.collection_id !== undefined) body.collection_id = params.collection_id;
  if (params.prompt !== undefined) body.prompt = params.prompt;
  if (params.timeline_ids !== undefined) body.timeline_ids = params.timeline_ids;
  const { data, error } = await anyClient(client).POST("/api/exploration", { body });
  if (error) throw await apiError(client, "Create exploration", error, MIN_MAJOR);
  const wait = Math.min(Math.max(params.wait_seconds ?? 30, 0), 120);
  if (wait === 0) return compactExploration(data);
  return waitForPlan(client, data.id, wait);
};

/** Result rows of one completed exploration query (raw dataset; callers shape it). */
export const getExplorationQueryResult = async (client: MetabaseClient, queryId: number) => {
  const { data, error, response } = await anyClient(client).GET("/api/exploration/query/{id}", {
    params: { path: { id: queryId }, query: { format: "api" } },
  });
  if (response?.status === 409) {
    return { status: "not_ready", note: "The query is still pending or failed; check its status with get_exploration.", detail: error };
  }
  if (error) throw await apiError(client, "Get exploration query result", error, MIN_MAJOR);
  return data;
};

export const updateExploration = async (
  client: MetabaseClient,
  id: number,
  params: { name?: string; collection_id?: number | null; archived?: boolean; collection_position?: number | null }
) => {
  const { data, error } = await anyClient(client).PUT("/api/exploration/{id}", {
    params: { path: { id } },
    body: params,
  });
  if (error) throw await apiError(client, "Update exploration", error, MIN_MAJOR);
  return compactExploration(data);
};

/** Hard delete (cascades to threads, queries and the Summary document). Archive with updateExploration instead to keep it. */
export const deleteExploration = async (client: MetabaseClient, id: number) => {
  const { error } = await anyClient(client).DELETE("/api/exploration/{id}", { params: { path: { id } } });
  if (error) throw await apiError(client, "Delete exploration", error, MIN_MAJOR);
  return { success: true, id };
};

/** Re-run a finished (completed, failed or canceled) thread with the same selections. */
export const restartExplorationThread = async (client: MetabaseClient, threadId: number, waitSeconds = 30) => {
  const { data, error } = await anyClient(client).POST("/api/exploration/thread/{thread-id}/restart", {
    params: { path: { "thread-id": threadId } },
  });
  if (error) throw await apiError(client, "Restart exploration thread", error, MIN_MAJOR);
  const wait = Math.min(Math.max(waitSeconds, 0), 120);
  return wait === 0 ? compactExploration(data) : waitForPlan(client, data.id, wait);
};

/** Stop a running thread; pending queries are marked canceled. */
export const cancelExplorationThread = async (client: MetabaseClient, threadId: number) => {
  const { data, error } = await anyClient(client).POST("/api/exploration/thread/{thread-id}/cancel", {
    params: { path: { "thread-id": threadId } },
  });
  if (error) throw await apiError(client, "Cancel exploration thread", error, MIN_MAJOR);
  return data;
};
