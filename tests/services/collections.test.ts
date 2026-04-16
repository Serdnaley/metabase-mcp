import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName } from "../helpers.js";
import { listCollections, getCollection, listCollectionItems, createCollection, updateCollection, getCollectionTree } from "../../src/services/collections.js";

const cleanupIds: number[] = [];

describe("collections service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupIds) {
      try { await updateCollection(client, id, { archived: true }); } catch {}
    }
  });

  let createdId: number;

  test("createCollection creates a new collection", async () => {
    const client = await getTestClient();
    const name = testName("test-collection");
    const result = (await createCollection(client, { name, description: "Test collection for integration tests" })) as any;
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe(name);
    createdId = result.id;
    cleanupIds.push(createdId);
  });

  test("getCollection returns the created collection", async () => {
    const client = await getTestClient();
    const result = (await getCollection(client, createdId)) as any;
    expect(result).toBeDefined();
    expect(result.id).toBe(createdId);
    expect(result.description).toBe("Test collection for integration tests");
  });

  test("listCollections includes the created collection", async () => {
    const client = await getTestClient();
    const result = (await listCollections(client)) as any;
    const collections = Array.isArray(result) ? result : result.data || [];
    const found = collections.find((c: any) => c.id === createdId);
    expect(found).toBeDefined();
  });

  test("updateCollection updates name and description", async () => {
    const client = await getTestClient();
    const newName = testName("updated-collection");
    const result = (await updateCollection(client, createdId, { name: newName, description: "Updated description" })) as any;
    expect(result).toBeDefined();
    expect(result.name).toBe(newName);
    const fetched = (await getCollection(client, createdId)) as any;
    expect(fetched.name).toBe(newName);
    expect(fetched.description).toBe("Updated description");
  });

  test("listCollectionItems returns items", async () => {
    const client = await getTestClient();
    const result = await listCollectionItems(client, createdId);
    expect(result).toBeDefined();
    const data = (result as any).data || result;
    const items = Array.isArray(data) ? data : [];
    expect(items.length).toBe(0);
  });

  test("createCollection with parent creates nested collection", async () => {
    const client = await getTestClient();
    const name = testName("child-collection");
    const child = (await createCollection(client, { name, parent_id: createdId })) as any;
    expect(child).toBeDefined();
    expect(child.id).toBeDefined();
    cleanupIds.push(child.id);
    const items = (await listCollectionItems(client, createdId)) as any;
    const itemsData = items.data || items;
    const list = Array.isArray(itemsData) ? itemsData : [];
    const found = list.find((i: any) => i.id === child.id);
    expect(found).toBeDefined();
  });

  test("listCollectionItems with model filter", async () => {
    const client = await getTestClient();
    // Should return empty when filtering for a model type that doesn't exist in the collection
    const result = (await listCollectionItems(client, createdId, { models: ["dashboard"] })) as any;
    expect(result).toBeDefined();
    const data = (result as any).data || result;
    const items = Array.isArray(data) ? data : [];
    // All items should be dashboards (or empty)
    for (const item of items) {
      expect(item.model).toBe("dashboard");
    }
  });

  test("listCollectionItems with sort parameters", async () => {
    const client = await getTestClient();
    const result = (await listCollectionItems(client, createdId, {
      sort_column: "name",
      sort_direction: "asc",
    })) as any;
    expect(result).toBeDefined();
  });

  test("getCollectionTree returns tree structure", async () => {
    const client = await getTestClient();
    const result = await getCollectionTree(client) as any;
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test("getCollection throws for non-existent collection", async () => {
    const client = await getTestClient();
    await expect(getCollection(client, 999999)).rejects.toThrow();
  });

  test("updateCollection archives the collection", async () => {
    const client = await getTestClient();
    await updateCollection(client, createdId, { archived: true });
    const result = (await getCollection(client, createdId)) as any;
    expect(result.archived).toBe(true);
  });
});
