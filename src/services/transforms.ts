import type { MetabaseClient } from "../client.js";
import { apiError } from "./version.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyClient = (client: MetabaseClient): any => client;

// Transforms write the result of a query into a warehouse table (Metabase 0.59+).
// Self-hosted instances must enable them first (MB_TRANSFORMS_ENABLED=true or the
// `transforms-enabled` setting); the sample database cannot be a transform target.

const isMissingEndpoint = (error: unknown) =>
  JSON.stringify(error ?? "").includes("API endpoint does not exist");

const fail = (action: string, error: unknown) => {
  const text = JSON.stringify(error);
  const hint = /permissions to do that/i.test(text)
    ? " (transforms may be disabled: set MB_TRANSFORMS_ENABLED=true or the transforms-enabled setting)"
    : "";
  return new Error(`${action} failed: ${text}${hint}`);
};

export const listTransforms = async (
  client: MetabaseClient,
  params?: { database_id?: number; tag_ids?: number[] }
) => {
  const query: Record<string, unknown> = {};
  if (params?.database_id !== undefined) query["database-id"] = params.database_id;
  if (params?.tag_ids?.length) query["tag-ids"] = params.tag_ids;
  const { data, error } = await anyClient(client).GET("/api/transform", { params: { query } });
  if (error) throw fail("List transforms", error);
  return data;
};

export const getTransform = async (client: MetabaseClient, id: number) => {
  const { data, error } = await anyClient(client).GET("/api/transform/{id}", { params: { path: { id } } });
  if (error) throw fail("Get transform", error);
  return data;
};

export type TransformSourceInput = {
  /** Full transform source, e.g. { type: "query", query: <dataset_query> } — wins if given */
  source?: Record<string, unknown>;
  /** Shortcut: native SQL run against database_id */
  sql?: string;
  /** Shortcut: a full dataset_query (legacy or MBQL 5) */
  query?: Record<string, unknown>;
  database_id?: number;
};

export const buildTransformSource = (input: TransformSourceInput): Record<string, unknown> | undefined => {
  if (input.source) return input.source;
  if (input.query) return { type: "query", query: input.query };
  if (input.sql !== undefined) {
    if (input.database_id === undefined) throw new Error("database_id is required with sql");
    return { type: "query", query: { database: input.database_id, type: "native", native: { query: input.sql } } };
  }
  return undefined;
};

export const createTransform = async (
  client: MetabaseClient,
  params: TransformSourceInput & {
    name: string;
    target_table: string;
    target_schema?: string;
    description?: string;
    collection_id?: number;
    tag_ids?: number[];
  }
) => {
  const source = buildTransformSource(params);
  if (!source) throw new Error("Create transform failed: pass sql (+ database_id), query or source");
  const body: Record<string, unknown> = {
    name: params.name,
    source,
    target: { type: "table", schema: params.target_schema ?? null, name: params.target_table },
  };
  if (params.description !== undefined) body.description = params.description;
  if (params.collection_id !== undefined) body.collection_id = params.collection_id;
  if (params.tag_ids !== undefined) body.tag_ids = params.tag_ids;
  const { data, error } = await anyClient(client).POST("/api/transform", { body });
  if (error) throw fail("Create transform", error);
  return data;
};

export const updateTransform = async (
  client: MetabaseClient,
  id: number,
  params: TransformSourceInput & {
    name?: string;
    description?: string;
    target_table?: string;
    target_schema?: string;
    tag_ids?: number[];
  }
) => {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.description !== undefined) body.description = params.description;
  if (params.tag_ids !== undefined) body.tag_ids = params.tag_ids;
  const source = buildTransformSource(params);
  if (source) body.source = source;
  if (params.target_table !== undefined || params.target_schema !== undefined) {
    const current = (await getTransform(client, id)) as any;
    body.target = {
      type: "table",
      schema: params.target_schema ?? current?.target?.schema ?? null,
      name: params.target_table ?? current?.target?.name,
    };
  }
  const { data, error } = await anyClient(client).PUT("/api/transform/{id}", { params: { path: { id } }, body });
  if (error) throw fail("Update transform", error);
  return data;
};

export const deleteTransform = async (
  client: MetabaseClient,
  id: number,
  params?: { drop_table?: boolean }
) => {
  if (params?.drop_table) {
    const { error } = await anyClient(client).DELETE("/api/transform/{id}/table", { params: { path: { id } } });
    if (error) throw fail("Drop transform table", error);
  }
  const { error } = await anyClient(client).DELETE("/api/transform/{id}", { params: { path: { id } } });
  if (error) throw fail("Delete transform", error);
  return { success: true };
};

export const runTransform = async (client: MetabaseClient, id: number) => {
  const { data, error } = await anyClient(client).POST("/api/transform/{id}/run", { params: { path: { id } } });
  if (error) throw fail("Run transform", error);
  return data;
};

export const cancelTransformRun = async (client: MetabaseClient, id: number) => {
  const { error } = await anyClient(client).POST("/api/transform/{id}/cancel", { params: { path: { id } } });
  if (error) throw fail("Cancel transform run", error);
  return { success: true };
};

export const listTransformRuns = async (
  client: MetabaseClient,
  params?: { transform_ids?: number[]; statuses?: string[] }
) => {
  const query: Record<string, unknown> = {};
  if (params?.transform_ids?.length) query["transform-ids"] = params.transform_ids;
  if (params?.statuses?.length) query.statuses = params.statuses;
  // 0.64 renamed GET /api/transform/run to /api/transform/runs
  let res = await anyClient(client).GET("/api/transform/runs", { params: { query } });
  if (res.error && isMissingEndpoint(res.error)) {
    res = await anyClient(client).GET("/api/transform/run", { params: { query } });
  }
  if (res.error) throw fail("List transform runs", res.error);
  return res.data;
};

export const getTransformRun = async (client: MetabaseClient, runId: number) => {
  const { data, error } = await anyClient(client).GET("/api/transform/run/{run-id}", {
    params: { path: { "run-id": runId } },
  });
  if (error) throw fail("Get transform run", error);
  return data;
};

// ── Jobs: scheduled runs of every transform carrying one of the job's tags ──

export const listTransformJobs = async (client: MetabaseClient) => {
  const { data, error } = await anyClient(client).GET("/api/transform-job", {});
  if (error) throw fail("List transform jobs", error);
  return data;
};

export const createTransformJob = async (
  client: MetabaseClient,
  params: { name: string; schedule: string; tag_ids?: number[]; description?: string }
) => {
  const body: Record<string, unknown> = { name: params.name, schedule: params.schedule, tag_ids: params.tag_ids ?? [] };
  if (params.description !== undefined) body.description = params.description;
  const { data, error } = await anyClient(client).POST("/api/transform-job", { body });
  if (error) throw fail("Create transform job", error);
  return data;
};

export const runTransformJob = async (client: MetabaseClient, jobId: number) => {
  const { data, error } = await anyClient(client).POST("/api/transform-job/{job-id}/run", {
    params: { path: { "job-id": jobId } },
  });
  if (error) throw fail("Run transform job", error);
  return data;
};

export const deleteTransformJob = async (client: MetabaseClient, jobId: number) => {
  const { error } = await anyClient(client).DELETE("/api/transform-job/{job-id}", {
    params: { path: { "job-id": jobId } },
  });
  if (error) throw fail("Delete transform job", error);
  return { success: true };
};

export const listTransformTags = async (client: MetabaseClient) => {
  const { data, error } = await anyClient(client).GET("/api/transform-tag", {});
  if (error) throw fail("List transform tags", error);
  return data;
};

export const createTransformTag = async (client: MetabaseClient, name: string) => {
  const { data, error } = await anyClient(client).POST("/api/transform-tag", { body: { name } });
  if (error) throw await apiError(client, "Create transform tag", error);
  return data;
};
