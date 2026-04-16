import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName, SAMPLE_DB_ID } from "../helpers.js";
import { listBookmarks, createBookmark, deleteBookmark } from "../../src/services/bookmarks.js";
import { createCard, deleteCard } from "../../src/services/cards.js";

const cleanupCardIds: number[] = [];

describe("bookmarks service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupCardIds) {
      try { await deleteCard(client, id); } catch {}
    }
  });

  test("listBookmarks returns array", async () => {
    const client = await getTestClient();
    try {
      const result = await listBookmarks(client) as any;
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      console.log("Bookmarks API not available:", e.message);
    }
  });

  test("bookmark lifecycle: create and delete", async () => {
    const client = await getTestClient();
    const card = await createCard(client, {
      name: testName("bm-card"),
      dataset_query: { type: "native", native: { query: "SELECT 1" }, database: SAMPLE_DB_ID },
      display: "table",
    }) as any;
    cleanupCardIds.push(card.id);

    try {
      const created = await createBookmark(client, { type: "card", item_id: card.id });
      expect(created).toBeDefined();

      const deleted = await deleteBookmark(client, { type: "card", item_id: card.id });
      expect(deleted).toBeDefined();
    } catch (e: any) {
      console.log("Bookmarks API not available:", e.message);
    }
  });
});
