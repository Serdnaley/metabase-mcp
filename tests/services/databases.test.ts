import { describe, test, expect } from "bun:test";
import { getTestClient, SAMPLE_DB_ID } from "../helpers.js";
import {
  listDatabases,
  getDatabase,
  getDatabaseMetadata,
  listDatabaseSchemas,
  getDatabaseSchema,
} from "../../src/services/databases.js";

describe("databases service", () => {
  test("listDatabases returns at least the sample database", async () => {
    const client = await getTestClient();
    const result = await listDatabases(client);
    expect(result).toBeDefined();
    const data = result as any;
    const databases = Array.isArray(data) ? data : data.data;
    expect(databases.length).toBeGreaterThanOrEqual(1);
    const sample = databases.find((db: any) => db.id === SAMPLE_DB_ID);
    expect(sample).toBeDefined();
    expect(sample.name).toBeDefined();
  });

  test("getDatabase returns sample database details", async () => {
    const client = await getTestClient();
    const result = (await getDatabase(client, SAMPLE_DB_ID)) as any;
    expect(result).toBeDefined();
    expect(result.id).toBe(SAMPLE_DB_ID);
    expect(result.name).toBeDefined();
    expect(typeof result.name).toBe("string");
  });

  test("getDatabaseMetadata returns tables and fields", async () => {
    const client = await getTestClient();
    const result = (await getDatabaseMetadata(client, SAMPLE_DB_ID)) as any;
    expect(result).toBeDefined();
    expect(result.tables).toBeDefined();
    expect(result.tables.length).toBeGreaterThan(0);
    const ordersTable = result.tables.find(
      (t: any) => t.name === "ORDERS" || t.name === "orders"
    );
    expect(ordersTable).toBeDefined();
    expect(ordersTable.fields).toBeDefined();
    expect(ordersTable.fields.length).toBeGreaterThan(0);
  });

  test("listDatabaseSchemas returns at least one schema", async () => {
    const client = await getTestClient();
    const result = (await listDatabaseSchemas(client, SAMPLE_DB_ID)) as any[];
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test("getDatabaseSchema returns tables in schema", async () => {
    const client = await getTestClient();
    const schemas = (await listDatabaseSchemas(client, SAMPLE_DB_ID)) as any[];
    const schemaName = schemas[0] || "PUBLIC";
    const result = (await getDatabaseSchema(
      client,
      SAMPLE_DB_ID,
      schemaName as string
    )) as any;
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test("getDatabase throws for non-existent database", async () => {
    const client = await getTestClient();
    expect(getDatabase(client, 999999)).rejects.toThrow("Get database failed");
  });
});
