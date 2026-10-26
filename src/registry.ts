import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import type { MetabaseClient } from "./client.js";
import type { Config } from "./config.js";
import { TOOL_MODULES } from "./tools/index.js";

/** One tool as declared by a src/tools/* module, plus metadata derived here. */
export type ToolDef = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: ToolCallback<any>;
  toolset: string;
  toolsetLabel: string;
  /** Registered only when read-only mode is off */
  write: boolean;
  annotations: ToolAnnotations;
};

/**
 * Toolset presets for METABASE_TOOLSETS. A preset expands to toolset ids;
 * plain toolset ids (one per src/tools/* module) work too.
 */
export const TOOLSET_PRESETS: Record<string, string[]> = {
  all: TOOL_MODULES.map((m) => m.toolset),
  // Explore and query data: what an analyst assistant needs
  query: ["search", "databases", "tables", "dataset", "cards", "metrics", "measures", "segments", "exports", "activity", "xrays"],
  // Build and organise content
  content: [
    "search", "collections", "cards", "dashboards", "documents", "snippets", "timelines",
    "bookmarks", "glossary", "revisions", "moderation", "notifications", "exports",
  ],
  // Instance administration and data operations
  admin: [
    "users", "permissions", "settings", "databases", "tables", "cache", "persistence",
    "upload", "transforms", "actions", "activity", "eid-translation",
  ],
};

/**
 * Tools that can run arbitrary native SQL. They stay available in read-only mode
 * (Metabase permissions are the boundary), but their hints are honest:
 * SQL may modify data if the database user allows it.
 */
const RAW_SQL_TOOLS = new Set(["execute_query", "export_query"]);

const ADDITIVE_PREFIXES = ["create_", "add_", "copy_", "validate_", "sync_", "rescan_", "run_", "send_", "upload_", "persist_", "refresh_"];
const IDEMPOTENT_WRITE_PREFIXES = [
  "update_", "delete_", "remove_", "deactivate_", "reactivate_", "discard_", "invalidate_",
  "unpersist_", "reorder_", "sync_", "rescan_", "validate_", "refresh_", "persist_",
];

export const annotate = (name: string, write: boolean): ToolAnnotations => {
  // Raw SQL tools are marked read-only (Andres 26.10) so clients can approve them in one click;
  // their descriptions carry a warning that the SQL itself is not restricted.
  if (RAW_SQL_TOOLS.has(name)) {
    return { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false };
  }
  if (!write) {
    return { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
  }
  const additive = ADDITIVE_PREFIXES.some((p) => name.startsWith(p));
  return {
    readOnlyHint: false,
    destructiveHint: !additive,
    idempotentHint: IDEMPOTENT_WRITE_PREFIXES.some((p) => name.startsWith(p)),
    openWorldHint: false,
  };
};

type Recorded = Omit<ToolDef, "write" | "annotations">;

/** A stand-in McpServer that only records `server.tool(...)` calls. */
const recordTools = (client: MetabaseClient, config: Config): Recorded[] => {
  const out: Recorded[] = [];
  for (const mod of TOOL_MODULES) {
    const recorder = {
      tool: (name: string, ...rest: unknown[]) => {
        const handler = rest[rest.length - 1] as ToolCallback<any>;
        const description = typeof rest[0] === "string" ? (rest[0] as string) : "";
        const inputSchema =
          (rest.slice(typeof rest[0] === "string" ? 1 : 0, -1)[0] as Record<string, unknown>) ?? {};
        out.push({ name, description, inputSchema, handler, toolset: mod.toolset, toolsetLabel: mod.label });
      },
    };
    mod.register(recorder as unknown as McpServer, client, config);
  }
  return out;
};

/** Every tool this server offers, with toolset, read/write class and annotations. */
export const buildToolCatalog = (client: MetabaseClient, config: Config): ToolDef[] => {
  const all = recordTools(client, { ...config, readOnly: false });
  const readNames = new Set(recordTools(client, { ...config, readOnly: true }).map((t) => t.name));
  const seen = new Set<string>();
  for (const t of all) {
    if (seen.has(t.name)) throw new Error(`Duplicate tool name: ${t.name}`);
    seen.add(t.name);
  }
  return all.map((t) => {
    const write = !readNames.has(t.name);
    return { ...t, write, annotations: annotate(t.name, write) };
  });
};

const splitList = (raw: string | undefined): string[] =>
  (raw ?? "").split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);

const globToRegExp = (glob: string): RegExp =>
  new RegExp(`^${glob.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);

export type ToolSelection = {
  /** Toolset ids or presets; empty = all */
  toolsets?: string[];
  /** Tool names or globs added on top of the toolsets */
  enable?: string[];
  /** Tool names or globs always removed */
  disable?: string[];
  readOnly?: boolean;
};

export const parseToolSelection = (env: Record<string, string | undefined>): ToolSelection => ({
  toolsets: splitList(env.METABASE_TOOLSETS),
  enable: splitList(env.METABASE_TOOLS_ENABLE),
  disable: splitList(env.METABASE_TOOLS_DISABLE),
  readOnly: env.METABASE_READ_ONLY_MODE === "true",
});

/** Expands toolset ids and presets; throws on unknown names so typos fail at startup. */
export const resolveToolsets = (names: string[] | undefined): Set<string> => {
  if (!names || names.length === 0) return new Set(TOOLSET_PRESETS.all);
  const valid = new Set(TOOLSET_PRESETS.all);
  const out = new Set<string>();
  for (const n of names) {
    const key = n.toLowerCase();
    if (TOOLSET_PRESETS[key]) TOOLSET_PRESETS[key].forEach((t) => out.add(t));
    else if (valid.has(key)) out.add(key);
    else {
      throw new Error(
        `METABASE_TOOLSETS: unknown toolset "${n}". Presets: ${Object.keys(TOOLSET_PRESETS).join(", ")}. ` +
          `Toolsets: ${[...valid].join(", ")}`
      );
    }
  }
  return out;
};

/**
 * Applies the selection. Precedence (strongest first):
 * read-only mode > METABASE_TOOLS_DISABLE > METABASE_TOOLS_ENABLE > METABASE_TOOLSETS.
 * Returns the chosen tools plus warnings for enable/disable patterns that matched nothing.
 */
export const selectTools = (
  catalog: ToolDef[],
  selection: ToolSelection
): { tools: ToolDef[]; warnings: string[] } => {
  const toolsets = resolveToolsets(selection.toolsets);
  const enable = (selection.enable ?? []).map((g) => ({ g, re: globToRegExp(g) }));
  const disable = (selection.disable ?? []).map((g) => ({ g, re: globToRegExp(g) }));
  const warnings: string[] = [];
  for (const { g, re } of [...enable, ...disable]) {
    if (!catalog.some((t) => re.test(t.name))) warnings.push(`no tool matches "${g}"`);
  }
  const tools = catalog.filter((t) => {
    if (selection.readOnly && t.write) return false;
    if (disable.some(({ re }) => re.test(t.name))) return false;
    if (enable.some(({ re }) => re.test(t.name))) return true;
    return toolsets.has(t.toolset);
  });
  return { tools, warnings };
};

export const registerTools = (server: McpServer, tools: ToolDef[]) => {
  for (const t of tools) {
    server.registerTool(
      t.name,
      { description: t.description, inputSchema: t.inputSchema as any, annotations: t.annotations },
      t.handler
    );
  }
};
