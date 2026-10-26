import { describe, test, expect } from "bun:test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { getTestClient, SAMPLE_DB_ID, testName } from "../helpers.js";
import { registerResources } from "../../src/resources.js";
import { registerPrompts, PROMPTS } from "../../src/prompts.js";
import { buildToolCatalog, selectTools } from "../../src/registry.js";
import { createCard, deleteCard } from "../../src/services/cards.js";

const connect = async (toolsets: string[] | undefined, readOnly = false) => {
  const metabase = await getTestClient();
  const catalog = buildToolCatalog(metabase, { metabaseUrl: "http://localhost:3000", readOnly: false });
  const { tools } = selectTools(catalog, { toolsets, readOnly });
  const server = new McpServer({ name: "test", version: "0" });
  registerResources(server, metabase, new Set(tools.map((t) => t.toolset)));
  registerPrompts(server, new Set(tools.map((t) => t.name)));
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  const client = new Client({ name: "t", version: "0" });
  await client.connect(b);
  return { client, metabase };
};

describe("resources and prompts", () => {
  test("all toolsets: databases, schema, card, dashboard, collection resources", async () => {
    const { client, metabase } = await connect(undefined);
    const templates = (await client.listResourceTemplates()).resourceTemplates.map((t) => t.uriTemplate);
    expect(templates).toEqual(
      expect.arrayContaining([
        "metabase://database/{id}/schema",
        "metabase://card/{id}",
        "metabase://dashboard/{id}",
        "metabase://collection/{id}",
      ])
    );

    const dbs = JSON.parse((await client.readResource({ uri: "metabase://databases" })).contents[0].text as string);
    expect(dbs.some((d: any) => d.id === SAMPLE_DB_ID)).toBe(true);

    const listed = (await client.listResources()).resources.map((r) => r.uri);
    expect(listed).toContain(`metabase://database/${SAMPLE_DB_ID}/schema`);

    const schema = JSON.parse(
      (await client.readResource({ uri: `metabase://database/${SAMPLE_DB_ID}/schema` })).contents[0].text as string
    );
    const orders = schema.tables.find((t: any) => t.name.toUpperCase() === "ORDERS");
    expect(orders.fields.length).toBeGreaterThan(3);
    expect(orders.fields[0]).toHaveProperty("type");

    const card = (await createCard(metabase, {
      name: testName("resource-card"),
      display: "table",
      dataset_query: { type: "native", native: { query: "SELECT 1 AS X" }, database: SAMPLE_DB_ID },
    })) as any;
    try {
      const read = JSON.parse((await client.readResource({ uri: `metabase://card/${card.id}` })).contents[0].text as string);
      expect(read.id).toBe(card.id);
      expect(read.native_sql).toContain("SELECT 1");
    } finally {
      await deleteCard(metabase, card.id);
    }

    const root = JSON.parse((await client.readResource({ uri: "metabase://collection/root" })).contents[0].text as string);
    expect(Array.isArray(root.items)).toBe(true);
  });

  test("prompts are gated by the tools they need", async () => {
    const all = await connect(undefined);
    const names = (await all.client.listPrompts()).prompts.map((p) => p.name).sort();
    expect(names).toEqual(PROMPTS.map((p) => p.name).sort());
    const p = await all.client.getPrompt({ name: "explain-card", arguments: { card_id: "42" } });
    expect((p.messages[0].content as any).text).toContain("question 42");

    const ro = await connect(undefined, true);
    const roNames = (await ro.client.listPrompts()).prompts.map((p) => p.name);
    expect(roNames).not.toContain("build-dashboard");
    expect(roNames).toContain("explore-database");
  });

  test("toolsets limit resources", async () => {
    const { client } = await connect(["databases"]);
    const templates = (await client.listResourceTemplates()).resourceTemplates.map((t) => t.uriTemplate);
    expect(templates).toEqual(["metabase://database/{id}/schema"]);
  });
});
