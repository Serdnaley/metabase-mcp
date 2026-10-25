import { describe, test, expect, afterAll } from "bun:test";
import { parseCustomHeaders } from "../../src/config.js";
import { createMetabaseClient } from "../../src/client.js";

describe("parseCustomHeaders", () => {
  test("empty or unset gives no headers", () => {
    expect(parseCustomHeaders(undefined)).toEqual({});
    expect(parseCustomHeaders("  ")).toEqual({});
  });

  test("JSON object", () => {
    expect(
      parseCustomHeaders('{"CF-Access-Client-Id": "id1", "CF-Access-Client-Secret": "s3"}')
    ).toEqual({ "CF-Access-Client-Id": "id1", "CF-Access-Client-Secret": "s3" });
  });

  test("Name: value pairs separated by newlines or semicolons", () => {
    expect(parseCustomHeaders("X-One: 1\nX-Two: a:b ; X-Three:3")).toEqual({
      "X-One": "1",
      "X-Two": "a:b",
      "X-Three": "3",
    });
  });

  test("rejects non-string JSON values", () => {
    expect(() => parseCustomHeaders('{"X-One": 1}')).toThrow("must be a string");
  });

  test("rejects a JSON array", () => {
    expect(() => parseCustomHeaders('["X-One"]')).toThrow("JSON object");
  });

  test("rejects broken JSON", () => {
    expect(() => parseCustomHeaders('{"X-One": ')).toThrow("not valid JSON");
  });

  test("rejects a pair without a colon", () => {
    expect(() => parseCustomHeaders("X-One 1")).toThrow('expected "Name: value"');
  });

  test("rejects an invalid header name", () => {
    expect(() => parseCustomHeaders("Bad Name: 1")).toThrow("invalid header name");
  });
});

describe("custom headers on requests", () => {
  const seen: Headers[] = [];
  const server = Bun.serve({
    port: 0,
    fetch(req) {
      seen.push(req.headers);
      const url = new URL(req.url);
      if (url.pathname === "/api/session") return Response.json({ id: "sess-1" });
      return Response.json({ ok: true });
    },
  });
  const baseUrl = `http://localhost:${server.port}`;
  afterAll(() => server.stop(true));

  test("sent on API calls together with the API key", async () => {
    seen.length = 0;
    const client = await createMetabaseClient({
      metabaseUrl: baseUrl,
      apiKey: "mb_key",
      readOnly: false,
      customHeaders: { "CF-Access-Client-Id": "id1", "X-API-Key": "spoofed" },
    });
    await client.GET("/api/user/current");
    expect(seen[0].get("CF-Access-Client-Id")).toBe("id1");
    expect(seen[0].get("X-API-Key")).toBe("mb_key");
  });

  test("sent on the session login and later calls", async () => {
    seen.length = 0;
    const client = await createMetabaseClient({
      metabaseUrl: baseUrl,
      email: "a@b.co",
      password: "pw",
      readOnly: false,
      customHeaders: { "X-Tenant": "letdate" },
    });
    await client.GET("/api/user/current");
    expect(seen).toHaveLength(2);
    expect(seen[0].get("X-Tenant")).toBe("letdate");
    expect(seen[1].get("X-Tenant")).toBe("letdate");
    expect(seen[1].get("X-Metabase-Session")).toBe("sess-1");
  });

  test("no custom headers by default", async () => {
    seen.length = 0;
    const client = await createMetabaseClient({ metabaseUrl: baseUrl, apiKey: "mb_key", readOnly: false });
    await client.GET("/api/user/current");
    expect(seen[0].get("X-Tenant")).toBeNull();
  });
});
