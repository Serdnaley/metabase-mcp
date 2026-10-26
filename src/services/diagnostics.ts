import type { MetabaseClient } from "../client.js";
import { apiError } from "./version.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyClient = (client: MetabaseClient): any => client;

// eslint-disable-next-line no-control-regex
const ANSI = /\u001B\[[0-9;]*m/g;
const clean = (s: unknown) => (typeof s === "string" ? s.replace(ANSI, "") : s);

export type TaskQuery = {
  limit?: number;
  offset?: number;
  status?: "success" | "failed" | "started" | "unknown";
  task?: string;
  verbose?: boolean;
};

const compactTask = (t: any, verbose?: boolean) => ({
  id: t.id,
  task: t.task,
  status: t.status,
  db_id: t.db_id ?? undefined,
  run_id: t.run_id ?? undefined,
  started_at: t.started_at,
  ended_at: t.ended_at,
  duration_ms: t.duration,
  ...(t.task_details ? { task_details: t.task_details } : {}),
  ...(verbose && Array.isArray(t.logs)
    ? { logs: t.logs.map((l: any) => ({ level: l.level, timestamp: l.timestamp, msg: clean(l.msg) })) }
    : {}),
});

/** Background task history (sync, analyze, field values, notifications, transforms...). */
export const listTasks = async (client: MetabaseClient, q: TaskQuery = {}) => {
  const query: Record<string, unknown> = { limit: q.limit ?? 50, offset: q.offset ?? 0 };
  if (q.status) query.status = q.status;
  if (q.task) query.task = q.task;
  const { data, error } = await anyClient(client).GET("/api/task", { params: { query } });
  if (error) throw await apiError(client, "List tasks", error);
  return {
    total: data?.total,
    limit: data?.limit,
    offset: data?.offset,
    tasks: (data?.data ?? []).map((t: any) => compactTask(t, q.verbose)),
  };
};

export const getTask = async (client: MetabaseClient, id: number) => {
  const { data, error } = await anyClient(client).GET("/api/task/{id}", { params: { path: { id } } });
  if (error) throw await apiError(client, "Get task", error);
  return compactTask(data, true);
};

export const listTaskTypes = async (client: MetabaseClient) => {
  const { data, error } = await anyClient(client).GET("/api/task/unique-tasks", {});
  if (error) throw await apiError(client, "List task types", error);
  return data;
};

/** Grouped task runs (one sync/analyze run of a database = several tasks). */
export const listTaskRuns = async (client: MetabaseClient, q: { limit?: number; offset?: number } = {}) => {
  const { data, error } = await anyClient(client).GET("/api/task/runs", {
    params: { query: { limit: q.limit ?? 50, offset: q.offset ?? 0 } },
  });
  if (error) throw await apiError(client, "List task runs", error, 59);
  return data;
};

export const getSchedulerInfo = async (client: MetabaseClient) => {
  const { data, error } = await anyClient(client).GET("/api/task/info", {});
  if (error) throw await apiError(client, "Get scheduler info", error);
  // Job list is long; keep the scheduler summary and job names + triggers
  return {
    scheduler: data?.scheduler,
    jobs: (data?.jobs ?? []).map((j: any) => ({
      key: j.key,
      description: j.description || undefined,
      triggers: (j.triggers ?? []).map((t: any) => ({
        key: t.key,
        state: t.state,
        schedule: t.schedule,
        next_fire_time: t["next-fire-time"],
        previous_fire_time: t["previous-fire-time"],
      })),
    })),
  };
};

export type LogQuery = { level?: "ERROR" | "WARN" | "INFO" | "DEBUG" | "TRACE"; contains?: string; limit?: number };

const LEVELS = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"];

/** Recent server log lines (Metabase keeps the last ~250 in memory), newest first. */
export const getServerLogs = async (client: MetabaseClient, q: LogQuery = {}) => {
  const { data, error } = await anyClient(client).GET("/api/logger/logs", {});
  if (error) throw await apiError(client, "Get server logs", error);
  const min = q.level ? LEVELS.indexOf(q.level) : 0;
  const needle = q.contains?.toLowerCase();
  const lines = (Array.isArray(data) ? data : [])
    .map((l: any) => ({
      timestamp: l.timestamp,
      level: l.level,
      logger: l.fqns,
      msg: clean(l.msg),
      ...(l.exception ? { exception: Array.isArray(l.exception) ? l.exception.slice(0, 15) : l.exception } : {}),
    }))
    .filter((l: any) => LEVELS.indexOf(String(l.level).toUpperCase()) >= min)
    .filter((l: any) => !needle || `${l.msg} ${l.logger}`.toLowerCase().includes(needle))
    .sort((a: any, b: any) => String(b.timestamp).localeCompare(String(a.timestamp)));
  return { count: lines.length, lines: lines.slice(0, q.limit ?? 100) };
};

export const listLogPresets = async (client: MetabaseClient) => {
  const { data, error } = await anyClient(client).GET("/api/logger/presets", {});
  if (error) throw await apiError(client, "List log presets", error);
  return data;
};

/** Temporarily raise log levels (Metabase resets them after the duration). */
export const setLogLevels = async (
  client: MetabaseClient,
  params: { log_levels: Record<string, string>; duration: number; duration_unit: "seconds" | "minutes" | "hours" | "days" }
) => {
  const { error } = await anyClient(client).POST("/api/logger/adjustment", { body: params });
  if (error) throw await apiError(client, "Set log levels", error);
  return { success: true, ...params };
};

export const resetLogLevels = async (client: MetabaseClient) => {
  const { error } = await anyClient(client).DELETE("/api/logger/adjustment", {});
  if (error) throw await apiError(client, "Reset log levels", error);
  return { success: true };
};

/** Premium token status (paid plans); OSS answers 404, reported as "no token". */
export const getPremiumTokenStatus = async (client: MetabaseClient) => {
  const { data, error, response } = await anyClient(client).GET("/api/premium-features/token/status", {});
  if (response?.status === 404) return { valid: false, note: "No premium token configured (open-source edition)" };
  if (error) throw await apiError(client, "Get premium token status", error);
  return data;
};
