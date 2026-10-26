import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Prompt templates: ready-made workflows that tell the model which tools to chain.
 * A prompt is registered only when every tool it relies on is enabled (toolsets,
 * enable/disable lists and read-only mode all apply), so it never points at a missing tool.
 */

type PromptDef = {
  name: string;
  title: string;
  description: string;
  requires: string[];
  args: Record<string, z.ZodType<string | undefined>>;
  text: (args: Record<string, string | undefined>) => string;
};

const user = (text: string) => ({ messages: [{ role: "user" as const, content: { type: "text" as const, text } }] });

export const PROMPTS: PromptDef[] = [
  {
    name: "explore-database",
    title: "Explore a database",
    description: "Map a database's tables, keys and data, then suggest questions worth asking",
    requires: ["list_databases", "get_database_metadata", "execute_query"],
    args: { database_id: z.string().optional().describe("Database ID; omit to pick from the list") },
    text: ({ database_id }) =>
      [
        database_id
          ? `Explore Metabase database ${database_id}.`
          : "List the Metabase databases with list_databases and pick the one that is not the sample unless only the sample exists.",
        "1. Call get_database_metadata and summarise the tables: purpose, row counts, primary/foreign keys and how tables join.",
        "2. For the 3-5 most important tables run small execute_query samples (LIMIT 5, max_rows 5) to see real values.",
        "3. Note data quality issues you spot (nulls, odd types, unused tables).",
        "4. Propose 5 concrete business questions this data can answer, each with the SQL you would run.",
        "Keep results small: always use LIMIT and max_rows.",
      ].join("\n"),
  },
  {
    name: "build-dashboard",
    title: "Build a dashboard",
    description: "Turn a goal into saved questions and a laid-out dashboard",
    requires: ["get_database_metadata", "execute_query", "create_card", "create_dashboard", "update_dashboard_cards"],
    args: {
      goal: z.string().describe("What the dashboard should show, e.g. 'weekly revenue and top products'"),
      database_id: z.string().optional().describe("Database ID to build on"),
      collection_id: z.string().optional().describe("Collection ID to save into"),
    },
    text: ({ goal, database_id, collection_id }) =>
      [
        `Build a Metabase dashboard for this goal: ${goal}`,
        database_id ? `Use database ${database_id}.` : "Find the right database with list_databases first.",
        "1. Read the schema with get_database_metadata.",
        "2. Draft 4-6 questions. Test each SQL with execute_query (max_rows 10) before saving.",
        `3. Save each with create_card, with a clear name, a fitting display and visualization_settings${collection_id ? `, in collection ${collection_id}` : ""}.`,
        `4. Create the dashboard with create_dashboard${collection_id ? ` in collection ${collection_id}` : ""}, then place the cards with update_dashboard_cards on a 24-column grid: KPIs on top (size_x 6, size_y 3), charts below (size_x 12, size_y 6).`,
        "5. Report the dashboard id and what each card answers.",
      ].join("\n"),
  },
  {
    name: "explain-card",
    title: "Explain a question",
    description: "Explain what a saved question computes and check its result",
    requires: ["get_card", "execute_card_query"],
    args: { card_id: z.string().describe("Card (question) ID") },
    text: ({ card_id }) =>
      [
        `Explain Metabase question ${card_id}.`,
        "1. Read it with get_card: name, description, query (SQL or MBQL), parameters, display.",
        "2. Explain in plain language what it computes, which tables and filters it uses, and any pitfalls (double counting, time zones, missing filters).",
        "3. Run it with execute_card_query (max_rows 20) and say whether the result looks plausible.",
        "4. Suggest improvements if any.",
      ].join("\n"),
  },
  {
    name: "audit-permissions",
    title: "Audit permissions",
    description: "Review groups, data and collection permissions and flag risky access",
    requires: ["list_groups", "get_permissions_graph", "get_collection_permissions"],
    args: {},
    text: () =>
      [
        "Audit this Metabase instance's permissions.",
        "1. list_groups (and get_group for member counts), get_permissions_graph and get_collection_permissions.",
        "2. Build a table: group × database → view data / create queries (native SQL?), and group × top-level collection → read/write.",
        "3. Flag risks: the All Users group with native SQL or write access, groups with access to everything, empty groups, API keys' groups with more than they need.",
        "4. Recommend specific changes. Do not change anything; this is a read-only review.",
      ].join("\n"),
  },
];

export const registerPrompts = (server: McpServer, enabledTools: Set<string>): string[] => {
  const registered: string[] = [];
  for (const p of PROMPTS) {
    if (!p.requires.every((t) => enabledTools.has(t))) continue;
    server.registerPrompt(
      p.name,
      { title: p.title, description: p.description, argsSchema: p.args as any },
      (async (args: Record<string, string | undefined>) => user(p.text(args ?? {}))) as any
    );
    registered.push(p.name);
  }
  return registered;
};
