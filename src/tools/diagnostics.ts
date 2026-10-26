import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  listTasks,
  getTask,
  listTaskTypes,
  listTaskRuns,
  getSchedulerInfo,
  getServerLogs,
  listLogPresets,
  setLogLevels,
  resetLogLevels,
  getPremiumTokenStatus,
} from "../services/diagnostics.js";

const text = (result: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(result) }] });

export const registerDiagnosticsTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool(
    "list_tasks",
    "Background task history (sync, analyze, field values, fingerprinting, notification sends, transform runs), newest first. Use to debug slow or failing syncs. Admin only.",
    {
      status: z.enum(["success", "failed", "started", "unknown"]).optional().describe("Only tasks with this status"),
      task: z.string().optional().describe("Only this task type (see list_task_types), e.g. 'sync'"),
      limit: z.number().int().positive().max(200).optional().describe("Page size (default 50)"),
      offset: z.number().int().min(0).optional().describe("Skip this many tasks"),
      verbose: z.boolean().optional().describe("Include each task's log lines"),
    },
    async (params) => text(await listTasks(client, params))
  );

  server.tool(
    "get_task",
    "One background task with its details and log lines. Admin only.",
    { id: z.number().describe("Task ID from list_tasks") },
    async ({ id }) => text(await getTask(client, id))
  );

  server.tool("list_task_types", "Task type names usable as list_tasks' task filter. Admin only.", {}, async () =>
    text(await listTaskTypes(client))
  );

  server.tool(
    "list_task_runs",
    "Grouped task runs: one sync/analyze/fingerprint run of a database with success/failure counts. Admin only.",
    {
      limit: z.number().int().positive().max(200).optional().describe("Page size (default 50)"),
      offset: z.number().int().min(0).optional().describe("Skip this many runs"),
    },
    async (params) => text(await listTaskRuns(client, params))
  );

  server.tool(
    "get_scheduler_info",
    "Quartz scheduler status and every scheduled job with its triggers and next fire time. Admin only.",
    {},
    async () => text(await getSchedulerInfo(client))
  );

  server.tool(
    "get_server_logs",
    "Recent Metabase server log lines (the last ~250 kept in memory), newest first, ANSI colors stripped. Admin only.",
    {
      level: z.enum(["ERROR", "WARN", "INFO", "DEBUG", "TRACE"]).optional().describe("Minimum level"),
      contains: z.string().optional().describe("Only lines whose message or logger contains this text"),
      limit: z.number().int().positive().max(250).optional().describe("Max lines (default 100)"),
    },
    async (params) => text(await getServerLogs(client, params))
  );

  server.tool("list_log_presets", "Logging presets (groups of loggers for troubleshooting, e.g. sync). Admin only.", {}, async () =>
    text(await listLogPresets(client))
  );

  server.tool(
    "get_premium_token_status",
    "Status of the premium (paid plan) token: validity, features, expiry. Open-source instances report no token. Admin only.",
    {},
    async () => text(await getPremiumTokenStatus(client))
  );

  if (!config.readOnly) {
    server.tool(
      "set_log_levels",
      "Temporarily change log levels for some loggers (e.g. from list_log_presets) to debug an issue; Metabase reverts them after the duration. Admin only.",
      {
        log_levels: z.record(z.string(), z.enum(["trace", "debug", "info", "warn", "error", "fatal", "off"])).describe("Logger name → level, e.g. { 'metabase.sync': 'debug' }"),
        duration: z.number().int().positive().describe("How long the change lasts"),
        duration_unit: z.enum(["seconds", "minutes", "hours", "days"]).describe("Unit of duration"),
      },
      async (params) => text(await setLogLevels(client, params))
    );

    server.tool("reset_log_levels", "Undo set_log_levels now. Admin only.", {}, async () => text(await resetLogLevels(client)));
  }
};
