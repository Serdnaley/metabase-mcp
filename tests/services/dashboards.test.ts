import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName, SAMPLE_DB_ID } from "../helpers.js";
import { listDashboards, getDashboard, createDashboard, updateDashboard, deleteDashboard, copyDashboard, updateDashboardCards, createDashboardPublicLink, deleteDashboardPublicLink } from "../../src/services/dashboards.js";
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

  test("updateDashboardCards with visualization_settings", async () => {
    const client = await getTestClient();
    // Create a pie chart card
    const pieCard = (await createCard(client, {
      name: testName("dash-pie-card"),
      display: "pie",
      dataset_query: {
        type: "native",
        native: { query: "SELECT PRODUCT_ID, COUNT(*) AS order_count FROM ORDERS GROUP BY PRODUCT_ID LIMIT 10" },
        database: SAMPLE_DB_ID,
      },
      visualization_settings: { "pie.dimension": "PRODUCT_ID", "pie.metric": "ORDER_COUNT" },
      collection_id: testCollectionId,
    })) as any;
    cleanupCardIds.push(pieCard.id);

    // Add card with per-dashcard visualization_settings override
    await updateDashboardCards(client, createdDashboardId, [
      { card_id: testCardId, row: 0, col: 0, size_x: 6, size_y: 4 },
      {
        card_id: pieCard.id, row: 0, col: 6, size_x: 6, size_y: 4,
        visualization_settings: { "card.title": "Orders by Product" },
      },
    ]);
    const dash = (await getDashboard(client, createdDashboardId)) as any;
    const dashcards = dash.dashcards || dash.ordered_cards || [];
    const pieDashcard = dashcards.find((dc: any) => dc.card_id === pieCard.id);
    expect(pieDashcard).toBeDefined();
  });

  test("updateDashboardCards with parameter_mappings", async () => {
    const client = await getTestClient();
    // Create a dashboard with a filter parameter
    const paramDash = (await createDashboard(client, {
      name: testName("param-dash"),
      collection_id: testCollectionId,
      parameters: [{
        id: "test-date-filter",
        name: "Date Filter",
        slug: "date_filter",
        type: "date/range",
      }],
    })) as any;
    cleanupDashboardIds.push(paramDash.id);

    // Create a card with a date template tag
    const dateCard = (await createCard(client, {
      name: testName("param-card"),
      display: "table",
      dataset_query: {
        type: "native",
        native: {
          query: "SELECT * FROM ORDERS WHERE CREATED_AT >= {{date_range}} LIMIT 5",
          "template-tags": {
            date_range: {
              id: "dr", name: "date_range", "display-name": "Date Range",
              type: "date", "widget-type": "date/range",
            },
          },
        },
        database: SAMPLE_DB_ID,
      },
      collection_id: testCollectionId,
    })) as any;
    cleanupCardIds.push(dateCard.id);

    // Add card with parameter_mappings connecting dashboard filter to card template tag
    await updateDashboardCards(client, paramDash.id, [{
      card_id: dateCard.id, row: 0, col: 0, size_x: 12, size_y: 6,
      parameter_mappings: [{
        parameter_id: "test-date-filter",
        card_id: dateCard.id,
        target: ["variable", ["template-tag", "date_range"]],
      }],
    }]);

    const dash = (await getDashboard(client, paramDash.id)) as any;
    const dashcards = dash.dashcards || dash.ordered_cards || [];
    expect(dashcards.length).toBe(1);
    const dc = dashcards[0];
    expect(dc.parameter_mappings).toBeDefined();
    expect(dc.parameter_mappings.length).toBe(1);
    expect(dc.parameter_mappings[0].parameter_id).toBe("test-date-filter");
  });

  test("updateDashboardCards with empty cards array clears cards", async () => {
    const client = await getTestClient();
    const dash = (await createDashboard(client, { name: testName("empty-cards-dash"), collection_id: testCollectionId })) as any;
    cleanupDashboardIds.push(dash.id);

    // Add a card first
    await updateDashboardCards(client, dash.id, [{ card_id: testCardId, row: 0, col: 0, size_x: 6, size_y: 4 }]);
    let fetched = (await getDashboard(client, dash.id)) as any;
    let dashcards = fetched.dashcards || fetched.ordered_cards || [];
    expect(dashcards.length).toBe(1);

    // Clear all cards with empty array
    await updateDashboardCards(client, dash.id, []);
    fetched = (await getDashboard(client, dash.id)) as any;
    dashcards = fetched.dashcards || fetched.ordered_cards || [];
    expect(dashcards.length).toBe(0);
  });

  test("copyDashboard with deep copy duplicates cards", async () => {
    const client = await getTestClient();
    const copy = (await copyDashboard(client, createdDashboardId, {
      name: testName("deep-copied-dashboard"),
      collection_id: testCollectionId,
      is_deep_copy: true,
    })) as any;
    expect(copy).toBeDefined();
    expect(copy.id).not.toBe(createdDashboardId);
    cleanupDashboardIds.push(copy.id);
  });

  test("getDashboard throws for non-existent dashboard", async () => {
    const client = await getTestClient();
    expect(getDashboard(client, 999999)).rejects.toThrow();
  });

  test("deleteDashboard throws for non-existent dashboard", async () => {
    const client = await getTestClient();
    expect(deleteDashboard(client, 999999)).rejects.toThrow();
  });

  test("copyDashboard copies the dashboard", async () => {
    const client = await getTestClient();
    const copy = (await copyDashboard(client, createdDashboardId, { name: testName("copied-dashboard"), collection_id: testCollectionId, is_deep_copy: false })) as any;
    expect(copy).toBeDefined();
    expect(copy.id).not.toBe(createdDashboardId);
    cleanupDashboardIds.push(copy.id);
  });

  test("createDashboardPublicLink generates a public link", async () => {
    const client = await getTestClient();
    // Enable public sharing first
    try {
      await client.PUT("/api/setting/{key}", {
        params: { path: { key: "enable-public-sharing" } },
        body: { value: true } as any,
      });
    } catch {}

    const dash = (await createDashboard(client, { name: testName("public-link-dash"), collection_id: testCollectionId })) as any;
    cleanupDashboardIds.push(dash.id);

    const result = (await createDashboardPublicLink(client, dash.id)) as any;
    expect(result).toBeDefined();
    const uuid = result.uuid ?? result.public_uuid;
    expect(uuid).toBeDefined();
    expect(typeof uuid).toBe("string");

    // Clean up: delete the public link
    const deleteResult = await deleteDashboardPublicLink(client, dash.id);
    expect(deleteResult).toEqual({ success: true });
  });

  test("deleteDashboard deletes a dashboard", async () => {
    const client = await getTestClient();
    const dash = (await createDashboard(client, { name: testName("delete-me-dash") })) as any;
    const result = await deleteDashboard(client, dash.id);
    expect(result).toEqual({ success: true });
  });
});
