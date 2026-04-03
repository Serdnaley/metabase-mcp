import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName, SAMPLE_DB_ID } from "../helpers.js";
import { listCards, getCard, createCard, updateCard, deleteCard, copyCard, executeCardQuery } from "../../src/services/cards.js";
import { createCollection, updateCollection } from "../../src/services/collections.js";

const cleanupCardIds: number[] = [];
const cleanupCollectionIds: number[] = [];

describe("cards service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupCardIds) { try { await deleteCard(client, id); } catch {} }
    for (const id of cleanupCollectionIds) { try { await updateCollection(client, id, { archived: true }); } catch {} }
  });

  let createdCardId: number;
  let testCollectionId: number;

  test("setup: create test collection", async () => {
    const client = await getTestClient();
    const col = (await createCollection(client, { name: testName("cards-test-col") })) as any;
    testCollectionId = col.id;
    cleanupCollectionIds.push(testCollectionId);
  });

  test("createCard creates a native SQL question", async () => {
    const client = await getTestClient();
    const name = testName("test-question");
    const result = (await createCard(client, {
      name, display: "table",
      dataset_query: { type: "native", native: { query: "SELECT COUNT(*) FROM ORDERS" }, database: SAMPLE_DB_ID },
      collection_id: testCollectionId, description: "Test question",
    })) as any;
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe(name);
    createdCardId = result.id;
    cleanupCardIds.push(createdCardId);
  });

  test("getCard returns the created card", async () => {
    const client = await getTestClient();
    const result = (await getCard(client, createdCardId)) as any;
    expect(result).toBeDefined();
    expect(result.id).toBe(createdCardId);
    expect(result.description).toBe("Test question");
  });

  test("listCards includes the created card", async () => {
    const client = await getTestClient();
    const result = (await listCards(client)) as any;
    const cards = Array.isArray(result) ? result : result.data || [];
    const found = cards.find((c: any) => c.id === createdCardId);
    expect(found).toBeDefined();
  });

  test("updateCard updates name and description", async () => {
    const client = await getTestClient();
    const newName = testName("updated-question");
    await updateCard(client, createdCardId, { name: newName, description: "Updated description" });
    const fetched = (await getCard(client, createdCardId)) as any;
    expect(fetched.name).toBe(newName);
    expect(fetched.description).toBe("Updated description");
  });

  test("executeCardQuery runs the question and returns data", async () => {
    const client = await getTestClient();
    const result = (await executeCardQuery(client, createdCardId)) as any;
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.rows).toBeDefined();
    expect(result.data.rows.length).toBeGreaterThan(0);
  });

  test("executeCardQuery with date parameters", async () => {
    const client = await getTestClient();
    // Create a card with required date template tags
    const card = (await createCard(client, {
      name: testName("date-param-card"),
      display: "table",
      dataset_query: {
        type: "native",
        native: {
          query: "SELECT * FROM ORDERS WHERE CREATED_AT >= {{fromDate}} AND CREATED_AT < {{toDate}}",
          "template-tags": {
            fromDate: { id: "from", name: "fromDate", "display-name": "From Date", type: "date" },
            toDate: { id: "to", name: "toDate", "display-name": "To Date", type: "date" },
          },
        },
        database: SAMPLE_DB_ID,
      },
    })) as any;
    cleanupCardIds.push(card.id);

    // Execute with date parameter values
    const result = (await executeCardQuery(client, card.id, {
      parameter_values: { fromDate: "2024-01-01", toDate: "2025-01-01" },
    })) as any;
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.rows).toBeDefined();
  });

  test("executeCardQuery with text parameter", async () => {
    const client = await getTestClient();
    const card = (await createCard(client, {
      name: testName("text-param-card"),
      display: "table",
      dataset_query: {
        type: "native",
        native: {
          query: "SELECT * FROM ORDERS WHERE TOTAL > {{minTotal}}",
          "template-tags": {
            minTotal: { id: "min", name: "minTotal", "display-name": "Min Total", type: "number" },
          },
        },
        database: SAMPLE_DB_ID,
      },
    })) as any;
    cleanupCardIds.push(card.id);

    const result = (await executeCardQuery(client, card.id, {
      parameter_values: { minTotal: 100 },
    })) as any;
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.rows).toBeDefined();
    expect(result.data.rows.length).toBeGreaterThan(0);
  });

  test("executeCardQuery with multiple mixed parameters", async () => {
    const client = await getTestClient();
    const card = (await createCard(client, {
      name: testName("multi-param-card"),
      display: "table",
      dataset_query: {
        type: "native",
        native: {
          query: "SELECT * FROM ORDERS WHERE CREATED_AT >= {{fromDate}} AND TOTAL > {{minTotal}} LIMIT 10",
          "template-tags": {
            fromDate: { id: "from", name: "fromDate", "display-name": "From Date", type: "date" },
            minTotal: { id: "min", name: "minTotal", "display-name": "Min Total", type: "number" },
          },
        },
        database: SAMPLE_DB_ID,
      },
    })) as any;
    cleanupCardIds.push(card.id);

    const result = (await executeCardQuery(client, card.id, {
      parameter_values: { fromDate: "2020-01-01", minTotal: 50 },
    })) as any;
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.rows).toBeDefined();
    expect(result.data.rows.length).toBeGreaterThan(0);
    expect(result.data.rows.length).toBeLessThanOrEqual(10);
  });

  test("copyCard copies the card", async () => {
    const client = await getTestClient();
    const copy = (await copyCard(client, createdCardId, { collection_id: testCollectionId })) as any;
    expect(copy).toBeDefined();
    expect(copy.id).toBeDefined();
    expect(copy.id).not.toBe(createdCardId);
    cleanupCardIds.push(copy.id);
  });

  test("deleteCard deletes the card", async () => {
    const client = await getTestClient();
    const card = (await createCard(client, {
      name: testName("delete-me"), display: "table",
      dataset_query: { type: "native", native: { query: "SELECT 1" }, database: SAMPLE_DB_ID },
    })) as any;
    const result = await deleteCard(client, card.id);
    expect(result).toEqual({ success: true });
  });
});
