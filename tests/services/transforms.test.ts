import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, getWarehouseDbId, testName } from "../helpers.js";
import {
  listTransforms,
  getTransform,
  createTransform,
  updateTransform,
  deleteTransform,
  runTransform,
  listTransformRuns,
  getTransformRun,
  listTransformJobs,
  createTransformJob,
  runTransformJob,
  deleteTransformJob,
  listTransformTags,
  createTransformTag,
  buildTransformSource,
} from "../../src/services/transforms.js";

// Transforms need a real warehouse (the sample DB can't be a target): the optional
// Postgres "Test Warehouse" registered by tests/setup.ts.
const WAREHOUSE = await getWarehouseDbId();
if (WAREHOUSE === null) console.log("SKIP transforms (environment): no Test Warehouse (Postgres)");

const waitForRun = async (transformId: number) => {
  const client = await getTestClient();
  for (let i = 0; i < 40; i++) {
    const runs = (await listTransformRuns(client, { transform_ids: [transformId] })) as any;
    const run = (runs.data ?? runs)[0];
    if (run && run.status !== "started") return run;
    await Bun.sleep(500);
  }
  throw new Error("transform run did not finish");
};

describe("transforms service", () => {
  const cleanup: { transforms: number[]; jobs: number[] } = { transforms: [], jobs: [] };
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanup.jobs) { try { await deleteTransformJob(client, id); } catch {} }
    for (const id of cleanup.transforms) { try { await deleteTransform(client, id, { drop_table: true }); } catch {} }
  });

  test("buildTransformSource shortcuts", () => {
    expect(buildTransformSource({ sql: "select 1", database_id: 3 })).toEqual({
      type: "query",
      query: { database: 3, type: "native", native: { query: "select 1" } },
    });
    expect(() => buildTransformSource({ sql: "select 1" })).toThrow("database_id");
    expect(buildTransformSource({})).toBeUndefined();
  });

  let transformId: number;
  let tagId: number;
  const table = `mcp_tx_${Date.now()}`;

  test.skipIf(WAREHOUSE === null)("create, get, list a SQL transform", async () => {
    const client = await getTestClient();
    const tag = (await createTransformTag(client, testName("tag"))) as any;
    tagId = tag.id;
    const created = (await createTransform(client, {
      name: testName("tx"),
      sql: "select 1 as a union all select 2",
      database_id: WAREHOUSE!,
      target_schema: "public",
      target_table: table,
      tag_ids: [tagId],
    })) as any;
    transformId = created.id;
    cleanup.transforms.push(transformId);
    expect(created.target.name).toBe(table);

    expect(((await getTransform(client, transformId)) as any).id).toBe(transformId);
    const list = (await listTransforms(client, { database_id: WAREHOUSE! })) as any[];
    expect(list.some((t) => t.id === transformId)).toBe(true);
    const tags = (await listTransformTags(client)) as any[];
    expect(tags.some((t) => t.id === tagId)).toBe(true);
  }, 30_000);

  test.skipIf(WAREHOUSE === null)("run a transform and read its run", async () => {
    const client = await getTestClient();
    const started = (await runTransform(client, transformId)) as any;
    expect(started.run_id).toBeDefined();
    const run = await waitForRun(transformId);
    expect(run.status).toBe("succeeded");
    expect(((await getTransformRun(client, started.run_id)) as any).id).toBe(started.run_id);
  }, 30_000);

  test.skipIf(WAREHOUSE === null)("update the transform query", async () => {
    const client = await getTestClient();
    const updated = (await updateTransform(client, transformId, {
      sql: "select 42 as a",
      database_id: WAREHOUSE!,
      description: "updated",
    })) as any;
    expect(updated.description).toBe("updated");
    expect(JSON.stringify(updated.source)).toContain("42");
  }, 30_000);

  test.skipIf(WAREHOUSE === null)("transform jobs: create, list, run, delete", async () => {
    const client = await getTestClient();
    const job = (await createTransformJob(client, {
      name: testName("job"),
      schedule: "0 0 3 * * ? *",
      tag_ids: [tagId],
    })) as any;
    cleanup.jobs.push(job.id);
    const jobs = (await listTransformJobs(client)) as any[];
    expect(jobs.some((j) => j.id === job.id)).toBe(true);
    const run = (await runTransformJob(client, job.id)) as any;
    expect(run).toBeDefined();
    expect(await deleteTransformJob(client, job.id)).toEqual({ success: true });
    cleanup.jobs.splice(cleanup.jobs.indexOf(job.id), 1);
  }, 30_000);

  test.skipIf(WAREHOUSE === null)("delete the transform and its table", async () => {
    const client = await getTestClient();
    await waitForRun(transformId);
    expect(await deleteTransform(client, transformId, { drop_table: true })).toEqual({ success: true });
    cleanup.transforms.splice(cleanup.transforms.indexOf(transformId), 1);
  }, 30_000);
});
