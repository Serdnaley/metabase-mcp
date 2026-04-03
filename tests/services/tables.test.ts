import { describe, test, expect } from "bun:test";
import { getTestClient, SAMPLE_DB_ID } from "../helpers.js";
import { getDatabaseMetadata } from "../../src/services/databases.js";
import {
  getTable,
  getTableQueryMetadata,
  getField,
  getFieldValues,
} from "../../src/services/tables.js";

let ordersTableId: number;
let firstFieldId: number;

describe("tables service", () => {
  test("setup: find ORDERS table ID", async () => {
    const client = await getTestClient();
    const meta = (await getDatabaseMetadata(client, SAMPLE_DB_ID)) as any;
    const orders = meta.tables.find(
      (t: any) =>
        t.name.toUpperCase() === "ORDERS" ||
        t.display_name?.toUpperCase() === "ORDERS"
    );
    expect(orders).toBeDefined();
    ordersTableId = orders.id;
    firstFieldId = orders.fields?.[0]?.id;
  });

  test("getTable returns table details with fields", async () => {
    const client = await getTestClient();
    const result = (await getTable(client, ordersTableId)) as any;
    expect(result).toBeDefined();
    expect(result.id).toBe(ordersTableId);
    expect(result.name).toBeDefined();
    expect(typeof result.name).toBe("string");
  });

  test("getTableQueryMetadata returns fields with types", async () => {
    const client = await getTestClient();
    const result = (await getTableQueryMetadata(client, ordersTableId)) as any;
    expect(result).toBeDefined();
    expect(result.fields).toBeDefined();
    expect(result.fields.length).toBeGreaterThan(0);
    // Verify fields have expected structure
    const field = result.fields[0];
    expect(field.id).toBeDefined();
    expect(field.name).toBeDefined();
    if (!firstFieldId) firstFieldId = field.id;
  });

  test("getField returns field details with type info", async () => {
    const client = await getTestClient();
    expect(firstFieldId).toBeDefined();
    const result = (await getField(client, firstFieldId)) as any;
    expect(result).toBeDefined();
    expect(result.id).toBe(firstFieldId);
    expect(result.name).toBeDefined();
    expect(result.base_type).toBeDefined();
  });

  test("getFieldValues returns field value data", async () => {
    const client = await getTestClient();
    expect(firstFieldId).toBeDefined();
    const result = (await getFieldValues(client, firstFieldId)) as any;
    expect(result).toBeDefined();
    // Field values response should have a field_id and values array
    expect(result.field_id).toBeDefined();
  });

  test("getTable throws for non-existent table", async () => {
    const client = await getTestClient();
    expect(getTable(client, 999999)).rejects.toThrow("Get table failed");
  });
});
