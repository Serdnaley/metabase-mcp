import { describe, test, expect } from "bun:test";
import { createMetabaseClient } from "../../src/client.js";

describe("client", () => {
  test("createMetabaseClient with API key creates a working client", async () => {
    // Verify the client factory doesn't throw with valid config
    const client = await createMetabaseClient({
      metabaseUrl: "http://localhost:3000",
      apiKey: "mb_test_key",
      readOnly: false,
    });
    expect(client).toBeDefined();
    expect(typeof client.GET).toBe("function");
    expect(typeof client.POST).toBe("function");
    expect(typeof client.PUT).toBe("function");
    expect(typeof client.DELETE).toBe("function");
  });

  test("createMetabaseClient with session login throws on bad credentials", async () => {
    // Attempting to login with invalid credentials should throw
    expect(
      createMetabaseClient({
        metabaseUrl: "http://localhost:3000",
        email: "nonexistent@test.com",
        password: "wrongpassword",
        readOnly: false,
      })
    ).rejects.toThrow("Metabase login failed");
  });

  test("createMetabaseClient with no auth creates client without middleware", async () => {
    // When neither apiKey nor email/password is provided, client still creates
    // (the config validation is handled at the config layer, not client layer)
    const client = await createMetabaseClient({
      metabaseUrl: "http://localhost:3000",
      readOnly: false,
    });
    expect(client).toBeDefined();
  });

  test("createMetabaseClient with invalid URL still creates client", async () => {
    // The client factory doesn't validate the URL - it just creates the client
    // Actual failures will happen on first API call
    const client = await createMetabaseClient({
      metabaseUrl: "http://nonexistent-host:9999",
      apiKey: "mb_test_key",
      readOnly: false,
    });
    expect(client).toBeDefined();
  });
});
