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
});
