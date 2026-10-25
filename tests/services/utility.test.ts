import { describe, test, expect } from "bun:test";
import { getTestClient, SAMPLE_DB_ID, skipOnEnvError } from "../helpers.js";
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
    // Cache invalidation is a paid feature (402 on OSS); a wrong route must still fail
    const PAID = [/premium-feature-not-available|paid feature/i];

    test("invalidateCache with database ID", async () => {
      const client = await getTestClient();
      await skipOnEnvError("invalidateCache(db)", PAID, async () => {
        expect(await invalidateCache(client, { database: SAMPLE_DB_ID })).toBeDefined();
      });
    });

    test("invalidateCache with no params", async () => {
      const client = await getTestClient();
      await skipOnEnvError("invalidateCache()", PAID, async () => {
        expect(await invalidateCache(client)).toBeDefined();
      });
    });

    test("updateCacheConfig sets the root cache strategy", async () => {
      const client = await getTestClient();
      const result = await updateCacheConfig(client, {
        model: "root",
        model_id: 0,
        strategy: { type: "nocache" },
      });
      expect(result).toBeDefined();
    });
  });
});
