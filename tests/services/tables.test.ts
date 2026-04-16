import { describe, test, expect } from "bun:test";
import { getTestClient, SAMPLE_DB_ID } from "../helpers.js";
import { getDatabaseMetadata } from "../../src/services/databases.js";
import {
  getTable,
  getTableQueryMetadata,
  getField,
  getFieldValues,
  updateTable,
  updateField,
  rescanFieldValues,
  discardFieldValues,
  reorderFields,
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
    await expect(getTable(client, 999999)).rejects.toThrow("Get table failed");
  });

  test("updateTable updates display_name and restores it", async () => {
    const client = await getTestClient();
    const original = (await getTable(client, ordersTableId)) as any;
    const originalName = original.display_name;

    const updated = (await updateTable(client, ordersTableId, { display_name: "Orders (MCP Test)" })) as any;
    expect(updated.display_name).toBe("Orders (MCP Test)");

    const restored = (await updateTable(client, ordersTableId, { display_name: originalName })) as any;
    expect(restored.display_name).toBe(originalName);
  });

  test("updateField updates description and restores it", async () => {
    const client = await getTestClient();
    expect(firstFieldId).toBeDefined();
    const original = (await getField(client, firstFieldId)) as any;
    const originalDescription = original.description ?? null;

    await updateField(client, firstFieldId, { description: "MCP test description" });
    const updated = (await getField(client, firstFieldId)) as any;
    expect(updated.description).toBe("MCP test description");

    await updateField(client, firstFieldId, { description: originalDescription ?? "" });
    const restored = (await getField(client, firstFieldId)) as any;
    expect(restored.description ?? "").toBe(originalDescription ?? "");
  });

  test("rescanFieldValues triggers without error", async () => {
    const client = await getTestClient();
    expect(firstFieldId).toBeDefined();
    const result = await rescanFieldValues(client, firstFieldId);
    expect(result).toEqual({ success: true });
  });

  test("discardFieldValues clears cached values without error", async () => {
    const client = await getTestClient();
    expect(firstFieldId).toBeDefined();
    const result = await discardFieldValues(client, firstFieldId);
    expect(result).toEqual({ success: true });
  });

  test("reorderFields sets custom field order without error", async () => {
    const client = await getTestClient();
    const meta = (await getTableQueryMetadata(client, ordersTableId)) as any;
    const fieldIds: number[] = meta.fields.map((f: any) => f.id);
    expect(fieldIds.length).toBeGreaterThan(0);

    const result = await reorderFields(client, ordersTableId, fieldIds);
    expect(result).toEqual({ success: true });
  });
});
