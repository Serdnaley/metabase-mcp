import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, getMetabaseMajor, SAMPLE_DB_ID, testName } from "../helpers.js";
import {
  listMetrics,
  getMetric,
  createMetric,
  updateMetric,
  runMetric,
  listMetricDimensions,
  getMetricDimensionValues,
  buildMetricDefinition,
} from "../../src/services/metrics.js";
import { getDatabaseMetadata } from "../../src/services/databases.js";
import { deleteCard } from "../../src/services/cards.js";

const MAJOR = await getMetabaseMajor();
const cleanup: number[] = [];

describe("metrics service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanup) { try { await deleteCard(client, id); } catch {} }
  });

  let metricId: number;
  let ordersTableId: number;
  let totalFieldId: number;

  test("setup: ORDERS.TOTAL", async () => {
    const client = await getTestClient();
    const meta = (await getDatabaseMetadata(client, SAMPLE_DB_ID)) as any;
    const orders = meta.tables.find((t: any) => t.name.toUpperCase() === "ORDERS");
    ordersTableId = orders.id;
    totalFieldId = orders.fields.find((f: any) => f.name.toUpperCase() === "TOTAL").id;
  });

  test("buildMetricDefinition builds filters and breakouts", () => {
    expect(
      buildMetricDefinition({
        metric_id: 7,
        filters: [{ dimension_id: "q", operator: ">", values: [3] }],
        breakouts: [{ dimension_id: "d", temporal_unit: "month" }],
      })
    ).toEqual({
      expression: ["metric", { "lib/uuid": "a" }, 7],
      filters: [{ "lib/uuid": "a", filter: [">", {}, ["dimension", {}, "q"], 3] }],
      projections: [
        { type: "metric", id: 7, "lib/uuid": "a", projection: [["dimension", { "temporal-unit": "month" }, "d"]] },
      ],
    });
    expect(() => buildMetricDefinition({})).toThrow("pass metric_id");
  });

  test("createMetric creates a metric card", async () => {
    const client = await getTestClient();
    const result = (await createMetric(client, {
      name: testName("revenue-metric"),
      dataset_query: {
        database: SAMPLE_DB_ID,
        type: "query",
        query: { "source-table": ordersTableId, aggregation: [["sum", ["field", totalFieldId, null]]] },
      },
      description: "test metric",
    })) as any;
    expect(result.type).toBe("metric");
    metricId = result.id;
    cleanup.push(metricId);
  });

  test("listMetrics includes it", async () => {
    const client = await getTestClient();
    const result = (await listMetrics(client)) as any;
    expect(result.data.some((m: any) => m.id === metricId)).toBe(true);
  });

  test("getMetric returns it", async () => {
    const client = await getTestClient();
    const result = (await getMetric(client, metricId)) as any;
    expect(result.id).toBe(metricId);
  });

  test("updateMetric renames it", async () => {
    const client = await getTestClient();
    const name = testName("renamed-metric");
    const result = (await updateMetric(client, metricId, { name })) as any;
    expect(result.name).toBe(name);
  });

  test.skipIf(MAJOR < 60)("runMetric computes the metric", async () => {
    const client = await getTestClient();
    const result = (await runMetric(client, { metric_id: metricId })) as any;
    expect(result.status).toBe("completed");
    expect(typeof result.data.rows[0][0]).toBe("number");
  });

  test.skipIf(MAJOR >= 60)("runMetric explains the version requirement on old Metabase", async () => {
    const client = await getTestClient();
    await expect(runMetric(client, { metric_id: metricId })).rejects.toThrow("requires Metabase 0.60");
  });

  test.skipIf(MAJOR < 64)("dimensions: list, values, filtered breakout run", async () => {
    const client = await getTestClient();
    const dims = (await listMetricDimensions(client, metricId)) as any[];
    const quantity = dims.find((d) => d.name.toUpperCase() === "QUANTITY");
    const created = dims.find((d) => d.name.toUpperCase() === "CREATED_AT");
    expect(quantity && created).toBeTruthy();

    const values = (await getMetricDimensionValues(client, metricId, quantity.id)) as any;
    expect(values.values.length).toBeGreaterThan(0);
    const found = (await getMetricDimensionValues(client, metricId, quantity.id, "1")) as any;
    expect(Array.isArray(found)).toBe(true);

    const result = (await runMetric(client, {
      metric_id: metricId,
      filters: [{ dimension_id: quantity.id, operator: ">", values: [3] }],
      breakouts: [{ dimension_id: created.id, temporal_unit: "year" }],
    })) as any;
    expect(result.status).toBe("completed");
    expect(result.data.rows.length).toBeGreaterThan(1);
  });

  test("updateMetric archives it", async () => {
    const client = await getTestClient();
    const result = (await updateMetric(client, metricId, { archived: true })) as any;
    expect(result.archived).toBe(true);
  });
});
