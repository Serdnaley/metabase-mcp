import { test, expect } from "bun:test";
import { SERVER_VERSION } from "../../src/server-info.js";
import pkg from "../../package.json";

test("SERVER_VERSION matches package.json", () => {
  expect(SERVER_VERSION).toBe(pkg.version);
});

test("server.json matches package.json (MCP Registry metadata)", async () => {
  const server = await Bun.file(new URL("../../server.json", import.meta.url)).json();
  expect(server.name).toBe((pkg as any).mcpName);
  expect(server.version).toBe(pkg.version);
  expect(server.packages[0].identifier).toBe(pkg.name);
  expect(server.packages[0].version).toBe(pkg.version);
  expect(server.description.length).toBeLessThanOrEqual(100);
});
