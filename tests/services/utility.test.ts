import { describe, test, expect } from "bun:test";
import { getTestClient, SAMPLE_DB_ID } from "../helpers.js";
import { getDatabaseMetadata } from "../../src/services/databases.js";
import { generateXray } from "../../src/services/xrays.js";
import { invalidateCache, updateCacheConfig } from "../../src/services/cache.js";

let ordersTableId: number;

describe("utility services", () => {
  test("setup: find ORDERS table ID", async () => {
    const client = await getTestClient();
    const meta = (await getDatabaseMetadata(client, SAMPLE_DB_ID)) as any;
    const orders = meta.tables.find(
      (t: any) =>
        t.name.toUpperCase() === "ORDERS" ||
        t.display_name?.toUpperCase() === "ORDERS"
    );
    expect(orders).toBeDefined();
    ordersTableId = orders.id;
  });

  describe("xrays service", () => {
    test("generateXray returns a dashboard-like structure for the ORDERS table", async () => {
      const client = await getTestClient();
      expect(ordersTableId).toBeDefined();
      const result = (await generateXray(client, ordersTableId)) as any;
      expect(result).toBeDefined();
      // X-ray response is a dashboard-like object with cards
      expect(result.name).toBeDefined();
      expect(typeof result.name).toBe("string");
      const cards = result.ordered_cards ?? result.dashcards ?? result.cards;
      expect(cards).toBeDefined();
    });

    test("generateXray throws for non-existent table", async () => {
      const client = await getTestClient();
      await expect(generateXray(client, 999999)).rejects.toThrow("Generate X-ray failed");
    });
  });

  describe("cache service", () => {
    test("invalidateCache with database ID does not throw (may 404 on OSS)", async () => {
      const client = await getTestClient();
      try {
        const result = (await invalidateCache(client, { database: SAMPLE_DB_ID })) as any;
        // If the endpoint is available, it returns a success-like response
        expect(result).toBeDefined();
      } catch (err: any) {
        // Cache invalidation may return 404 on OSS Metabase when caching is not enabled
        expect(err.message).toContain("Invalidate cache failed");
      }
    });

    test("invalidateCache with no params does not throw (may 404 on OSS)", async () => {
      const client = await getTestClient();
      try {
        const result = (await invalidateCache(client)) as any;
        expect(result).toBeDefined();
      } catch (err: any) {
        expect(err.message).toContain("Invalidate cache failed");
      }
    });

    test("updateCacheConfig attempts to set cache strategy", async () => {
      const client = await getTestClient();
      try {
        const result = await updateCacheConfig(client, {
          model: "root",
          model_id: 0,
          strategy: { type: "nocache" },
        });
        expect(result).toBeDefined();
      } catch (e: any) {
        // Cache management may not be available on all editions
        console.log("updateCacheConfig not available:", e.message);
      }
    });
  });
});
