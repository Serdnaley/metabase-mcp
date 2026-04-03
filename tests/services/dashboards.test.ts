import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName, SAMPLE_DB_ID } from "../helpers.js";
import { listDashboards, getDashboard, createDashboard, updateDashboard, deleteDashboard, copyDashboard, updateDashboardCards } from "../../src/services/dashboards.js";
import { createCard, deleteCard } from "../../src/services/cards.js";
import { createCollection, updateCollection } from "../../src/services/collections.js";

const cleanupDashboardIds: number[] = [];
const cleanupCardIds: number[] = [];
const cleanupCollectionIds: number[] = [];

describe("dashboards service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupDashboardIds) { try { await deleteDashboard(client, id); } catch {} }
    for (const id of cleanupCardIds) { try { await deleteCard(client, id); } catch {} }
    for (const id of cleanupCollectionIds) { try { await updateCollection(client, id, { archived: true }); } catch {} }
  });

  let createdDashboardId: number;
  let testCardId: number;
  let testCollectionId: number;

  test("setup: create test collection and card", async () => {
    const client = await getTestClient();
    const col = (await createCollection(client, { name: testName("dash-test-col") })) as any;
    testCollectionId = col.id;
    cleanupCollectionIds.push(testCollectionId);
    const card = (await createCard(client, {
      name: testName("dash-test-card"), display: "table",
      dataset_query: { type: "native", native: { query: "SELECT * FROM ORDERS LIMIT 10" }, database: SAMPLE_DB_ID },
      collection_id: testCollectionId,
    })) as any;
    testCardId = card.id;
    cleanupCardIds.push(testCardId);
  });

  test("createDashboard creates a new dashboard", async () => {
    const client = await getTestClient();
    const name = testName("test-dashboard");
    const result = (await createDashboard(client, { name, description: "Test dashboard", collection_id: testCollectionId })) as any;
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe(name);
    createdDashboardId = result.id;
    cleanupDashboardIds.push(createdDashboardId);
  });

  test("getDashboard returns the created dashboard", async () => {
    const client = await getTestClient();
    const result = (await getDashboard(client, createdDashboardId)) as any;
    expect(result).toBeDefined();
    expect(result.id).toBe(createdDashboardId);
    expect(result.description).toBe("Test dashboard");
  });

  test("listDashboards includes the created dashboard", async () => {
    const client = await getTestClient();
    const result = (await listDashboards(client)) as any;
    const dashboards = Array.isArray(result) ? result : result.data || [];
    const found = dashboards.find((d: any) => d.id === createdDashboardId);
    expect(found).toBeDefined();
  });

  test("updateDashboard updates properties", async () => {
    const client = await getTestClient();
    const newName = testName("updated-dashboard");
    await updateDashboard(client, createdDashboardId, { name: newName, description: "Updated description" });
    const fetched = (await getDashboard(client, createdDashboardId)) as any;
    expect(fetched.name).toBe(newName);
    expect(fetched.description).toBe("Updated description");
  });

  test("updateDashboardCards adds a card to the dashboard", async () => {
    const client = await getTestClient();
    await updateDashboardCards(client, createdDashboardId, [{ card_id: testCardId, row: 0, col: 0, size_x: 6, size_y: 4 }]);
    const dash = (await getDashboard(client, createdDashboardId)) as any;
    const dashcards = dash.dashcards || dash.ordered_cards || [];
    expect(dashcards.length).toBeGreaterThan(0);
    const found = dashcards.find((dc: any) => dc.card_id === testCardId);
    expect(found).toBeDefined();
  });

  test("copyDashboard copies the dashboard", async () => {
    const client = await getTestClient();
    const copy = (await copyDashboard(client, createdDashboardId, { name: testName("copied-dashboard"), collection_id: testCollectionId, is_deep_copy: false })) as any;
    expect(copy).toBeDefined();
    expect(copy.id).not.toBe(createdDashboardId);
    cleanupDashboardIds.push(copy.id);
  });

  test("deleteDashboard deletes a dashboard", async () => {
    const client = await getTestClient();
    const dash = (await createDashboard(client, { name: testName("delete-me-dash") })) as any;
    const result = await deleteDashboard(client, dash.id);
    expect(result).toEqual({ success: true });
  });
});
