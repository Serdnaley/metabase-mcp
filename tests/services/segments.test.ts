import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, SAMPLE_DB_ID, testName } from "../helpers.js";
import {
  listSegments,
  getSegment,
  createSegment,
  updateSegment,
  deleteSegment,
} from "../../src/services/segments.js";
import { getDatabaseMetadata } from "../../src/services/databases.js";

const cleanupSegmentIds: number[] = [];

describe("segments service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupSegmentIds) {
      try {
        await deleteSegment(client, id, "test cleanup");
      } catch {}
    }
  });

  let ordersTableId: number;
  let numericFieldId: number;
  let createdSegmentId: number;

  test("setup: find ORDERS table and a numeric field via database metadata", async () => {
    const client = await getTestClient();
    const metadata = (await getDatabaseMetadata(client, SAMPLE_DB_ID)) as any;
    expect(metadata.tables).toBeDefined();

    const ordersTable = metadata.tables.find(
      (t: any) => t.name === "ORDERS" || t.name === "orders"
    );
    expect(ordersTable).toBeDefined();
    ordersTableId = ordersTable.id;

    const numericField = ordersTable.fields.find(
      (f: any) =>
        f.base_type === "type/Integer" ||
        f.base_type === "type/BigInteger" ||
        f.base_type === "type/Float" ||
        f.base_type === "type/Decimal"
    );
    expect(numericField).toBeDefined();
    numericFieldId = numericField.id;
  });

  test("listSegments returns an array", async () => {
    const client = await getTestClient();
    const result = await listSegments(client);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test("createSegment creates a segment on the ORDERS table", async () => {
    const client = await getTestClient();
    const result = (await createSegment(client, {
      name: testName("test-segment"),
      table_id: ordersTableId,
      definition: {
        filter: [">", ["field", numericFieldId, null], 0],
      },
      description: "Test segment for automated tests",
    })) as any;

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBeDefined();
    expect(result.table_id).toBe(ordersTableId);

    createdSegmentId = result.id;
    cleanupSegmentIds.push(createdSegmentId);
  });

  test("getSegment returns the created segment by ID", async () => {
    expect(createdSegmentId).toBeDefined();
    const client = await getTestClient();
    const result = (await getSegment(client, createdSegmentId)) as any;

    expect(result).toBeDefined();
    expect(result.id).toBe(createdSegmentId);
    expect(result.table_id).toBe(ordersTableId);
  });

  test("updateSegment updates the segment name", async () => {
    expect(createdSegmentId).toBeDefined();
    const client = await getTestClient();
    const newName = testName("updated-segment");
    const result = (await updateSegment(client, createdSegmentId, {
      name: newName,
      revision_message: "Updating name in automated test",
    })) as any;

    expect(result).toBeDefined();
    expect(result.name).toBe(newName);
  });

  test("deleteSegment deletes the segment", async () => {
    expect(createdSegmentId).toBeDefined();
    const client = await getTestClient();
    const result = await deleteSegment(
      client,
      createdSegmentId,
      "Deleting in automated test"
    );

    expect(result).toEqual({ success: true });
    cleanupSegmentIds.splice(cleanupSegmentIds.indexOf(createdSegmentId), 1);
  });

  test("getSegment throws for non-existent segment", async () => {
    const client = await getTestClient();
    await expect(getSegment(client, 999999)).rejects.toThrow("Get segment failed");
  });
});
