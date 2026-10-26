import { test, expect } from "bun:test";
import { SERVER_VERSION } from "../../src/server-info.js";
import pkg from "../../package.json";

test("SERVER_VERSION matches package.json", () => {
  expect(SERVER_VERSION).toBe(pkg.version);
});
