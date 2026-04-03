import { describe, test, expect } from "bun:test";
import { getTestClient, SAMPLE_DB_ID } from "../helpers.js";
import { executeQuery } from "../../src/services/dataset.js";

describe("dataset service", () => {
  test("native SQL query returns results", async () => {
    const client = await getTestClient();
    const result = (await executeQuery(client, {
      database: SAMPLE_DB_ID,
      type: "native",
      native: { query: "SELECT COUNT(*) AS cnt FROM ORDERS" },
    })) as any;
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.rows).toBeDefined();
    expect(result.data.rows.length).toBe(1);
    expect(result.data.rows[0][0]).toBeGreaterThan(0);
  });

  test("native SQL with LIMIT returns correct rows", async () => {
    const client = await getTestClient();
    const result = (await executeQuery(client, {
      database: SAMPLE_DB_ID,
      type: "native",
      native: { query: "SELECT * FROM ORDERS LIMIT 5" },
    })) as any;
    expect(result).toBeDefined();
    expect(result.data.rows.length).toBe(5);
    // Verify columns metadata is present
    expect(result.data.cols).toBeDefined();
    expect(result.data.cols.length).toBeGreaterThan(0);
  });

  test("structured query returns results", async () => {
    const client = await getTestClient();
    // Get the ORDERS table ID from metadata
    const { getDatabaseMetadata } = await import("../../src/services/databases.js");
    const meta = (await getDatabaseMetadata(client, SAMPLE_DB_ID)) as any;
    const ordersTable = meta.tables.find(
      (t: any) => t.name.toUpperCase() === "ORDERS"
    );
    expect(ordersTable).toBeDefined();

    const result = (await executeQuery(client, {
      database: SAMPLE_DB_ID,
      type: "query",
      query: { "source-table": ordersTable.id, limit: 3 },
    })) as any;
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.rows).toBeDefined();
    expect(result.data.rows.length).toBe(3);
  });
});
