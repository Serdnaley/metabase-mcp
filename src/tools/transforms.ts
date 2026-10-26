import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  listTransforms,
  getTransform,
  createTransform,
  updateTransform,
  deleteTransform,
  runTransform,
  cancelTransformRun,
  listTransformRuns,
  getTransformRun,
  listTransformJobs,
  createTransformJob,
  runTransformJob,
  deleteTransformJob,
  listTransformTags,
  createTransformTag,
} from "../services/transforms.js";

const text = (result: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
});

const NOTE =
  "Transforms write a query's result into a warehouse table. Self-hosted Metabase must enable them (MB_TRANSFORMS_ENABLED=true); the sample database can't be a target.";

const sourceInputs = {
  sql: z.string().optional().describe("Native SQL whose result becomes the table (needs database_id)"),
  database_id: z.number().optional().describe("Database to run sql against (also the target database)"),
  query: z.record(z.string(), z.unknown()).optional().describe("A full dataset_query instead of sql"),
  source: z.record(z.string(), z.unknown()).optional().describe("Raw transform source, e.g. { type: 'query', query: {...} }; overrides sql/query"),
};

export const registerTransformTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool(
    "list_transforms",
    `List transforms. ${NOTE}`,
    {
      database_id: z.number().optional().describe("Only transforms on this database"),
      tag_ids: z.array(z.number()).optional().describe("Only transforms with these tags"),
    },
    async (params) => text(await listTransforms(client, params))
  );

  server.tool(
    "get_transform",
    "Get a transform: source query, target table, last run",
    { id: z.number().describe("Transform ID") },
    async ({ id }) => text(await getTransform(client, id))
  );

  server.tool(
    "list_transform_runs",
    "List transform runs (status, start/end time, message), newest first",
    {
      transform_ids: z.array(z.number()).optional().describe("Only runs of these transforms"),
      statuses: z.array(z.string()).optional().describe("e.g. ['started', 'succeeded', 'failed']"),
    },
    async (params) => text(await listTransformRuns(client, params))
  );

  server.tool(
    "get_transform_run",
    "Get one transform run",
    { run_id: z.number().describe("Run ID") },
    async ({ run_id }) => text(await getTransformRun(client, run_id))
  );

  server.tool(
    "list_transform_jobs",
    "List transform jobs: cron schedules that run every transform carrying one of the job's tags",
    {},
    async () => text(await listTransformJobs(client))
  );

  server.tool("list_transform_tags", "List transform tags", {}, async () => text(await listTransformTags(client)));

  if (!config.readOnly) {
    server.tool(
      "create_transform",
      `Create a transform that materialises a query into a table. ${NOTE}`,
      {
        name: z.string().describe("Transform name"),
        ...sourceInputs,
        target_table: z.string().describe("Name of the table to create/replace"),
        target_schema: z.string().optional().describe("Schema for the table (e.g. 'public'); omit for schema-less databases"),
        description: z.string().optional().describe("Description"),
        collection_id: z.number().optional().describe("Collection to file the transform in"),
        tag_ids: z.array(z.number()).optional().describe("Tags (jobs run transforms by tag)"),
      },
      async (params) => text(await createTransform(client, params))
    );

    server.tool(
      "update_transform",
      "Update a transform's name, description, source query, target or tags",
      {
        id: z.number().describe("Transform ID"),
        name: z.string().optional().describe("New name"),
        description: z.string().optional().describe("New description"),
        ...sourceInputs,
        target_table: z.string().optional().describe("New target table name"),
        target_schema: z.string().optional().describe("New target schema"),
        tag_ids: z.array(z.number()).optional().describe("Replace tags"),
      },
      async ({ id, ...params }) => text(await updateTransform(client, id, params))
    );

    server.tool(
      "delete_transform",
      "Delete a transform. drop_table: true also drops the table it produced.",
      {
        id: z.number().describe("Transform ID"),
        drop_table: z.boolean().optional().describe("Also drop the target table (default false)"),
      },
      async ({ id, drop_table }) => text(await deleteTransform(client, id, { drop_table }))
    );

    server.tool(
      "run_transform",
      "Run a transform now. Returns a run_id; poll get_transform_run or list_transform_runs for the result.",
      { id: z.number().describe("Transform ID") },
      async ({ id }) => text(await runTransform(client, id))
    );

    server.tool(
      "cancel_transform_run",
      "Cancel the transform's current run",
      { id: z.number().describe("Transform ID") },
      async ({ id }) => text(await cancelTransformRun(client, id))
    );

    server.tool(
      "create_transform_job",
      "Create a transform job that runs all transforms with the given tags on a schedule",
      {
        name: z.string().describe("Job name"),
        schedule: z.string().describe("Quartz cron, e.g. '0 0 3 * * ? *' (daily 03:00)"),
        tag_ids: z.array(z.number()).optional().describe("Transform tags this job runs"),
        description: z.string().optional().describe("Description"),
      },
      async (params) => text(await createTransformJob(client, params))
    );

    server.tool(
      "run_transform_job",
      "Run a transform job now",
      { job_id: z.number().describe("Job ID") },
      async ({ job_id }) => text(await runTransformJob(client, job_id))
    );

    server.tool(
      "delete_transform_job",
      "Delete a transform job (the transforms stay)",
      { job_id: z.number().describe("Job ID") },
      async ({ job_id }) => text(await deleteTransformJob(client, job_id))
    );

    server.tool(
      "create_transform_tag",
      "Create a transform tag",
      { name: z.string().describe("Tag name") },
      async ({ name }) => text(await createTransformTag(client, name))
    );
  }
};
