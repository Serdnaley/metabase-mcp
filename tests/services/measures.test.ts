import { describe, test, expect } from "bun:test";
import { getTestClient, getMetabaseMajor, SAMPLE_DB_ID, testName } from "../helpers.js";
import { listMeasures, getMeasure, createMeasure, updateMeasure } from "../../src/services/measures.js";
import { runMetric } from "../../src/services/metrics.js";
import { getDatabaseMetadata } from "../../src/services/databases.js";

const MAJOR = await getMetabaseMajor();

describe("measures service", () => {
  let measureId: number;
  let ordersTableId: number;
  let totalFieldId: number;

  test("setup: ORDERS.TOTAL", async () => {
    const client = await getTestClient();
    const meta = (await getDatabaseMetadata(client, SAMPLE_DB_ID)) as any;
    const orders = meta.tables.find((t: any) => t.name.toUpperCase() === "ORDERS");
    ordersTableId = orders.id;
    totalFieldId = orders.fields.find((f: any) => f.name.toUpperCase() === "TOTAL").id;
  });

  test("createMeasure wraps a bare aggregation", async () => {
    const client = await getTestClient();
    const result = (await createMeasure(client, {
      name: testName("revenue-measure"),
      table_id: ordersTableId,
      definition: { aggregation: [["sum", ["field", totalFieldId, null]]] },
    })) as any;
    expect(result.id).toBeDefined();
    expect(result.table_id).toBe(ordersTableId);
    measureId = result.id;
  });

  test("listMeasures and getMeasure find it", async () => {
    const client = await getTestClient();
    const list = (await listMeasures(client)) as any[];
    expect(list.some((m) => m.id === measureId)).toBe(true);
    const one = (await getMeasure(client, measureId)) as any;
    expect(one.id).toBe(measureId);
  });

  test.skipIf(MAJOR < 60)("run_metric computes a measure", async () => {
    const client = await getTestClient();
    const result = (await runMetric(client, { measure_id: measureId })) as any;
    expect(result.status).toBe("completed");
    expect(result.data.rows[0][0]).toBeGreaterThan(0);
  });

  test("updateMeasure renames, redefines and archives", async () => {
    const client = await getTestClient();
    const name = testName("renamed-measure");
    const renamed = (await updateMeasure(client, measureId, {
      revision_message: "rename",
      name,
      definition: { aggregation: [["avg", ["field", totalFieldId, null]]] },
    })) as any;
    expect(renamed.name).toBe(name);
    expect(JSON.stringify(renamed.definition)).toContain("avg");
    const archived = (await updateMeasure(client, measureId, { revision_message: "cleanup", archived: true })) as any;
    expect(archived.archived).toBe(true);
  });
});
