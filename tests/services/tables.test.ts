import { describe, test, expect } from "bun:test";
import { getTestClient, SAMPLE_DB_ID } from "../helpers.js";
import { getDatabaseMetadata } from "../../src/services/databases.js";
import { getTable, getTableQueryMetadata, getField, getFieldValues } from "../../src/services/tables.js";

let ordersTableId: number;
let firstFieldId: number;

describe("tables service", () => {
  test("setup: find ORDERS table ID", async () => {
    const client = await getTestClient();
    const meta = (await getDatabaseMetadata(client, SAMPLE_DB_ID)) as any;
    const orders = meta.tables.find((t: any) => t.name.toUpperCase() === "ORDERS" || t.display_name?.toUpperCase() === "ORDERS");
    expect(orders).toBeDefined();
    ordersTableId = orders.id;
    firstFieldId = orders.fields?.[0]?.id;
  });

  test("getTable returns table details", async () => {
    const client = await getTestClient();
    const result = (await getTable(client, ordersTableId)) as any;
    expect(result).toBeDefined();
    expect(result.id).toBe(ordersTableId);
  });

  test("getTableQueryMetadata returns query metadata", async () => {
    const client = await getTestClient();
    const result = (await getTableQueryMetadata(client, ordersTableId)) as any;
    expect(result).toBeDefined();
    expect(result.fields).toBeDefined();
    expect(result.fields.length).toBeGreaterThan(0);
    if (!firstFieldId) firstFieldId = result.fields[0].id;
  });

  test("getField returns field details", async () => {
    const client = await getTestClient();
    expect(firstFieldId).toBeDefined();
    const result = (await getField(client, firstFieldId)) as any;
    expect(result).toBeDefined();
    expect(result.id).toBe(firstFieldId);
  });

  test("getFieldValues returns values", async () => {
    const client = await getTestClient();
    expect(firstFieldId).toBeDefined();
    const result = (await getFieldValues(client, firstFieldId)) as any;
    expect(result).toBeDefined();
  });
});
