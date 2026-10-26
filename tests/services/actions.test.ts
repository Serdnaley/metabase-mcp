import { describe, test, expect, afterAll, beforeAll } from "bun:test";
import { getTestClient, testName, getWarehouseDbId } from "../helpers.js";
import {
  listActions,
  getAction,
  createAction,
  updateAction,
  deleteAction,
  executeAction,
} from "../../src/services/actions.js";
import { createCard, deleteCard } from "../../src/services/cards.js";

// Actions need a database with actions enabled and a writable engine. The SQLite sample DB
// can't do them (0.64) and H2 isn't allowed, so they run against the Postgres "Test Warehouse"
// and skip explicitly when it isn't there.
const cleanupActionIds: number[] = [];
const cleanupCardIds: number[] = [];
let warehouseId: number | null = null;

const needsWarehouse = (name: string) => {
  if (warehouseId) return false;
  console.log(`SKIP ${name} (environment): no Postgres Test Warehouse`);
  return true;
};

describe("actions service", () => {
  beforeAll(async () => {
    warehouseId = await getWarehouseDbId();
  });

  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupActionIds) {
      try { await deleteAction(client, id); } catch {}
    }
    for (const id of cleanupCardIds) {
      try { await deleteCard(client, id); } catch {}
    }
  });

  let modelCardId: number;
  let createdActionId: number;

  test("listActions returns a list", async () => {
    const client = await getTestClient();
    const result = await listActions(client);
    expect(Array.isArray(result)).toBe(true);
  });

  test("setup: enable actions on the warehouse and create a model", async () => {
    if (needsWarehouse("action setup")) return;
    const client = await getTestClient();
    const { error } = await client.PUT("/api/database/{id}", {
      params: { path: { id: warehouseId! } },
      body: { settings: { "database-enable-actions": true } } as any,
    });
    expect(error).toBeUndefined();
    const card = (await createCard(client, {
      name: testName("action-model"),
      display: "table",
      dataset_query: { type: "native", native: { query: "SELECT 1 AS id" }, database: warehouseId! },
    })) as any;
    modelCardId = card.id;
    cleanupCardIds.push(modelCardId);
    const { error: modelError } = await client.PUT("/api/card/{id}", {
      params: { path: { id: modelCardId } },
      body: { type: "model" } as any,
    });
    expect(modelError).toBeUndefined();
  });

  test("createAction creates a query action", async () => {
    if (needsWarehouse("createAction")) return;
    const client = await getTestClient();
    const result = (await createAction(client, {
      name: testName("test-action"),
      type: "query",
      model_id: modelCardId,
      database_id: warehouseId,
      dataset_query: {
        type: "native",
        native: { query: "CREATE TABLE IF NOT EXISTS mcp_test_action_probe (id int)" },
        database: warehouseId,
      },
      parameters: [],
      visualization_settings: {},
    })) as any;
    expect(result.id).toBeNumber();
    createdActionId = result.id;
    cleanupActionIds.push(createdActionId);
  });

  test("getAction returns action details", async () => {
    if (needsWarehouse("getAction")) return;
    const client = await getTestClient();
    const result = (await getAction(client, createdActionId)) as any;
    expect(result.id).toBe(createdActionId);
    expect(result.model_id).toBe(modelCardId);
  });

  test("updateAction updates the action", async () => {
    if (needsWarehouse("updateAction")) return;
    const client = await getTestClient();
    const newName = testName("updated-action");
    const result = (await updateAction(client, createdActionId, { name: newName })) as any;
    expect(result.name).toBe(newName);
  });

  test("executeAction executes the action", async () => {
    if (needsWarehouse("executeAction")) return;
    const client = await getTestClient();
    const result = (await executeAction(client, createdActionId)) as any;
    expect(result).toHaveProperty("rows-affected");
  });

  test("listActions with model_id filter returns the action", async () => {
    if (needsWarehouse("listActions by model")) return;
    const client = await getTestClient();
    const result = (await listActions(client, { model_id: modelCardId })) as any[];
    expect(result.some((a) => a.id === createdActionId)).toBe(true);
  });

  test("createAction with http type is rejected", async () => {
    if (needsWarehouse("http action")) return;
    const client = await getTestClient();
    await expect(
      createAction(client, { name: testName("http-action"), type: "http", model_id: modelCardId })
    ).rejects.toThrow();
  });

  test("deleteAction deletes the action", async () => {
    if (needsWarehouse("deleteAction")) return;
    const client = await getTestClient();
    const result = await deleteAction(client, createdActionId);
    expect(result).toEqual({ success: true });
    cleanupActionIds.splice(cleanupActionIds.indexOf(createdActionId), 1);
    await expect(getAction(client, createdActionId)).rejects.toThrow();
  });

  test("getAction throws for non-existent action", async () => {
    const client = await getTestClient();
    await expect(getAction(client, 999999)).rejects.toThrow();
  });
});
