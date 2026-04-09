import { describe, test, expect } from "bun:test";
import { z } from "zod";

// Replicate the config schema so we can test validation without process.exit
const configSchema = z
  .object({
    metabaseUrl: z.string().url(),
    apiKey: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    readOnly: z.boolean().default(false),
  })
  .refine(
    (c) => c.apiKey || (c.email && c.password),
    "Either METABASE_API_KEY or METABASE_EMAIL + METABASE_PASSWORD must be set"
  );

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
