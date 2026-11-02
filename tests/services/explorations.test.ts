import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, getMetabaseMajor, getTokenFeatures, SAMPLE_DB_ID, testName } from "../helpers.js";
import {
  listExplorationDimensions,
  listMyExplorations,
  getExploration,
  getExplorationQueryResult,
  createExploration,
  updateExploration,
  deleteExploration,
  restartExplorationThread,
  cancelExplorationThread,
} from "../../src/services/explorations.js";
import { listContentFindings, dismissContentFindings } from "../../src/services/content-diagnostics.js";
import { createMetric } from "../../src/services/metrics.js";
import { getDatabaseMetadata } from "../../src/services/databases.js";
import { deleteCard } from "../../src/services/cards.js";

const MAJOR = await getMetabaseMajor();
const cleanup = { cards: [] as number[], explorations: [] as number[] };

describe("explorations service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanup.explorations) { try { await deleteExploration(client, id); } catch {} }
    for (const id of cleanup.cards) { try { await deleteCard(client, id); } catch {} }
  });

  test.skipIf(MAJOR >= 65)("explains the version requirement on old Metabase", async () => {
    const client = await getTestClient();
    await expect(listMyExplorations(client)).rejects.toThrow("requires Metabase 0.65");
  });

  let metricId: number;
  let quantityDim: string;
  let createdAtDim: string;

  test.skipIf(MAJOR < 65)("setup: a metric on ORDERS shows up with its dimensions", async () => {
    const client = await getTestClient();
    const meta = (await getDatabaseMetadata(client, SAMPLE_DB_ID)) as any;
    const orders = meta.tables.find((t: any) => t.name.toUpperCase() === "ORDERS");
    const metric = (await createMetric(client, {
      name: testName("expl-orders"),
      dataset_query: { database: SAMPLE_DB_ID, type: "query", query: { "source-table": orders.id, aggregation: [["count"]] } },
    })) as any;
    metricId = metric.id;
    cleanup.cards.push(metricId);

    const catalog = await listExplorationDimensions(client);
    const m = catalog.metrics.find((x) => x.id === metricId)!;
    expect(m).toBeDefined();
    expect(m.dimensions.length).toBeGreaterThan(0);
    quantityDim = m.dimensions.find((d: any) => d.column === "QUANTITY")!.id;
    createdAtDim = m.dimensions.find((d: any) => d.column === "CREATED_AT")!.id;
    expect(quantityDim).toBeTruthy();
    expect(createdAtDim).toBeTruthy();
  });

  test.skipIf(MAJOR < 65)("q filters the catalog", async () => {
    const client = await getTestClient();
    const catalog = await listExplorationDimensions(client, { q: "no-such-metric-zzz" });
    expect(catalog.metrics.some((x) => x.id === metricId)).toBe(false);
  });

  test.skipIf(MAJOR < 65)("rejects unknown metrics and dimensions", async () => {
    const client = await getTestClient();
    await expect(
      createExploration(client, { name: "x", metric_ids: [999999], dimension_ids: [quantityDim], wait_seconds: 0 })
    ).rejects.toThrow("not a metric available to explorations");
    await expect(
      createExploration(client, { name: "x", metric_ids: [metricId], dimension_ids: ["00000000-0000-0000-0000-000000000000"], wait_seconds: 0 })
    ).rejects.toThrow("unknown dimension");
  });

  let explorationId: number;
  let threadId: number;

  test.skipIf(MAJOR < 65)("createExploration plans and runs queries", async () => {
    const client = await getTestClient();
    const e = (await createExploration(client, {
      name: testName("expl"),
      metric_ids: [metricId],
      dimension_ids: [quantityDim, createdAtDim],
      wait_seconds: 90,
    })) as any;
    explorationId = e.id;
    cleanup.explorations.push(explorationId);
    expect(e.note).toBeUndefined();
    const thread = e.threads[0];
    threadId = thread.id;
    expect(thread.status).toBe("completed");
    expect(thread.queries.length).toBeGreaterThan(1);
    expect(thread.queries.every((q: any) => q.status === "done")).toBe(true);
    // display names come through, not raw dimension UUIDs
    expect(thread.blocks[0].pages.some((p: any) => p.name.includes("Quantity"))).toBe(true);
    expect(thread.queries.some((q: any) => q.query_type !== "top-n-other")).toBe(true);
  });

  test.skipIf(MAJOR < 65)("getExplorationQueryResult returns rows", async () => {
    const client = await getTestClient();
    const e = await getExploration(client, explorationId);
    const q = e.threads[0].queries.find((x: any) => x.row_count > 0)!;
    const result = (await getExplorationQueryResult(client, q.id)) as any;
    expect(result.data.rows.length).toBe(q.row_count);
  });

  test.skipIf(MAJOR < 65)("listMyExplorations includes it", async () => {
    const client = await getTestClient();
    const list = await listMyExplorations(client, { limit: 200 });
    expect(list.explorations.some((x: any) => x.id === explorationId)).toBe(true);
  });

  test.skipIf(MAJOR < 65)("updateExploration renames and archives", async () => {
    const client = await getTestClient();
    const name = testName("expl-renamed");
    expect((await updateExploration(client, explorationId, { name })).name).toBe(name);
    expect((await updateExploration(client, explorationId, { archived: true })).archived).toBe(true);
    expect((await updateExploration(client, explorationId, { archived: false })).archived).toBe(false);
  });

  test.skipIf(MAJOR < 65)("restartExplorationThread re-runs the thread", async () => {
    const client = await getTestClient();
    const e = (await restartExplorationThread(client, threadId, 90)) as any;
    expect(e.threads[0].status).toBe("completed");
    expect(e.threads[0].queries.length).toBeGreaterThan(1);
  });

  test.skipIf(MAJOR < 65)("cancelExplorationThread hits the real endpoint", async () => {
    const client = await getTestClient();
    // The thread may already be finished; the route must exist either way
    try {
      const r = (await cancelExplorationThread(client, threadId)) as any;
      expect(r.id).toBe(threadId);
    } catch (e: any) {
      expect(String(e.message)).not.toContain("API endpoint does not exist");
    }
  });

  test.skipIf(MAJOR < 65)("deleteExploration removes it", async () => {
    const client = await getTestClient();
    await deleteExploration(client, explorationId);
    cleanup.explorations = cleanup.explorations.filter((x) => x !== explorationId);
    await expect(getExploration(client, explorationId)).rejects.toThrow();
  });
});

describe("content diagnostics service", () => {
  test("lists findings, or explains it is a paid 0.65+ feature", async () => {
    const client = await getTestClient();
    const features = await getTokenFeatures();
    const paid = MAJOR >= 65 && Object.values(features).some(Boolean);
    try {
      const r = await listContentFindings(client, "stale", { entity_types: ["dashboard", "question"] });
      expect(r).toBeDefined();
    } catch (e: any) {
      if (paid) throw e;
      expect(String(e.message)).toMatch(MAJOR >= 65 ? /paid feature/ : /requires Metabase 0\.65/);
    }
  });

  test("dismiss reports the same requirement", async () => {
    const client = await getTestClient();
    const features = await getTokenFeatures();
    if (MAJOR >= 65 && Object.values(features).some(Boolean)) return;
    await expect(dismissContentFindings(client, [1])).rejects.toThrow(MAJOR >= 65 ? /paid feature/ : /requires Metabase 0\.65/);
  });
});
