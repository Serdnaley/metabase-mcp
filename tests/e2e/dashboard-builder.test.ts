import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName, SAMPLE_DB_ID } from "../helpers.js";
import { createCollection, updateCollection } from "../../src/services/collections.js";
import { createCard, deleteCard } from "../../src/services/cards.js";
import { createDashboard, getDashboard, updateDashboardCards, deleteDashboard } from "../../src/services/dashboards.js";

const cleanupDashIds: number[] = [];
const cleanupCardIds: number[] = [];
const cleanupColIds: number[] = [];

describe("E2E: dashboard builder", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupDashIds) { try { await deleteDashboard(client, id); } catch {} }
    for (const id of cleanupCardIds) { try { await deleteCard(client, id); } catch {} }
    for (const id of cleanupColIds) { try { await updateCollection(client, id, { archived: true }); } catch {} }
  });

  let collectionId: number;
  let card1Id: number;
  let card2Id: number;
  let dashboardId: number;

  test("1. create a collection for the dashboard", async () => {
    const client = await getTestClient();
    const col = (await createCollection(client, {
      name: testName("dashboard-project"),
      description: "Dashboard builder E2E test",
    })) as any;
    collectionId = col.id;
    cleanupColIds.push(collectionId);
    expect(collectionId).toBeDefined();
  });

  test("2. create first card — order count", async () => {
    const client = await getTestClient();
    const card = (await createCard(client, {
      name: testName("order-count"), display: "scalar",
      dataset_query: { type: "native", native: { query: "SELECT COUNT(*) FROM ORDERS" }, database: SAMPLE_DB_ID },
      collection_id: collectionId,
    })) as any;
    card1Id = card.id;
    cleanupCardIds.push(card1Id);
    expect(card1Id).toBeDefined();
  });

  test("3. create second card — revenue by month", async () => {
    const client = await getTestClient();
    const card = (await createCard(client, {
      name: testName("revenue-monthly"), display: "line",
      dataset_query: {
        type: "native",
        native: { query: "SELECT EXTRACT(MONTH FROM CREATED_AT) AS month, SUM(TOTAL) AS revenue FROM ORDERS GROUP BY month ORDER BY month" },
        database: SAMPLE_DB_ID,
      },
      collection_id: collectionId,
    })) as any;
    card2Id = card.id;
    cleanupCardIds.push(card2Id);
    expect(card2Id).toBeDefined();
  });

  test("4. create dashboard in the collection", async () => {
    const client = await getTestClient();
    const dash = (await createDashboard(client, {
      name: testName("sales-dashboard"),
      description: "Sales overview dashboard",
      collection_id: collectionId,
    })) as any;
    dashboardId = dash.id;
    cleanupDashIds.push(dashboardId);
    expect(dashboardId).toBeDefined();
  });

  test("5. add both cards to dashboard with layout", async () => {
    const client = await getTestClient();
    await updateDashboardCards(client, dashboardId, [
      { card_id: card1Id, row: 0, col: 0, size_x: 4, size_y: 3 },
      { card_id: card2Id, row: 0, col: 4, size_x: 8, size_y: 6 },
    ]);

    const dash = (await getDashboard(client, dashboardId)) as any;
    const dashcards = dash.dashcards || dash.ordered_cards || [];
    expect(dashcards.length).toBe(2);

    const scalar = dashcards.find((dc: any) => dc.card_id === card1Id);
    expect(scalar).toBeDefined();
    expect(scalar.size_x).toBe(4);

    const line = dashcards.find((dc: any) => dc.card_id === card2Id);
    expect(line).toBeDefined();
    expect(line.col).toBe(4);
    expect(line.size_x).toBe(8);
  });

  test("6. verify dashboard is complete", async () => {
    const client = await getTestClient();
    const dash = (await getDashboard(client, dashboardId)) as any;
    expect(dash.name).toContain("sales-dashboard");
    expect(dash.description).toBe("Sales overview dashboard");
    expect(dash.collection_id).toBe(collectionId);
  });
});
