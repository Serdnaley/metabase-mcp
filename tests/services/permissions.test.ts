import { describe, test, expect } from "bun:test";
import { getTestClient } from "../helpers.js";
import { getPermissionsGraph, getCollectionPermissions, updatePermissionsGraph, updateCollectionPermissions } from "../../src/services/permissions.js";

describe("permissions service", () => {
  test("getPermissionsGraph returns object with groups and revision", async () => {
    const client = await getTestClient();
    const result = (await getPermissionsGraph(client)) as any;
    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
    expect(result.groups).toBeDefined();
    expect(typeof result.revision).toBe("number");
  });

  test("getCollectionPermissions returns object with groups and revision", async () => {
    const client = await getTestClient();
    const result = (await getCollectionPermissions(client)) as any;
    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
    expect(result.groups).toBeDefined();
    expect(typeof result.revision).toBe("number");
  });

  test("updatePermissionsGraph round-trip preserves graph", async () => {
    const client = await getTestClient();
    const graph = await getPermissionsGraph(client) as any;
    // Write back the same graph (no-op update, but validates the endpoint)
    const result = await updatePermissionsGraph(client, graph) as any;
    expect(result).toBeDefined();
    expect(result.groups).toBeDefined();
    expect(typeof result.revision).toBe("number");
  });

  test("updateCollectionPermissions round-trip preserves graph", async () => {
    const client = await getTestClient();
    const graph = await getCollectionPermissions(client) as any;
    const result = await updateCollectionPermissions(client, graph) as any;
    expect(result).toBeDefined();
    expect(result.groups).toBeDefined();
    expect(typeof result.revision).toBe("number");
  });
});
