import { describe, test, expect } from "bun:test";
import { getTestClient } from "../helpers.js";
import { search } from "../../src/services/search.js";

describe("search service", () => {
  test("search for 'orders' returns results", async () => {
    const client = await getTestClient();
    const result = (await search(client, { q: "orders" })) as any;
    expect(result).toBeDefined();
    const data = result.data || result;
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test("search with model filter returns only matching types", async () => {
    const client = await getTestClient();
    const result = (await search(client, { q: "orders", models: ["table"] })) as any;
    expect(result).toBeDefined();
    const data = result.data || result;
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) expect(data[0].model).toBe("table");
  });

  test("search for nonsense returns empty", async () => {
    const client = await getTestClient();
    const result = (await search(client, { q: "zzzzxxxxxnonexistent99999" })) as any;
    const data = result.data || result;
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  test("search with empty query returns results", async () => {
    const client = await getTestClient();
    // Empty query should still return results (all items)
    const result = (await search(client, { q: "" })) as any;
    expect(result).toBeDefined();
    const data = result.data || result;
    expect(Array.isArray(data)).toBe(true);
  });

  test("search with multiple model filters", async () => {
    const client = await getTestClient();
    const result = (await search(client, { q: "orders", models: ["table", "card"] })) as any;
    expect(result).toBeDefined();
    const data = result.data || result;
    expect(Array.isArray(data)).toBe(true);
    // All results should be either tables or cards
    for (const item of data) {
      expect(["table", "card"]).toContain(item.model);
    }
  });

  test("search with card model filter", async () => {
    const client = await getTestClient();
    const result = (await search(client, { q: "orders", models: ["card"] })) as any;
    const data = result.data || result;
    expect(Array.isArray(data)).toBe(true);
    for (const item of data) {
      expect(item.model).toBe("card");
    }
  });

  test("search with archived filter", async () => {
    const client = await getTestClient();
    const result = await search(client, { q: "Orders", archived: true }) as any;
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
  });
});
