import { describe, test, expect } from "bun:test";
import { getTestClient } from "../helpers.js";
import { listSettings, getSetting, updateSetting } from "../../src/services/settings.js";

describe("settings service", () => {
  test("listSettings returns an array of settings", async () => {
    const client = await getTestClient();
    const result = (await listSettings(client)) as any;
    expect(result).toBeDefined();
    const settings = Array.isArray(result) ? result : result.data ?? [];
    expect(Array.isArray(settings)).toBe(true);
    expect(settings.length).toBeGreaterThan(0);
  });

  test("listSettings items have expected shape", async () => {
    const client = await getTestClient();
    const result = (await listSettings(client)) as any;
    const settings = Array.isArray(result) ? result : result.data ?? [];
    const first = settings[0];
    expect(first).toBeDefined();
    expect(first.key).toBeDefined();
  });

  test("getSetting returns a value for 'site-name'", async () => {
    const client = await getTestClient();
    const result = (await getSetting(client, "site-name")) as any;
    expect(result).toBeDefined();
  });

  test("updateSetting performs a read-modify-write on 'site-name'", async () => {
    const client = await getTestClient();

    // Read current value
    const original = (await getSetting(client, "site-name")) as any;
    const originalValue = typeof original === "object" && original !== null && "value" in original
      ? original.value
      : original;

    const testValue = "Metabase MCP Test Instance";

    // Update to test value
    await updateSetting(client, "site-name", testValue);

    // Verify the change
    const updated = (await getSetting(client, "site-name")) as any;
    const updatedValue = typeof updated === "object" && updated !== null && "value" in updated
      ? updated.value
      : updated;
    expect(updatedValue).toBe(testValue);

    // Restore original value
    await updateSetting(client, "site-name", originalValue);

    // Verify restoration
    const restored = (await getSetting(client, "site-name")) as any;
    const restoredValue = typeof restored === "object" && restored !== null && "value" in restored
      ? restored.value
      : restored;
    expect(restoredValue).toBe(originalValue);
  });
});
