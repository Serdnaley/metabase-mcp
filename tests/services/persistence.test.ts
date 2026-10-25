import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, SAMPLE_DB_ID, testName } from "../helpers.js";
import { createCard, deleteCard } from "../../src/services/cards.js";
import { persistModel, unpersistModel, refreshPersistedModel } from "../../src/services/persistence.js";

// Model persistence needs a paid plan on 0.64 (402) and a database with persistence
// enabled; anything else (e.g. a wrong route) must fail the test.
const ENV_LIMITS = [/premium-feature-not-available|paid feature/i, /persist(ence|ing)? .*(not enabled|disabled)/i, /does(n't| not) support/i];
const isEnvLimit = (msg: string) => !/API endpoint does not exist/.test(msg) && ENV_LIMITS.some((re) => re.test(msg));

describe("persistence service", () => {
  let modelId: number;

  afterAll(async () => {
    const client = await getTestClient();
    if (modelId) { try { await deleteCard(client, modelId); } catch {} }
  });

  test("persist → refresh → unpersist a model", async () => {
    const client = await getTestClient();
    const model = (await createCard(client, {
      name: testName("persist-model"),
      type: "model",
      dataset_query: { type: "native", native: { query: "SELECT 1 AS id" }, database: SAMPLE_DB_ID },
      display: "table",
    })) as any;
    modelId = model.id;

    try {
      await persistModel(client, modelId);
    } catch (e: any) {
      if (!isEnvLimit(e.message)) throw e;
      console.log(`SKIP persistence lifecycle (environment): ${e.message.slice(0, 200)}`);
      return;
    }
    expect(await refreshPersistedModel(client, modelId)).toBeDefined();
    expect(await unpersistModel(client, modelId)).toEqual({ success: true });
  });
});
