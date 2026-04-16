import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName } from "../helpers.js";
import { listSnippets, createSnippet, updateSnippet, deleteSnippet } from "../../src/services/snippets.js";

const cleanupIds: number[] = [];

describe("snippets service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupIds) {
      try { await deleteSnippet(client, id); } catch {}
    }
  });

  test("listSnippets returns array", async () => {
    const client = await getTestClient();
    const result = await listSnippets(client) as any;
    expect(result).toBeDefined();
    const items = Array.isArray(result) ? result : result.data ?? [];
    expect(Array.isArray(items)).toBe(true);
  });

  test("createSnippet creates a new snippet", async () => {
    const client = await getTestClient();
    const name = testName("snippet");
    const result = await createSnippet(client, { name, content: "SELECT 1" }) as any;
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe(name);
    expect(result.content).toBe("SELECT 1");
    cleanupIds.push(result.id);
  });

  test("updateSnippet updates content and description", async () => {
    const client = await getTestClient();
    const name = testName("snippet");
    const created = await createSnippet(client, { name, content: "SELECT 1" }) as any;
    cleanupIds.push(created.id);

    const updated = await updateSnippet(client, created.id, {
      content: "SELECT 2",
      description: "Updated description",
    }) as any;
    expect(updated).toBeDefined();
    expect(updated.content).toBe("SELECT 2");
    expect(updated.description).toBe("Updated description");
  });

  test("deleteSnippet archives the snippet", async () => {
    const client = await getTestClient();
    const name = testName("snippet");
    const created = await createSnippet(client, { name, content: "SELECT 1" }) as any;

    const result = await deleteSnippet(client, created.id) as any;
    expect(result).toBeDefined();
    expect(result.archived).toBe(true);
  });
});
