import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName, SAMPLE_DB_ID } from "../helpers.js";
import { createCollection, getCollection, listCollectionItems, updateCollection } from "../../src/services/collections.js";
import { createCard, getCard, updateCard, deleteCard } from "../../src/services/cards.js";
import { createDashboard, getDashboard, copyDashboard, deleteDashboard } from "../../src/services/dashboards.js";

const cleanupDashIds: number[] = [];
const cleanupCardIds: number[] = [];
const cleanupColIds: number[] = [];

describe("E2E: content management", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupDashIds) { try { await deleteDashboard(client, id); } catch {} }
    for (const id of cleanupCardIds) { try { await deleteCard(client, id); } catch {} }
    for (const id of [...cleanupColIds].reverse()) { try { await updateCollection(client, id, { archived: true }); } catch {} }
  });

  let col1Id: number;
  let col2Id: number;
  let cardId: number;
  let dashId: number;

  test("1. create two collections", async () => {
    const client = await getTestClient();
    const col1 = (await createCollection(client, { name: testName("source-col") })) as any;
    col1Id = col1.id;
    cleanupColIds.push(col1Id);

    const col2 = (await createCollection(client, { name: testName("target-col") })) as any;
    col2Id = col2.id;
    cleanupColIds.push(col2Id);
  });

  test("2. create card and dashboard in source collection", async () => {
    const client = await getTestClient();
    const card = (await createCard(client, {
      name: testName("movable-card"), display: "table",
      dataset_query: { type: "native", native: { query: "SELECT 1 AS val" }, database: SAMPLE_DB_ID },
      collection_id: col1Id,
    })) as any;
    cardId = card.id;
    cleanupCardIds.push(cardId);

    const dash = (await createDashboard(client, {
      name: testName("movable-dash"), collection_id: col1Id,
    })) as any;
    dashId = dash.id;
    cleanupDashIds.push(dashId);
  });

  test("3. move card to target collection", async () => {
    const client = await getTestClient();
    await updateCard(client, cardId, { collection_id: col2Id });
    const fetched = (await getCard(client, cardId)) as any;
    expect(fetched.collection_id).toBe(col2Id);
  });

  test("4. copy dashboard to target collection", async () => {
    const client = await getTestClient();
    const copy = (await copyDashboard(client, dashId, {
      name: testName("copied-dash"), collection_id: col2Id, is_deep_copy: false,
    })) as any;
    expect(copy.id).toBeDefined();
    cleanupDashIds.push(copy.id);

    const fetched = (await getDashboard(client, copy.id)) as any;
    expect(fetched.collection_id).toBe(col2Id);
  });

  test("5. verify target collection has both items", async () => {
    const client = await getTestClient();
    const items = (await listCollectionItems(client, col2Id)) as any;
    const data = items.data || items;
    const list = Array.isArray(data) ? data : [];
    expect(list.length).toBeGreaterThanOrEqual(2);
  });

  test("6. archive source collection", async () => {
    const client = await getTestClient();
    await updateCollection(client, col1Id, { archived: true });
    const fetched = (await getCollection(client, col1Id)) as any;
    expect(fetched.archived).toBe(true);
  });

  test("7. delete the original dashboard", async () => {
    const client = await getTestClient();
    const result = await deleteDashboard(client, dashId);
    expect(result).toEqual({ success: true });
    cleanupDashIds.splice(cleanupDashIds.indexOf(dashId), 1);
  });
});
