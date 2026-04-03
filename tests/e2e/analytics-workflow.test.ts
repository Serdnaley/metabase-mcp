import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName, SAMPLE_DB_ID } from "../helpers.js";
import { search } from "../../src/services/search.js";
import { getTableQueryMetadata } from "../../src/services/tables.js";
import { createCard, executeCardQuery, deleteCard } from "../../src/services/cards.js";
import { executeQuery } from "../../src/services/dataset.js";

const cleanupCardIds: number[] = [];

describe("E2E: analytics workflow", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupCardIds) {
      try { await deleteCard(client, id); } catch {}
    }
  });

  let ordersTableId: number;

  test("1. search for 'orders' table", async () => {
    const client = await getTestClient();
    const result = (await search(client, { q: "orders", models: ["table"] })) as any;
    const data = result.data || result;
    expect(data.length).toBeGreaterThan(0);
    const orders = data.find(
      (r: any) => r.name?.toUpperCase() === "ORDERS" || r.display_name?.toUpperCase() === "ORDERS"
    );
    expect(orders).toBeDefined();
    ordersTableId = orders.id;
  });

  test("2. get table metadata to understand schema", async () => {
    const client = await getTestClient();
    const meta = (await getTableQueryMetadata(client, ordersTableId)) as any;
    expect(meta.fields).toBeDefined();
    expect(meta.fields.length).toBeGreaterThan(0);
    const fieldNames = meta.fields.map((f: any) => (f.name || f.display_name || "").toUpperCase());
    expect(fieldNames).toContain("TOTAL");
  });

  test("3. run ad-hoc native query to explore data", async () => {
    const client = await getTestClient();
    const result = (await executeQuery(client, {
      database: SAMPLE_DB_ID,
      type: "native",
      native: { query: "SELECT COUNT(*) as order_count, SUM(TOTAL) as total_revenue FROM ORDERS" },
    })) as any;
    expect(result.data.rows.length).toBe(1);
    expect(result.data.rows[0][0]).toBeGreaterThan(0);
    expect(result.data.rows[0][1]).toBeGreaterThan(0);
  });

  test("4. save the query as a card (question)", async () => {
    const client = await getTestClient();
    const card = (await createCard(client, {
      name: testName("analytics-revenue"),
      display: "scalar",
      dataset_query: {
        type: "native",
        native: { query: "SELECT SUM(TOTAL) as total_revenue FROM ORDERS" },
        database: SAMPLE_DB_ID,
      },
      description: "Total revenue from all orders",
    })) as any;
    expect(card.id).toBeDefined();
    cleanupCardIds.push(card.id);
  });

  test("5. execute the saved question and verify results", async () => {
    const client = await getTestClient();
    const cardId = cleanupCardIds[0];
    const result = (await executeCardQuery(client, cardId)) as any;
    expect(result.data.rows.length).toBe(1);
    expect(result.data.rows[0][0]).toBeGreaterThan(0);
  });
});
