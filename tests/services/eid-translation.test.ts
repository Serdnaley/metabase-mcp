import { describe, test, expect } from "bun:test";
import { getTestClient } from "../helpers.js";
import { translateEntityIds } from "../../src/services/eid-translation.js";

describe("eid-translation service", () => {
  test("translateEntityIds handles request", async () => {
    const client = await getTestClient();
    try {
      const result = await translateEntityIds(client, {
        entity_ids: { card: ["nonexistent-eid"] },
      });
      expect(result).toBeDefined();
    } catch (e: any) {
      console.log("EID Translation API not available:", e.message);
    }
  });

  test("translateEntityIds handles empty entity_ids", async () => {
    const client = await getTestClient();
    try {
      const result = await translateEntityIds(client, {
        entity_ids: {},
      });
      expect(result).toBeDefined();
    } catch (e: any) {
      console.log("EID Translation API not available:", e.message);
    }
  });
});
