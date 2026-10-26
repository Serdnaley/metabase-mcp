import { describe, test, expect } from "bun:test";
import { getTestClient } from "../helpers.js";
import {
  buildToolCatalog,
  selectTools,
  resolveToolsets,
  parseToolSelection,
  TOOLSET_PRESETS,
  type ToolDef,
} from "../../src/registry.js";
import { TOOL_MODULES } from "../../src/tools/index.js";

const config = { metabaseUrl: "http://localhost:3000", readOnly: false };
const catalog = async (): Promise<ToolDef[]> => buildToolCatalog(await getTestClient(), config);

describe("tool registry", () => {
  test("every tool belongs to a known toolset and has a description", async () => {
    const tools = await catalog();
    const toolsets = new Set(TOOL_MODULES.map((m) => m.toolset));
    expect(tools.length).toBeGreaterThan(100);
    for (const t of tools) {
      expect(toolsets.has(t.toolset)).toBe(true);
      expect(t.description.length).toBeGreaterThan(10);
    }
  });

  test("every toolset has at least one tool", async () => {
    const tools = await catalog();
    for (const m of TOOL_MODULES) expect(tools.some((t) => t.toolset === m.toolset)).toBe(true);
  });

  test("every preset only names existing toolsets", () => {
    const all = new Set(TOOLSET_PRESETS.all);
    for (const ids of Object.values(TOOLSET_PRESETS)) for (const id of ids) expect(all.has(id)).toBe(true);
  });

  test("default selection = everything", async () => {
    const tools = await catalog();
    expect(selectTools(tools, {}).tools.length).toBe(tools.length);
  });

  test("toolsets restrict to their domains", async () => {
    const tools = await catalog();
    const { tools: picked } = selectTools(tools, { toolsets: ["dashboards", "search"] });
    expect(picked.length).toBeGreaterThan(0);
    expect(picked.every((t) => t.toolset === "dashboards" || t.toolset === "search")).toBe(true);
  });

  test("presets expand", () => {
    expect(resolveToolsets(["query"]).has("dataset")).toBe(true);
    expect(resolveToolsets(["QUERY", "admin"]).has("users")).toBe(true);
  });

  test("unknown toolset fails loudly", () => {
    expect(() => resolveToolsets(["dashbords"])).toThrow('unknown toolset "dashbords"');
  });

  test("enable adds single tools outside the chosen toolsets", async () => {
    const tools = await catalog();
    const { tools: picked } = selectTools(tools, { toolsets: ["search"], enable: ["get_card"] });
    expect(picked.map((t) => t.name).sort()).toEqual(["get_card", "search"]);
  });

  test("disable wins over toolsets and enable; globs work", async () => {
    const tools = await catalog();
    const { tools: picked } = selectTools(tools, {
      toolsets: ["cards"],
      enable: ["delete_dashboard"],
      disable: ["delete_*"],
    });
    expect(picked.some((t) => t.name.startsWith("delete_"))).toBe(false);
    expect(picked.some((t) => t.name === "get_card")).toBe(true);
  });

  test("read-only mode removes write tools even when enabled explicitly", async () => {
    const tools = await catalog();
    const { tools: picked } = selectTools(tools, { readOnly: true, enable: ["create_card"] });
    expect(picked.some((t) => t.write)).toBe(false);
    expect(picked.some((t) => t.name === "execute_query")).toBe(true);
  });

  test("patterns matching nothing produce warnings", async () => {
    const tools = await catalog();
    expect(selectTools(tools, { enable: ["nope_*"] }).warnings).toEqual(['no tool matches "nope_*"']);
  });

  test("parseToolSelection reads env lists", () => {
    expect(
      parseToolSelection({
        METABASE_TOOLSETS: "query, admin",
        METABASE_TOOLS_ENABLE: "get_card",
        METABASE_TOOLS_DISABLE: "delete_* remove_*",
        METABASE_READ_ONLY_MODE: "true",
      })
    ).toEqual({ toolsets: ["query", "admin"], enable: ["get_card"], disable: ["delete_*", "remove_*"], readOnly: true });
  });

  test("annotations: read tools are read-only, writes are not, raw SQL is honest", async () => {
    const tools = await catalog();
    for (const t of tools) {
      expect(t.annotations.openWorldHint).toBe(false);
      if (t.write) expect(t.annotations.readOnlyHint).toBe(false);
    }
    const byName = Object.fromEntries(tools.map((t) => [t.name, t]));
    expect(byName.get_card.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false });
    expect(byName.create_card.annotations).toMatchObject({ readOnlyHint: false, destructiveHint: false, idempotentHint: false });
    expect(byName.delete_card.annotations).toMatchObject({ readOnlyHint: false, destructiveHint: true, idempotentHint: true });
    expect(byName.execute_query.write).toBe(false);
    expect(byName.execute_query.annotations).toMatchObject({ readOnlyHint: false, destructiveHint: true });
  });
});
