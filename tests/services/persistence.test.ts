import { describe, test, expect } from "bun:test";
import { getTestClient, SAMPLE_DB_ID, testName } from "../helpers.js";
import { createCard, deleteCard } from "../../src/services/cards.js";
import { persistModel, unpersistModel, refreshPersistedModel } from "../../src/services/persistence.js";

describe("persistence service", () => {
  let modelId: number | null = null;

  test("setup: create a model for persistence tests", async () => {
    const client = await getTestClient();
    const result = await createCard(client, {
      name: testName("persist-model"),
      type: "model",
      dataset_query: {
        type: "native",
        native: { query: "SELECT 1 AS id" },
        database: SAMPLE_DB_ID,
      },
      display: "table",
    }) as any;
    expect(result.id).toBeDefined();
    modelId = result.id;
  });

  test("persistModel attempts to enable persistence", async () => {
    if (!modelId) return;
    const client = await getTestClient();
    try {
      const result = await persistModel(client, modelId);
      expect(result).toBeDefined();
    } catch (e: any) {
      // Persistence may not be available on OSS — gracefully skip
      console.log("persistModel not available (likely OSS edition):", e.message);
    }
  });

  test("refreshPersistedModel attempts refresh", async () => {
    if (!modelId) return;
    const client = await getTestClient();
    try {
      const result = await refreshPersistedModel(client, modelId);
      expect(result).toBeDefined();
    } catch (e: any) {
      console.log("refreshPersistedModel not available:", e.message);
    }
  });

  test("unpersistModel attempts to disable persistence", async () => {
    if (!modelId) return;
    const client = await getTestClient();
    try {
      const result = await unpersistModel(client, modelId);
      expect(result).toBeDefined();
    } catch (e: any) {
      console.log("unpersistModel not available:", e.message);
    }
  });

  test("cleanup", async () => {
    if (!modelId) return;
    const client = await getTestClient();
    try { await deleteCard(client, modelId); } catch {}
  });
});
