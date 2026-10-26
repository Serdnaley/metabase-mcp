import { describe, test, expect } from "bun:test";
import { configSchema } from "../../src/config.js";

describe("config validation", () => {
  // --- Valid configs ---

  test("valid config with API key", () => {
    const result = configSchema.safeParse({
      metabaseUrl: "http://localhost:3000",
      apiKey: "mb_test123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metabaseUrl).toBe("http://localhost:3000");
      expect(result.data.apiKey).toBe("mb_test123");
      expect(result.data.readOnly).toBe(false);
    }
  });

  test("valid config with email/password", () => {
    const result = configSchema.safeParse({
      metabaseUrl: "http://localhost:3000",
      email: "test@test.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@test.com");
      expect(result.data.password).toBe("password123");
    }
  });

  test("valid config with both auth methods", () => {
    const result = configSchema.safeParse({
      metabaseUrl: "http://localhost:3000",
      apiKey: "mb_key",
      email: "test@test.com",
      password: "password",
    });
    expect(result.success).toBe(true);
  });

  test("readOnly defaults to false", () => {
    const result = configSchema.safeParse({
      metabaseUrl: "http://localhost:3000",
      apiKey: "mb_key",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.readOnly).toBe(false);
    }
  });

  test("readOnly=true is parsed correctly", () => {
    const result = configSchema.safeParse({
      metabaseUrl: "http://localhost:3000",
      apiKey: "mb_key",
      readOnly: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.readOnly).toBe(true);
    }
  });

  // --- Invalid configs ---

  test("missing URL fails validation", () => {
    const result = configSchema.safeParse({
      apiKey: "mb_key",
    });
    expect(result.success).toBe(false);
  });

  test("invalid URL fails validation", () => {
    const result = configSchema.safeParse({
      metabaseUrl: "not-a-url",
      apiKey: "mb_key",
    });
    expect(result.success).toBe(false);
  });

  test("empty string URL fails validation", () => {
    const result = configSchema.safeParse({
      metabaseUrl: "",
      apiKey: "mb_key",
    });
    expect(result.success).toBe(false);
  });

  test("missing both auth methods fails validation", () => {
    const result = configSchema.safeParse({
      metabaseUrl: "http://localhost:3000",
    });
    expect(result.success).toBe(false);
  });

  test("email without password fails validation", () => {
    const result = configSchema.safeParse({
      metabaseUrl: "http://localhost:3000",
      email: "test@test.com",
    });
    expect(result.success).toBe(false);
  });

  test("password without email fails validation", () => {
    const result = configSchema.safeParse({
      metabaseUrl: "http://localhost:3000",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  test("invalid email format fails validation", () => {
    const result = configSchema.safeParse({
      metabaseUrl: "http://localhost:3000",
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  // --- URL normalization ---

  test("trailing slashes are stripped from URL", () => {
    const url = "http://localhost:3000///";
    const cleaned = url.replace(/\/+$/, "");
    expect(cleaned).toBe("http://localhost:3000");
  });

  test("single trailing slash is stripped", () => {
    const url = "http://localhost:3000/";
    const cleaned = url.replace(/\/+$/, "");
    expect(cleaned).toBe("http://localhost:3000");
  });
});

describe("loadConfig env handling", () => {
  test("empty optional env vars count as unset (MCPB hosts pass \"\" for blank fields)", async () => {
    const { loadConfig } = await import("../../src/config.js");
    const keys = ["METABASE_URL", "METABASE_API_KEY", "METABASE_EMAIL", "METABASE_PASSWORD"] as const;
    const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
    try {
      process.env.METABASE_URL = "http://localhost:3000/";
      process.env.METABASE_API_KEY = "mb_test_key";
      process.env.METABASE_EMAIL = "";
      process.env.METABASE_PASSWORD = "  ";
      const config = loadConfig();
      expect(config.metabaseUrl).toBe("http://localhost:3000");
      expect(config.apiKey).toBe("mb_test_key");
      expect(config.email).toBeUndefined();
      expect(config.password).toBeUndefined();
    } finally {
      for (const k of keys) {
        if (saved[k] === undefined) delete process.env[k];
        else process.env[k] = saved[k];
      }
    }
  });
});
