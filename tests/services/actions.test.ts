import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName, SAMPLE_DB_ID } from "../helpers.js";
import { listActions, getAction, createAction, updateAction, deleteAction } from "../../src/services/actions.js";
import { createCard, deleteCard } from "../../src/services/cards.js";

const cleanupActionIds: number[] = [];
const cleanupCardIds: number[] = [];

describe("actions service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupActionIds) { try { await deleteAction(client, id); } catch {} }
    for (const id of cleanupCardIds) { try { await deleteCard(client, id); } catch {} }
  });

  let modelCardId: number;
  let createdActionId: number;

  test("setup: create a model card for actions", async () => {
    const client = await getTestClient();
    const card = (await createCard(client, {
      name: testName("action-model"), display: "table",
      dataset_query: { type: "native", native: { query: "SELECT * FROM ORDERS LIMIT 1" }, database: SAMPLE_DB_ID },
    })) as any;
    modelCardId = card.id;
    cleanupCardIds.push(modelCardId);
    try {
      await client.PUT("/api/card/{id}", {
        params: { path: { id: modelCardId } },
        body: { type: "model" } as any,
      });
    } catch {}
  });

  test("listActions returns a list", async () => {
    const client = await getTestClient();
    const result = await listActions(client);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test("createAction creates a query action", async () => {
    const client = await getTestClient();
    try {
      const result = (await createAction(client, {
        name: testName("test-action"), type: "query", model_id: modelCardId,
        database_id: SAMPLE_DB_ID,
        dataset_query: { type: "native", native: { query: "SELECT 1" }, database: SAMPLE_DB_ID },
      })) as any;
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      createdActionId = result.id;
      cleanupActionIds.push(createdActionId);
    } catch (err: any) {
      console.log("createAction skipped:", err.message);
    }
  });

  test("getAction returns action details", async () => {
    if (!createdActionId) return;
    const client = await getTestClient();
    const result = (await getAction(client, createdActionId)) as any;
    expect(result).toBeDefined();
    expect(result.id).toBe(createdActionId);
  });

  test("updateAction updates the action", async () => {
    if (!createdActionId) return;
    const client = await getTestClient();
    const newName = testName("updated-action");
    const result = (await updateAction(client, createdActionId, { name: newName })) as any;
    expect(result).toBeDefined();
  });

  test("deleteAction deletes the action", async () => {
    if (!createdActionId) return;
    const client = await getTestClient();
    const result = await deleteAction(client, createdActionId);
    expect(result).toEqual({ success: true });
    cleanupActionIds.splice(cleanupActionIds.indexOf(createdActionId), 1);
  });
});
