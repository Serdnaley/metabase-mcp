import { ResourceTemplate, type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "./client.js";
import { listDatabases, getDatabaseMetadata } from "./services/databases.js";
import { getCard } from "./services/cards.js";
import { getDashboard } from "./services/dashboards.js";
import { getCollection, listCollectionItems } from "./services/collections.js";

/**
 * Read-only MCP resources for browsing an instance. Each returns a compact JSON summary
 * (not the raw API object, which is mostly UI metadata). A resource is registered only
 * when its toolset is enabled, so METABASE_TOOLSETS limits resources the same way.
 */

const json = (uri: URL, value: unknown) => ({
  contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(value) }],
});

const idVar = (v: string | string[] | undefined, what: string): number => {
  const raw = Array.isArray(v) ? v[0] : v;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Invalid ${what} id: ${raw}`);
  return n;
};

const asArray = (v: any): any[] => (Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : []);

export const summarizeDatabases = (raw: unknown) =>
  asArray(raw).map((d: any) => ({ id: d.id, name: d.name, engine: d.engine, is_sample: d.is_sample || undefined }));

export const summarizeSchema = (raw: any) => ({
  id: raw.id,
  name: raw.name,
  engine: raw.engine,
  tables: asArray(raw.tables).map((t: any) => ({
    id: t.id,
    schema: t.schema || undefined,
    name: t.name,
    display_name: t.display_name !== t.name ? t.display_name : undefined,
    description: t.description || undefined,
    rows: t.estimated_row_count ?? undefined,
    fields: asArray(t.fields).map((f: any) => {
      const out: Record<string, unknown> = { id: f.id, name: f.name, type: f.effective_type ?? f.base_type };
      if (f.semantic_type) out.semantic_type = f.semantic_type;
      if (f.fk_target_field_id) out.fk_target_field_id = f.fk_target_field_id;
      return out;
    }),
  })),
});

const queryOf = (dq: any) => {
  const native = dq?.native?.query ?? dq?.stages?.[0]?.native;
  return native ? { native_sql: native } : { query: dq };
};

export const summarizeCard = (c: any) => ({
  id: c.id,
  name: c.name,
  type: c.type,
  description: c.description || undefined,
  display: c.display,
  collection_id: c.collection_id,
  database_id: c.database_id,
  ...queryOf(c.dataset_query),
  parameters: asArray(c.parameters).map((p: any) => ({ id: p.id, slug: p.slug, name: p.name, type: p.type })),
  archived: c.archived || undefined,
});

export const summarizeDashboard = (d: any) => ({
  id: d.id,
  name: d.name,
  description: d.description || undefined,
  collection_id: d.collection_id,
  parameters: asArray(d.parameters).map((p: any) => ({ id: p.id, slug: p.slug, name: p.name, type: p.type })),
  tabs: asArray(d.tabs).map((t: any) => ({ id: t.id, name: t.name })),
  cards: asArray(d.dashcards ?? d.ordered_cards).map((dc: any) => ({
    dashcard_id: dc.id,
    card_id: dc.card_id ?? undefined,
    name: dc.card?.name ?? dc.visualization_settings?.text?.slice?.(0, 80) ?? undefined,
    display: dc.card?.display,
    tab_id: dc.dashboard_tab_id ?? undefined,
    position: { row: dc.row, col: dc.col, size_x: dc.size_x, size_y: dc.size_y },
  })),
});

export const summarizeCollection = (c: any, items: unknown) => ({
  id: c.id,
  name: c.name,
  description: c.description || undefined,
  items: asArray(items).map((i: any) => ({ model: i.model, id: i.id, name: i.name })),
});

/** Resources this server can register, keyed by the toolset that gates them. */
export const RESOURCE_TOOLSETS = ["databases", "cards", "dashboards", "collections"] as const;

export const registerResources = (server: McpServer, client: MetabaseClient, enabledToolsets: Set<string>) => {
  const names: string[] = [];

  if (enabledToolsets.has("databases")) {
    server.registerResource(
      "databases",
      "metabase://databases",
      { title: "Databases", description: "Connected databases (id, name, engine)", mimeType: "application/json" },
      async (uri) => json(uri, summarizeDatabases(await listDatabases(client)))
    );
    server.registerResource(
      "database-schema",
      new ResourceTemplate("metabase://database/{id}/schema", {
        list: async () => ({
          resources: summarizeDatabases(await listDatabases(client)).map((d) => ({
            uri: `metabase://database/${d.id}/schema`,
            name: `${d.name} schema`,
            mimeType: "application/json",
          })),
        }),
      }),
      {
        title: "Database schema",
        description: "Tables and fields of a database (ids, names, types, foreign keys)",
        mimeType: "application/json",
      },
      async (uri, vars) => json(uri, summarizeSchema(await getDatabaseMetadata(client, idVar(vars.id, "database"))))
    );
    names.push("databases", "database-schema");
  }

  if (enabledToolsets.has("cards")) {
    server.registerResource(
      "card",
      new ResourceTemplate("metabase://card/{id}", { list: undefined }),
      { title: "Card", description: "A saved question/model/metric: query (SQL or MBQL), display, parameters", mimeType: "application/json" },
      async (uri, vars) => json(uri, summarizeCard(await getCard(client, idVar(vars.id, "card"))))
    );
    names.push("card");
  }

  if (enabledToolsets.has("dashboards")) {
    server.registerResource(
      "dashboard",
      new ResourceTemplate("metabase://dashboard/{id}", { list: undefined }),
      { title: "Dashboard", description: "A dashboard: its cards, tabs, layout and filters", mimeType: "application/json" },
      async (uri, vars) => json(uri, summarizeDashboard(await getDashboard(client, idVar(vars.id, "dashboard"))))
    );
    names.push("dashboard");
  }

  if (enabledToolsets.has("collections")) {
    server.registerResource(
      "collection",
      new ResourceTemplate("metabase://collection/{id}", { list: undefined }),
      { title: "Collection", description: "A collection and its items; use id 'root' for the root collection", mimeType: "application/json" },
      async (uri, vars) => {
        const raw = Array.isArray(vars.id) ? vars.id[0] : vars.id;
        if (raw === "root") {
          const items = await listCollectionItems(client, "root" as unknown as number);
          return json(uri, summarizeCollection({ id: "root", name: "Our analytics" }, items));
        }
        const id = idVar(raw, "collection");
        const [col, items] = await Promise.all([getCollection(client, id), listCollectionItems(client, id)]);
        return json(uri, summarizeCollection(col, items));
      }
    );
    names.push("collection");
  }

  return names;
};
