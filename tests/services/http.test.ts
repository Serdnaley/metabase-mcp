import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { getTestClient } from "../helpers.js";
import { buildToolCatalog, registerTools, selectTools } from "../../src/registry.js";
import { checkBearer, loadHttpOptions, startHttpServer } from "../../src/http.js";

const TOKEN = "test-token-0123456789abcdef";

describe("HTTP transport", () => {
  let server: Server;
  let base: string;

  beforeAll(async () => {
    const client = await getTestClient();
    const { tools } = selectTools(buildToolCatalog(client, { metabaseUrl: "http://localhost:3000", readOnly: false }), {
      toolsets: ["search", "databases"],
    });
    const create = () => {
      const s = new McpServer({ name: "test", version: "0.0.0" });
      registerTools(s, tools);
      return s;
    };
    server = await startHttpServer(create, { host: "127.0.0.1", port: 0, token: TOKEN, allowNoAuth: false });
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => {
    server?.close();
  });

  test("/health answers without auth", async () => {
    const res = await fetch(`${base}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  test("/mcp without token → 401", async () => {
    const res = await fetch(`${base}/mcp`, { method: "POST", body: "{}" });
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toContain("Bearer");
  });

  test("/mcp with wrong token → 401", async () => {
    const res = await fetch(`${base}/mcp`, {
      method: "POST",
      headers: { Authorization: "Bearer wrong-token-0123456789" },
      body: "{}",
    });
    expect(res.status).toBe(401);
  });

  test("MCP client lists and calls tools with the token", async () => {
    const transport = new StreamableHTTPClientTransport(new URL(`${base}/mcp`), {
      requestInit: { headers: { Authorization: `Bearer ${TOKEN}` } },
    });
    const mcp = new Client({ name: "http-test", version: "0.0.0" });
    await mcp.connect(transport);
    const { tools } = await mcp.listTools();
    const names = tools.map((t) => t.name);
    expect(names).toContain("search");
    expect(names).toContain("list_databases");
    expect(names).not.toContain("get_card");
    const listDb = tools.find((t) => t.name === "list_databases")!;
    expect(listDb.annotations?.readOnlyHint).toBe(true);

    const result = (await mcp.callTool({ name: "list_databases", arguments: {} })) as any;
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain("Sample Database");
    await mcp.close();
  });

  test("GET /mcp is not allowed (stateless)", async () => {
    const res = await fetch(`${base}/mcp`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    expect(res.status).toBe(405);
  });
});

describe("HTTP options", () => {
  test("stdio by default", () => {
    expect(loadHttpOptions({})).toBeNull();
  });

  test("http needs a token", () => {
    expect(() => loadHttpOptions({ MCP_TRANSPORT: "http" })).toThrow("MCP_HTTP_TOKEN");
  });

  test("no-auth only on loopback", () => {
    expect(loadHttpOptions({ MCP_TRANSPORT: "http", MCP_HTTP_ALLOW_NO_AUTH: "true" })?.token).toBeUndefined();
    expect(() =>
      loadHttpOptions({ MCP_TRANSPORT: "http", MCP_HTTP_ALLOW_NO_AUTH: "true", MCP_HTTP_HOST: "0.0.0.0" })
    ).toThrow("loopback");
  });

  test("--http flag and port", () => {
    expect(loadHttpOptions({ MCP_HTTP_TOKEN: TOKEN, MCP_HTTP_PORT: "8080" }, ["--http"])).toMatchObject({
      host: "127.0.0.1",
      port: 8080,
      token: TOKEN,
    });
  });

  test("short token rejected", () => {
    expect(() => loadHttpOptions({ MCP_TRANSPORT: "http", MCP_HTTP_TOKEN: "short" })).toThrow("16");
  });

  test("checkBearer", () => {
    expect(checkBearer(`Bearer ${TOKEN}`, TOKEN)).toBe(true);
    expect(checkBearer(`bearer ${TOKEN}`, TOKEN)).toBe(true);
    expect(checkBearer(TOKEN, TOKEN)).toBe(false);
    expect(checkBearer(undefined, TOKEN)).toBe(false);
    expect(checkBearer("Bearer x", TOKEN)).toBe(false);
  });
});
