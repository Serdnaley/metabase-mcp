import { describe, test, expect, afterAll } from "bun:test";
import { createMetabaseClient } from "../../src/client.js";
import { getSetupState, getTestClient, SAMPLE_DB_ID, testName } from "../helpers.js";
import { listApiKeys, createApiKey, updateApiKey, regenerateApiKey, deleteApiKey } from "../../src/services/api-keys.js";
import {
  getEmbeddingStatus,
  setStaticEmbedding,
  setResourceEmbedding,
  createEmbedUrl,
  signEmbedToken,
} from "../../src/services/embedding.js";
import {
  listTasks,
  getTask,
  listTaskTypes,
  listTaskRuns,
  getSchedulerInfo,
  getServerLogs,
  listLogPresets,
  setLogLevels,
  resetLogLevels,
  getPremiumTokenStatus,
} from "../../src/services/diagnostics.js";
import { listGroups, createGroup, deleteGroup } from "../../src/services/users.js";
import { createCard, deleteCard } from "../../src/services/cards.js";

const cleanup: Array<() => Promise<unknown>> = [];

describe("api keys", () => {
  afterAll(async () => {
    for (const f of cleanup.reverse()) await f().catch(() => {});
  });

  test("create, list, update, regenerate, delete", async () => {
    const client = await getTestClient();
    const groups = (await listGroups(client)) as any[];
    const target = (await createGroup(client, { name: testName("apikey-group") })) as any;
    cleanup.push(() => deleteGroup(client, target.id));

    const created = await createApiKey(client, { name: testName("mcp-key"), group_id: target.id });
    cleanup.push(() => deleteApiKey(client, created.id));
    expect(created.unmasked_key).toMatch(/^mb_/);
    expect(created.group?.id).toBe(target.id);

    // the new key works and acts as its group
    const { metabaseUrl } = await getSetupState();
    const keyClient = await createMetabaseClient({ metabaseUrl, apiKey: created.unmasked_key!, readOnly: true });
    const { response } = await keyClient.GET("/api/user/current");
    expect(response.status).toBe(200);

    const listed = await listApiKeys(client);
    const found = listed.find((k) => k.id === created.id)!;
    expect(found.masked_key).toContain("*");
    expect((found as any).unmasked_key).toBeUndefined();

    const renamed = await updateApiKey(client, created.id, { name: created.name + "-renamed" });
    expect(renamed.name).toBe(created.name + "-renamed");

    const regenerated = await regenerateApiKey(client, created.id);
    expect(regenerated.unmasked_key).toMatch(/^mb_/);
    expect(regenerated.unmasked_key).not.toBe(created.unmasked_key);

    expect(await deleteApiKey(client, created.id)).toEqual({ success: true });
    expect((await listApiKeys(client)).some((k) => k.id === created.id)).toBe(false);
    expect(groups.length).toBeGreaterThan(0);
  });
});

describe("embedding", () => {
  test("signEmbedToken produces a verifiable HS256 JWT", () => {
    const token = signEmbedToken({ resource: { dashboard: 1 }, params: {}, exp: 1 }, "secret");
    const [h, p] = token.split(".");
    expect(JSON.parse(Buffer.from(h, "base64url").toString())).toEqual({ alg: "HS256", typ: "JWT" });
    expect(JSON.parse(Buffer.from(p, "base64url").toString()).resource).toEqual({ dashboard: 1 });
  });

  test("enable static embedding, embed a card, open the signed URL", async () => {
    const client = await getTestClient();
    const before = await getEmbeddingStatus(client);
    const wasEnabled = before.settings["enable-embedding-static"] === true;

    const status = await setStaticEmbedding(client, true);
    expect(status.settings["enable-embedding-static"]).toBe(true);
    expect(status.secret_key_set).toBe(true);
    expect(JSON.stringify(status)).not.toMatch(/[0-9a-f]{64}/); // secret never returned

    const card = (await createCard(client, {
      name: testName("embed-card"),
      display: "scalar",
      dataset_query: { type: "native", native: { query: "SELECT 42 AS ANSWER" }, database: SAMPLE_DB_ID },
    })) as any;
    try {
      const updated = await setResourceEmbedding(client, "card", card.id, { enabled: true });
      expect(updated.enable_embedding).toBe(true);
      expect((await getEmbeddingStatus(client)).embeddable_cards.some((c: any) => c.id === card.id)).toBe(true);

      const { url, expires_at } = await createEmbedUrl(client, "http://localhost:3000", { resource: "card", id: card.id });
      expect(url).toContain("/embed/question/");
      expect(new Date(expires_at).getTime()).toBeGreaterThan(Date.now());

      // the token is accepted by Metabase's public embed endpoint
      const token = url.split("/embed/question/")[1].split("#")[0];
      const { metabaseUrl } = await getSetupState();
      const res = await fetch(`${metabaseUrl}/api/embed/card/${token}/query`);
      if (res.status >= 300) throw new Error(`embed ${res.status}: ${await res.clone().text()}`);
      const body = (await res.json()) as any;
      expect(body.data.rows[0][0]).toBe(42);
    } finally {
      await deleteCard(client, card.id);
      if (!wasEnabled) await setStaticEmbedding(client, false);
    }
  });
});

describe("tasks and logs", () => {
  test("task history, types, runs, scheduler", async () => {
    const client = await getTestClient();
    const tasks = await listTasks(client, { limit: 5 });
    expect(tasks.total).toBeGreaterThan(0);
    expect(tasks.tasks.length).toBeLessThanOrEqual(5);
    expect((tasks.tasks[0] as any).logs).toBeUndefined();

    const one = await getTask(client, tasks.tasks[0].id);
    expect(one.id).toBe(tasks.tasks[0].id);

    const types = (await listTaskTypes(client)) as string[];
    expect(types).toContain("sync");
    const syncOnly = await listTasks(client, { task: "sync", limit: 3 });
    expect(syncOnly.tasks.every((t) => t.task === "sync")).toBe(true);

    const runs = (await listTaskRuns(client, { limit: 2 })) as any;
    expect(runs).toBeDefined();

    const info = await getSchedulerInfo(client);
    expect(Array.isArray(info.jobs)).toBe(true);
  });

  test("server logs, presets, temporary log level change, premium status", async () => {
    const client = await getTestClient();
    const logs = await getServerLogs(client, { limit: 20 });
    expect(logs.lines.length).toBeLessThanOrEqual(20);
    expect(JSON.stringify(logs)).not.toContain("\u001B[");
    const errors = await getServerLogs(client, { level: "ERROR" });
    expect(errors.lines.every((l: any) => ["ERROR", "FATAL"].includes(String(l.level).toUpperCase()))).toBe(true);

    expect(Array.isArray(await listLogPresets(client))).toBe(true);
    expect((await setLogLevels(client, { log_levels: { "metabase.sync": "debug" }, duration: 1, duration_unit: "minutes" })).success).toBe(true);
    expect(await resetLogLevels(client)).toEqual({ success: true });

    const premium = (await getPremiumTokenStatus(client)) as any;
    expect(premium).toBeDefined();
  });
});
