# Metabase MCP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an MCP server that extends Metabase with write tools for managing dashboards, questions, collections, and actions.

**Architecture:** Functional TypeScript with `openapi-fetch` for type-safe HTTP calls to Metabase's REST API, exposed as MCP tools via `@modelcontextprotocol/sdk` over stdio transport. Service functions sit between tools and the HTTP client.

**Tech Stack:** Bun (dev/build), TypeScript, `@modelcontextprotocol/sdk`, `openapi-fetch`, `openapi-typescript`, `zod`

---

### Task 1: Project scaffolding and type generation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `scripts/generate-types.ts`
- Create: `generated/metabase-api.d.ts`
- Create: `.gitignore`

- [ ] **Step 1: Initialize project**

```bash
cd /Users/serdnaley/WebstormProjects/personal/metabase-mcp
bun init -y
```

- [ ] **Step 2: Install dependencies**

```bash
bun add @modelcontextprotocol/sdk openapi-fetch zod
bun add -d openapi-typescript typescript @types/node
```

- [ ] **Step 3: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "resolveJsonModule": true,
    "types": ["node"]
  },
  "include": ["src/**/*", "generated/**/*"]
}
```

- [ ] **Step 4: Write the type generation script**

Create `scripts/generate-types.ts`:

```ts
import { writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import openapiTS, { astToString } from "openapi-typescript";

const SPEC_URL = "https://www.metabase.com/docs/master/api.json";

async function main() {
  console.log("Downloading Metabase OpenAPI spec...");
  const ast = await openapiTS(new URL(SPEC_URL));
  const contents = astToString(ast);

  await mkdir("generated", { recursive: true });
  writeFileSync("generated/metabase-api.d.ts", contents);
  console.log("Generated types at generated/metabase-api.d.ts");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 5: Add scripts to package.json**

Add to `package.json`:
```json
{
  "scripts": {
    "generate-types": "bun run scripts/generate-types.ts",
    "build": "bun build src/index.ts --outdir dist --target node",
    "dev": "bun run src/index.ts"
  },
  "bin": {
    "metabase-mcp": "dist/index.js"
  },
  "type": "module"
}
```

- [ ] **Step 6: Generate types**

```bash
bun run generate-types
```

Expected: `generated/metabase-api.d.ts` created with type definitions.

- [ ] **Step 7: Write .gitignore**

```
node_modules/
dist/
.env
```

- [ ] **Step 8: Verify TypeScript compiles**

```bash
bunx tsc --noEmit
```

Expected: No errors (there are no source files yet, so this just validates config).

- [ ] **Step 9: Commit**

```bash
git add package.json bun.lock tsconfig.json scripts/ generated/ .gitignore
git commit -m "feat: project scaffolding with OpenAPI type generation"
```

---

### Task 2: Config and client

**Files:**
- Create: `src/config.ts`
- Create: `src/client.ts`

- [ ] **Step 1: Write config.ts**

Create `src/config.ts`:

```ts
import { z } from "zod";

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

export type Config = z.infer<typeof configSchema>;

export const loadConfig = (): Config => {
  const raw = {
    metabaseUrl: process.env.METABASE_URL?.replace(/\/+$/, ""),
    apiKey: process.env.METABASE_API_KEY,
    email: process.env.METABASE_EMAIL,
    password: process.env.METABASE_PASSWORD,
    readOnly: process.env.METABASE_READ_ONLY_MODE === "true",
  };

  const result = configSchema.safeParse(raw);
  if (!result.success) {
    const errors = result.error.issues.map((i) => i.message).join(", ");
    console.error(`Configuration error: ${errors}`);
    process.exit(1);
  }

  return result.data;
};
```

- [ ] **Step 2: Write client.ts**

Create `src/client.ts`:

```ts
import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "../generated/metabase-api.js";
import type { Config } from "./config.js";

export type MetabaseClient = ReturnType<typeof createClient<paths>>;

const createAuthMiddleware = (config: Config): Middleware => ({
  async onRequest({ request }) {
    if (config.apiKey) {
      request.headers.set("X-API-Key", config.apiKey);
    }
    return request;
  },
});

const loginWithSession = async (
  baseUrl: string,
  email: string,
  password: string
): Promise<string> => {
  const res = await fetch(`${baseUrl}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Metabase login failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { id: string };
  return data.id;
};

const createSessionMiddleware = (sessionToken: string): Middleware => ({
  async onRequest({ request }) {
    request.headers.set("X-Metabase-Session", sessionToken);
    return request;
  },
});

export const createMetabaseClient = async (
  config: Config
): Promise<MetabaseClient> => {
  const client = createClient<paths>({ baseUrl: config.metabaseUrl });

  if (config.apiKey) {
    client.use(createAuthMiddleware(config));
  } else if (config.email && config.password) {
    const token = await loginWithSession(
      config.metabaseUrl,
      config.email,
      config.password
    );
    client.use(createSessionMiddleware(token));
  }

  return client;
};
```

- [ ] **Step 3: Verify it compiles**

```bash
bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/config.ts src/client.ts
git commit -m "feat: config parsing and Metabase HTTP client with auth"
```

---

### Task 3: Service layer — search, databases, tables, fields

**Files:**
- Create: `src/services/search.ts`
- Create: `src/services/databases.ts`
- Create: `src/services/tables.ts`

- [ ] **Step 1: Write search service**

Create `src/services/search.ts`:

```ts
import type { MetabaseClient } from "../client.js";

export const search = async (
  client: MetabaseClient,
  params: { q: string; models?: string[]; collection?: string }
) => {
  const { data, error } = await client.GET("/api/search", {
    params: {
      query: {
        q: params.q,
        models: params.models,
        collection: params.collection,
        archived: false,
        model_ancestors: false,
        include_dashboard_questions: false,
        include_metadata: false,
      },
    },
  });

  if (error) throw new Error(`Search failed: ${JSON.stringify(error)}`);
  return data;
};
```

- [ ] **Step 2: Write databases service**

Create `src/services/databases.ts`:

```ts
import type { MetabaseClient } from "../client.js";

export const listDatabases = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/database", {
    params: {
      query: {
        include_analytics: false,
        saved: false,
        include_editable_data_model: false,
        exclude_uneditable_details: true,
        include_only_uploadable: false,
      },
    },
  });

  if (error) throw new Error(`List databases failed: ${JSON.stringify(error)}`);
  return data;
};

export const getDatabase = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/database/{id}", {
    params: { path: { id } },
  });

  if (error) throw new Error(`Get database failed: ${JSON.stringify(error)}`);
  return data;
};

export const getDatabaseMetadata = async (
  client: MetabaseClient,
  id: number
) => {
  const { data, error } = await client.GET("/api/database/{id}/metadata", {
    params: {
      path: { id },
      query: {
        include_hidden: false,
        include_editable_data_model: false,
        remove_inactive: true,
        skip_fields: false,
      },
    },
  });

  if (error)
    throw new Error(`Get database metadata failed: ${JSON.stringify(error)}`);
  return data;
};

export const listDatabaseSchemas = async (
  client: MetabaseClient,
  id: number
) => {
  const { data, error } = await client.GET("/api/database/{id}/schemas", {
    params: {
      path: { id },
      query: {
        include_editable_data_model: false,
        include_hidden: false,
        include_workspace: false,
      },
    },
  });

  if (error)
    throw new Error(`List database schemas failed: ${JSON.stringify(error)}`);
  return data;
};

export const getDatabaseSchema = async (
  client: MetabaseClient,
  id: number,
  schema: string
) => {
  const { data, error } = await client.GET(
    "/api/database/{id}/schema/{schema}",
    {
      params: {
        path: { id, schema },
        query: {
          include_hidden: false,
          include_editable_data_model: false,
        },
      },
    }
  );

  if (error)
    throw new Error(`Get database schema failed: ${JSON.stringify(error)}`);
  return data;
};
```

- [ ] **Step 3: Write tables service**

Create `src/services/tables.ts`:

```ts
import type { MetabaseClient } from "../client.js";

export const getTable = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/table/{id}", {
    params: { path: { id } },
  });

  if (error) throw new Error(`Get table failed: ${JSON.stringify(error)}`);
  return data;
};

export const getTableQueryMetadata = async (
  client: MetabaseClient,
  id: number
) => {
  const { data, error } = await client.GET("/api/table/{id}/query_metadata", {
    params: {
      path: { id },
      query: {
        include_sensitive_fields: false,
        include_hidden_fields: false,
        include_editable_data_model: false,
      },
    },
  });

  if (error)
    throw new Error(`Get table query metadata failed: ${JSON.stringify(error)}`);
  return data;
};

export const getField = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/field/{id}", {
    params: {
      path: { id },
      query: { include_editable_data_model: false },
    },
  });

  if (error) throw new Error(`Get field failed: ${JSON.stringify(error)}`);
  return data;
};

export const getFieldValues = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/field/{id}/values", {
    params: { path: { id } },
  });

  if (error)
    throw new Error(`Get field values failed: ${JSON.stringify(error)}`);
  return data;
};
```

- [ ] **Step 4: Verify it compiles**

```bash
bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/services/
git commit -m "feat: service layer for search, databases, tables, fields"
```

---

### Task 4: Service layer — collections

**Files:**
- Create: `src/services/collections.ts`

- [ ] **Step 1: Write collections service**

Create `src/services/collections.ts`:

```ts
import type { MetabaseClient } from "../client.js";

export const listCollections = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/collection", {
    params: {
      query: {
        archived: false,
        "exclude-other-user-collections": false,
        "personal-only": false,
      },
    },
  });

  if (error)
    throw new Error(`List collections failed: ${JSON.stringify(error)}`);
  return data;
};

export const getCollection = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/collection/{id}", {
    params: { path: { id } },
  });

  if (error)
    throw new Error(`Get collection failed: ${JSON.stringify(error)}`);
  return data;
};

export const listCollectionItems = async (
  client: MetabaseClient,
  id: number,
  params?: { models?: string[]; sort_column?: string; sort_direction?: string }
) => {
  const { data, error } = await client.GET("/api/collection/{id}/items", {
    params: {
      path: { id },
      query: {
        models: params?.models,
        sort_column: params?.sort_column as any,
        sort_direction: params?.sort_direction as any,
        archived: false,
        include_can_run_adhoc_query: false,
        show_dashboard_questions: false,
      },
    },
  });

  if (error)
    throw new Error(`List collection items failed: ${JSON.stringify(error)}`);
  return data;
};

export const createCollection = async (
  client: MetabaseClient,
  params: { name: string; description?: string; parent_id?: number }
) => {
  const { data, error } = await client.POST("/api/collection", {
    body: {
      name: params.name,
      description: params.description ?? null,
      parent_id: params.parent_id ?? null,
    },
  });

  if (error)
    throw new Error(`Create collection failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateCollection = async (
  client: MetabaseClient,
  id: number,
  params: { name?: string; description?: string; parent_id?: number; archived?: boolean }
) => {
  const { data, error } = await client.PUT("/api/collection/{id}", {
    params: { path: { id } },
    body: {
      name: params.name ?? null,
      description: params.description ?? null,
      parent_id: params.parent_id ?? null,
      archived: params.archived ?? false,
    },
  });

  if (error)
    throw new Error(`Update collection failed: ${JSON.stringify(error)}`);
  return data;
};
```

- [ ] **Step 2: Verify it compiles**

```bash
bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/services/collections.ts
git commit -m "feat: collections service (list, get, create, update)"
```

---

### Task 5: Service layer — cards

**Files:**
- Create: `src/services/cards.ts`

- [ ] **Step 1: Write cards service**

Create `src/services/cards.ts`:

```ts
import type { MetabaseClient } from "../client.js";

export const listCards = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/card", {
    params: { query: { f: "all" } },
  });

  if (error) throw new Error(`List cards failed: ${JSON.stringify(error)}`);
  return data;
};

export const getCard = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/card/{id}", {
    params: { path: { id } },
  });

  if (error) throw new Error(`Get card failed: ${JSON.stringify(error)}`);
  return data;
};

export const createCard = async (
  client: MetabaseClient,
  params: {
    name: string;
    dataset_query: Record<string, unknown>;
    display: string;
    description?: string;
    collection_id?: number;
    visualization_settings?: Record<string, unknown>;
  }
) => {
  const { data, error } = await client.POST("/api/card", {
    body: {
      name: params.name,
      dataset_query: params.dataset_query,
      display: params.display as any,
      description: params.description ?? null,
      collection_id: params.collection_id ?? null,
      visualization_settings: params.visualization_settings ?? {},
    },
  });

  if (error) throw new Error(`Create card failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateCard = async (
  client: MetabaseClient,
  id: number,
  params: {
    name?: string;
    dataset_query?: Record<string, unknown>;
    display?: string;
    description?: string;
    collection_id?: number;
    visualization_settings?: Record<string, unknown>;
    archived?: boolean;
  }
) => {
  const { data, error } = await client.PUT("/api/card/{id}", {
    params: { path: { id } },
    body: {
      name: params.name ?? null,
      dataset_query: params.dataset_query ?? null,
      display: (params.display as any) ?? null,
      description: params.description ?? null,
      collection_id: params.collection_id ?? null,
      visualization_settings: params.visualization_settings ?? null,
      archived: params.archived ?? null,
    },
  });

  if (error) throw new Error(`Update card failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteCard = async (client: MetabaseClient, id: number) => {
  const { error } = await client.DELETE("/api/card/{id}", {
    params: { path: { id } },
  });

  if (error) throw new Error(`Delete card failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const copyCard = async (
  client: MetabaseClient,
  id: number,
  params?: { collection_id?: number }
) => {
  const { data, error } = await client.POST("/api/card/{id}/copy", {
    params: { path: { id } },
    body: { collection_id: params?.collection_id },
  });

  if (error) throw new Error(`Copy card failed: ${JSON.stringify(error)}`);
  return data;
};

export const executeCardQuery = async (
  client: MetabaseClient,
  cardId: number,
  params?: { parameters?: Record<string, unknown> }
) => {
  const { data, error } = await client.POST("/api/card/{card-id}/query", {
    params: { path: { "card-id": cardId } },
    body: {
      ignore_cache: false,
      parameters: params?.parameters as any,
    },
  });

  if (error)
    throw new Error(`Execute card query failed: ${JSON.stringify(error)}`);
  return data;
};
```

- [ ] **Step 2: Verify it compiles**

```bash
bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/services/cards.ts
git commit -m "feat: cards service (list, get, create, update, delete, copy, execute)"
```

---

### Task 6: Service layer — dashboards

**Files:**
- Create: `src/services/dashboards.ts`

- [ ] **Step 1: Write dashboards service**

Create `src/services/dashboards.ts`:

```ts
import type { MetabaseClient } from "../client.js";

export const listDashboards = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/dashboard", {
    params: { query: {} },
  });

  if (error)
    throw new Error(`List dashboards failed: ${JSON.stringify(error)}`);
  return data;
};

export const getDashboard = async (client: MetabaseClient, id: number) => {
  const { data, error } = await client.GET("/api/dashboard/{id}", {
    params: { path: { id } },
  });

  if (error)
    throw new Error(`Get dashboard failed: ${JSON.stringify(error)}`);
  return data;
};

export const createDashboard = async (
  client: MetabaseClient,
  params: {
    name: string;
    description?: string;
    collection_id?: number;
    parameters?: Record<string, unknown>[];
  }
) => {
  const { data, error } = await client.POST("/api/dashboard", {
    body: {
      name: params.name,
      description: params.description ?? null,
      collection_id: params.collection_id ?? null,
      parameters: (params.parameters as any) ?? null,
    },
  });

  if (error)
    throw new Error(`Create dashboard failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateDashboard = async (
  client: MetabaseClient,
  id: number,
  params: {
    name?: string;
    description?: string;
    collection_id?: number;
    archived?: boolean;
    parameters?: Record<string, unknown>[];
  }
) => {
  const { data, error } = await client.PUT("/api/dashboard/{id}", {
    params: { path: { id } },
    body: {
      name: params.name ?? null,
      description: params.description ?? null,
      collection_id: params.collection_id ?? null,
      archived: params.archived ?? null,
      parameters: (params.parameters as any) ?? null,
    },
  });

  if (error)
    throw new Error(`Update dashboard failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteDashboard = async (client: MetabaseClient, id: number) => {
  const { error } = await client.DELETE("/api/dashboard/{id}", {
    params: { path: { id } },
  });

  if (error)
    throw new Error(`Delete dashboard failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const copyDashboard = async (
  client: MetabaseClient,
  fromDashboardId: number,
  params?: {
    name?: string;
    description?: string;
    collection_id?: number;
    is_deep_copy?: boolean;
  }
) => {
  const { data, error } = await client.POST(
    "/api/dashboard/{from-dashboard-id}/copy",
    {
      params: { path: { "from-dashboard-id": fromDashboardId } },
      body: {
        name: params?.name ?? null,
        description: params?.description ?? null,
        collection_id: params?.collection_id ?? null,
        is_deep_copy: params?.is_deep_copy ?? false,
      },
    }
  );

  if (error)
    throw new Error(`Copy dashboard failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateDashboardCards = async (
  client: MetabaseClient,
  id: number,
  cards: Array<{
    id?: number;
    card_id?: number;
    row: number;
    col: number;
    size_x: number;
    size_y: number;
    parameter_mappings?: Record<string, unknown>[];
    visualization_settings?: Record<string, unknown>;
    series?: Record<string, unknown>[];
  }>
) => {
  const { data, error } = await client.PUT("/api/dashboard/{id}/cards", {
    params: { path: { id } },
    body: { cards: cards as any },
  });

  if (error)
    throw new Error(`Update dashboard cards failed: ${JSON.stringify(error)}`);
  return data;
};
```

- [ ] **Step 2: Verify it compiles**

```bash
bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/services/dashboards.ts
git commit -m "feat: dashboards service (list, get, create, update, delete, copy, update cards)"
```

---

### Task 7: Service layer — actions and dataset

**Files:**
- Create: `src/services/actions.ts`
- Create: `src/services/dataset.ts`

- [ ] **Step 1: Write actions service**

Create `src/services/actions.ts`:

```ts
import type { MetabaseClient } from "../client.js";

export const listActions = async (
  client: MetabaseClient,
  params?: { model_id?: number }
) => {
  const { data, error } = await client.GET("/api/action", {
    params: { query: { "model-id": params?.model_id } },
  });

  if (error) throw new Error(`List actions failed: ${JSON.stringify(error)}`);
  return data;
};

export const getAction = async (client: MetabaseClient, actionId: number) => {
  const { data, error } = await client.GET("/api/action/{action-id}", {
    params: { path: { "action-id": actionId } },
  });

  if (error) throw new Error(`Get action failed: ${JSON.stringify(error)}`);
  return data;
};

export const createAction = async (
  client: MetabaseClient,
  params: Record<string, unknown>
) => {
  const { data, error } = await client.POST("/api/action", {
    body: params as any,
  });

  if (error) throw new Error(`Create action failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateAction = async (
  client: MetabaseClient,
  id: number,
  params: Record<string, unknown>
) => {
  const { data, error } = await client.PUT("/api/action/{id}", {
    params: { path: { id } },
    body: params as any,
  });

  if (error) throw new Error(`Update action failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteAction = async (client: MetabaseClient, actionId: number) => {
  const { error } = await client.DELETE("/api/action/{action-id}", {
    params: { path: { "action-id": actionId } },
  });

  if (error) throw new Error(`Delete action failed: ${JSON.stringify(error)}`);
  return { success: true };
};

export const executeAction = async (
  client: MetabaseClient,
  id: number,
  params?: { parameters?: Record<string, unknown> }
) => {
  const { data, error } = await client.POST("/api/action/{id}/execute", {
    params: { path: { id } },
    body: { parameters: params?.parameters ?? null },
  });

  if (error)
    throw new Error(`Execute action failed: ${JSON.stringify(error)}`);
  return data;
};
```

- [ ] **Step 2: Write dataset service**

Create `src/services/dataset.ts`:

```ts
import type { MetabaseClient } from "../client.js";

export const executeQuery = async (
  client: MetabaseClient,
  params: {
    database: number;
    type: "native" | "query";
    native?: { query: string; template_tags?: Record<string, unknown> };
    query?: Record<string, unknown>;
  }
) => {
  const { data, error } = await client.POST("/api/dataset", {
    body: {
      database: params.database,
      type: params.type,
      native: params.native,
      query: params.query,
    } as any,
  });

  if (error)
    throw new Error(`Execute query failed: ${JSON.stringify(error)}`);
  return data;
};
```

- [ ] **Step 3: Verify it compiles**

```bash
bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/services/actions.ts src/services/dataset.ts
git commit -m "feat: actions and dataset services"
```

---

### Task 8: MCP tool registrations — search, databases, tables

**Files:**
- Create: `src/tools/search.ts`
- Create: `src/tools/databases.ts`
- Create: `src/tools/tables.ts`

- [ ] **Step 1: Write search tool**

Create `src/tools/search.ts`:

```ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import { search as searchService } from "../services/search.js";

export const registerSearchTools = (
  server: McpServer,
  client: MetabaseClient
) => {
  server.tool(
    "search",
    "Search across all Metabase entities (cards, dashboards, collections, tables, etc.)",
    {
      q: z.string().describe("Search query string"),
      models: z
        .array(
          z.enum([
            "card",
            "dashboard",
            "collection",
            "table",
            "database",
            "action",
            "segment",
            "metric",
          ])
        )
        .optional()
        .describe("Filter by entity types"),
      collection: z
        .string()
        .optional()
        .describe("Filter by collection ID"),
    },
    async (params) => {
      const result = await searchService(client, params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );
};
```

- [ ] **Step 2: Write databases tools**

Create `src/tools/databases.ts`:

```ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import {
  listDatabases as listDatabasesService,
  getDatabase as getDatabaseService,
  getDatabaseMetadata as getDatabaseMetadataService,
  listDatabaseSchemas as listDatabaseSchemasService,
  getDatabaseSchema as getDatabaseSchemaService,
} from "../services/databases.js";

export const registerDatabaseTools = (
  server: McpServer,
  client: MetabaseClient
) => {
  server.tool(
    "list_databases",
    "List all databases the user has access to",
    {},
    async () => {
      const result = await listDatabasesService(client);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_database",
    "Get database details by ID",
    { id: z.number().describe("Database ID") },
    async ({ id }) => {
      const result = await getDatabaseService(client, id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_database_metadata",
    "Get full database metadata: tables, fields, types, relationships",
    { id: z.number().describe("Database ID") },
    async ({ id }) => {
      const result = await getDatabaseMetadataService(client, id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "list_database_schemas",
    "List schemas in a database",
    { id: z.number().describe("Database ID") },
    async ({ id }) => {
      const result = await listDatabaseSchemasService(client, id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_database_schema",
    "Get tables within a specific database schema",
    {
      id: z.number().describe("Database ID"),
      schema: z.string().describe("Schema name"),
    },
    async ({ id, schema }) => {
      const result = await getDatabaseSchemaService(client, id, schema);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );
};
```

- [ ] **Step 3: Write tables tools**

Create `src/tools/tables.ts`:

```ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import {
  getTable as getTableService,
  getTableQueryMetadata as getTableQueryMetadataService,
  getField as getFieldService,
  getFieldValues as getFieldValuesService,
} from "../services/tables.js";

export const registerTableTools = (
  server: McpServer,
  client: MetabaseClient
) => {
  server.tool(
    "get_table",
    "Get table details and field info",
    { id: z.number().describe("Table ID") },
    async ({ id }) => {
      const result = await getTableService(client, id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_table_query_metadata",
    "Get full query metadata for a table (fields, FKs, metrics)",
    { id: z.number().describe("Table ID") },
    async ({ id }) => {
      const result = await getTableQueryMetadataService(client, id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_field",
    "Get field details including type, special type, fingerprint",
    { id: z.number().describe("Field ID") },
    async ({ id }) => {
      const result = await getFieldService(client, id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_field_values",
    "Get sample values for a field",
    { id: z.number().describe("Field ID") },
    async ({ id }) => {
      const result = await getFieldValuesService(client, id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );
};
```

- [ ] **Step 4: Verify it compiles**

```bash
bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/tools/search.ts src/tools/databases.ts src/tools/tables.ts
git commit -m "feat: MCP tool registrations for search, databases, tables"
```

---

### Task 9: MCP tool registrations — collections

**Files:**
- Create: `src/tools/collections.ts`

- [ ] **Step 1: Write collections tools**

Create `src/tools/collections.ts`:

```ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  listCollections as listCollectionsService,
  getCollection as getCollectionService,
  listCollectionItems as listCollectionItemsService,
  createCollection as createCollectionService,
  updateCollection as updateCollectionService,
} from "../services/collections.js";

export const registerCollectionTools = (
  server: McpServer,
  client: MetabaseClient,
  config: Config
) => {
  server.tool(
    "list_collections",
    "List all collections",
    {},
    async () => {
      const result = await listCollectionsService(client);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_collection",
    "Get collection details",
    { id: z.number().describe("Collection ID") },
    async ({ id }) => {
      const result = await getCollectionService(client, id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "list_collection_items",
    "List items in a collection (cards, dashboards, sub-collections)",
    {
      id: z.number().describe("Collection ID"),
      models: z
        .array(z.enum(["card", "dashboard", "collection", "snippet", "pulse", "timeline"]))
        .optional()
        .describe("Filter by item types"),
      sort_column: z
        .enum(["name", "last_edited_at", "last_edited_by", "model"])
        .optional()
        .describe("Column to sort by"),
      sort_direction: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
    },
    async ({ id, ...params }) => {
      const result = await listCollectionItemsService(client, id, params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  if (!config.readOnly) {
    server.tool(
      "create_collection",
      "Create a new collection",
      {
        name: z.string().describe("Collection name"),
        description: z.string().optional().describe("Collection description"),
        parent_id: z.number().optional().describe("Parent collection ID"),
      },
      async (params) => {
        const result = await createCollectionService(client, params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );

    server.tool(
      "update_collection",
      "Update collection properties",
      {
        id: z.number().describe("Collection ID"),
        name: z.string().optional().describe("New name"),
        description: z.string().optional().describe("New description"),
        parent_id: z.number().optional().describe("New parent collection ID"),
        archived: z.boolean().optional().describe("Archive the collection"),
      },
      async ({ id, ...params }) => {
        const result = await updateCollectionService(client, id, params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );
  }
};
```

- [ ] **Step 2: Verify it compiles**

```bash
bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/tools/collections.ts
git commit -m "feat: MCP tool registrations for collections"
```

---

### Task 10: MCP tool registrations — cards

**Files:**
- Create: `src/tools/cards.ts`

- [ ] **Step 1: Write cards tools**

Create `src/tools/cards.ts`:

```ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  listCards as listCardsService,
  getCard as getCardService,
  createCard as createCardService,
  updateCard as updateCardService,
  deleteCard as deleteCardService,
  copyCard as copyCardService,
  executeCardQuery as executeCardQueryService,
} from "../services/cards.js";

export const registerCardTools = (
  server: McpServer,
  client: MetabaseClient,
  config: Config
) => {
  server.tool(
    "list_cards",
    "List all saved questions",
    {},
    async () => {
      const result = await listCardsService(client);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_card",
    "Get card details (query definition, visualization settings)",
    { id: z.number().describe("Card ID") },
    async ({ id }) => {
      const result = await getCardService(client, id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "execute_card_query",
    "Run a saved question and return results",
    {
      card_id: z.number().describe("Card ID"),
      parameters: z
        .record(z.unknown())
        .optional()
        .describe("Query parameters as key-value pairs"),
    },
    async ({ card_id, parameters }) => {
      const result = await executeCardQueryService(client, card_id, {
        parameters,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  if (!config.readOnly) {
    server.tool(
      "create_card",
      "Create a new question (native SQL or structured query)",
      {
        name: z.string().describe("Question name"),
        dataset_query: z
          .record(z.unknown())
          .describe(
            'Query definition. For native SQL: { type: "native", native: { query: "SELECT ..." }, database: 1 }. For structured: { type: "query", query: { "source-table": 1 }, database: 1 }'
          ),
        display: z
          .string()
          .describe(
            'Visualization type: "table", "bar", "line", "pie", "scalar", "row", "area", "combo", "pivot", "smartscalar", "gauge", "progress", "funnel", "map", "scatter", "waterfall"'
          ),
        description: z.string().optional().describe("Question description"),
        collection_id: z.number().optional().describe("Collection to save in"),
        visualization_settings: z
          .record(z.unknown())
          .optional()
          .describe("Visualization settings"),
      },
      async (params) => {
        const result = await createCardService(client, params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );

    server.tool(
      "update_card",
      "Update question query, display, name, or other properties",
      {
        id: z.number().describe("Card ID"),
        name: z.string().optional().describe("New name"),
        dataset_query: z.record(z.unknown()).optional().describe("New query definition"),
        display: z.string().optional().describe("New visualization type"),
        description: z.string().optional().describe("New description"),
        collection_id: z.number().optional().describe("Move to collection"),
        visualization_settings: z
          .record(z.unknown())
          .optional()
          .describe("New visualization settings"),
        archived: z.boolean().optional().describe("Archive the card"),
      },
      async ({ id, ...params }) => {
        const result = await updateCardService(client, id, params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );

    server.tool(
      "delete_card",
      "Delete a card (question)",
      { id: z.number().describe("Card ID") },
      async ({ id }) => {
        const result = await deleteCardService(client, id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );

    server.tool(
      "copy_card",
      "Copy a card to a collection",
      {
        id: z.number().describe("Card ID to copy"),
        collection_id: z.number().optional().describe("Target collection ID"),
      },
      async ({ id, collection_id }) => {
        const result = await copyCardService(client, id, { collection_id });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );
  }
};
```

- [ ] **Step 2: Verify it compiles**

```bash
bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/tools/cards.ts
git commit -m "feat: MCP tool registrations for cards"
```

---

### Task 11: MCP tool registrations — dashboards

**Files:**
- Create: `src/tools/dashboards.ts`

- [ ] **Step 1: Write dashboards tools**

Create `src/tools/dashboards.ts`:

```ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  listDashboards as listDashboardsService,
  getDashboard as getDashboardService,
  createDashboard as createDashboardService,
  updateDashboard as updateDashboardService,
  deleteDashboard as deleteDashboardService,
  copyDashboard as copyDashboardService,
  updateDashboardCards as updateDashboardCardsService,
} from "../services/dashboards.js";

export const registerDashboardTools = (
  server: McpServer,
  client: MetabaseClient,
  config: Config
) => {
  server.tool(
    "list_dashboards",
    "List all dashboards",
    {},
    async () => {
      const result = await listDashboardsService(client);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_dashboard",
    "Get dashboard with all cards and layout",
    { id: z.number().describe("Dashboard ID") },
    async ({ id }) => {
      const result = await getDashboardService(client, id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  if (!config.readOnly) {
    server.tool(
      "create_dashboard",
      "Create a new dashboard",
      {
        name: z.string().describe("Dashboard name"),
        description: z.string().optional().describe("Dashboard description"),
        collection_id: z.number().optional().describe("Collection to save in"),
        parameters: z
          .array(z.record(z.unknown()))
          .optional()
          .describe("Dashboard filter parameters"),
      },
      async (params) => {
        const result = await createDashboardService(client, params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );

    server.tool(
      "update_dashboard",
      "Update dashboard properties (name, description, filters)",
      {
        id: z.number().describe("Dashboard ID"),
        name: z.string().optional().describe("New name"),
        description: z.string().optional().describe("New description"),
        collection_id: z.number().optional().describe("Move to collection"),
        archived: z.boolean().optional().describe("Archive the dashboard"),
        parameters: z
          .array(z.record(z.unknown()))
          .optional()
          .describe("Updated filter parameters"),
      },
      async ({ id, ...params }) => {
        const result = await updateDashboardService(client, id, params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );

    server.tool(
      "delete_dashboard",
      "Delete a dashboard",
      { id: z.number().describe("Dashboard ID") },
      async ({ id }) => {
        const result = await deleteDashboardService(client, id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );

    server.tool(
      "copy_dashboard",
      "Copy a dashboard to a collection",
      {
        from_dashboard_id: z.number().describe("Dashboard ID to copy"),
        name: z.string().optional().describe("Name for the copy"),
        description: z.string().optional().describe("Description for the copy"),
        collection_id: z.number().optional().describe("Target collection ID"),
        is_deep_copy: z
          .boolean()
          .optional()
          .describe("Deep copy cards too (default: false)"),
      },
      async ({ from_dashboard_id, ...params }) => {
        const result = await copyDashboardService(
          client,
          from_dashboard_id,
          params
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );

    server.tool(
      "update_dashboard_cards",
      "Add, remove, or reposition cards on a dashboard",
      {
        id: z.number().describe("Dashboard ID"),
        cards: z
          .array(
            z.object({
              id: z.number().optional().describe("Existing dashcard ID (for updates)"),
              card_id: z.number().optional().describe("Card (question) ID to add"),
              row: z.number().describe("Row position (0-based)"),
              col: z.number().describe("Column position (0-based)"),
              size_x: z.number().describe("Width in grid units"),
              size_y: z.number().describe("Height in grid units"),
              parameter_mappings: z
                .array(z.record(z.unknown()))
                .optional()
                .describe("Parameter mappings for filters"),
              visualization_settings: z
                .record(z.unknown())
                .optional()
                .describe("Per-card visualization overrides"),
              series: z
                .array(z.record(z.unknown()))
                .optional()
                .describe("Additional series for multi-series cards"),
            })
          )
          .describe("Array of card positions and settings"),
      },
      async ({ id, cards }) => {
        const result = await updateDashboardCardsService(client, id, cards);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );
  }
};
```

- [ ] **Step 2: Verify it compiles**

```bash
bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/tools/dashboards.ts
git commit -m "feat: MCP tool registrations for dashboards"
```

---

### Task 12: MCP tool registrations — actions, dataset, and tool index

**Files:**
- Create: `src/tools/actions.ts`
- Create: `src/tools/dataset.ts`
- Create: `src/tools/index.ts`

- [ ] **Step 1: Write actions tools**

Create `src/tools/actions.ts`:

```ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  listActions as listActionsService,
  getAction as getActionService,
  createAction as createActionService,
  updateAction as updateActionService,
  deleteAction as deleteActionService,
  executeAction as executeActionService,
} from "../services/actions.js";

export const registerActionTools = (
  server: McpServer,
  client: MetabaseClient,
  config: Config
) => {
  server.tool(
    "list_actions",
    "List all actions",
    {
      model_id: z.number().optional().describe("Filter by model ID"),
    },
    async (params) => {
      const result = await listActionsService(client, params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_action",
    "Get action details",
    { action_id: z.number().describe("Action ID") },
    async ({ action_id }) => {
      const result = await getActionService(client, action_id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  if (!config.readOnly) {
    server.tool(
      "create_action",
      "Create a new action (HTTP, query, or implicit)",
      {
        action: z
          .record(z.unknown())
          .describe(
            'Action definition. Must include "type" (http, query, or implicit), "name", "model_id", and type-specific fields'
          ),
      },
      async ({ action }) => {
        const result = await createActionService(client, action);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );

    server.tool(
      "update_action",
      "Update an action",
      {
        id: z.number().describe("Action ID"),
        action: z.record(z.unknown()).describe("Fields to update"),
      },
      async ({ id, action }) => {
        const result = await updateActionService(client, id, action);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );

    server.tool(
      "delete_action",
      "Delete an action",
      { action_id: z.number().describe("Action ID") },
      async ({ action_id }) => {
        const result = await deleteActionService(client, action_id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );

    server.tool(
      "execute_action",
      "Run an action with optional parameters",
      {
        id: z.number().describe("Action ID"),
        parameters: z
          .record(z.unknown())
          .optional()
          .describe("Action parameters as key-value pairs"),
      },
      async ({ id, parameters }) => {
        const result = await executeActionService(client, id, { parameters });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
    );
  }
};
```

- [ ] **Step 2: Write dataset tool**

Create `src/tools/dataset.ts`:

```ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import { executeQuery as executeQueryService } from "../services/dataset.js";

export const registerDatasetTools = (
  server: McpServer,
  client: MetabaseClient
) => {
  server.tool(
    "execute_query",
    "Run an ad-hoc query (native SQL or structured) and return results",
    {
      database: z.number().describe("Database ID to query"),
      type: z.enum(["native", "query"]).describe("Query type: native SQL or structured"),
      native: z
        .object({
          query: z.string().describe("SQL query string"),
          template_tags: z
            .record(z.unknown())
            .optional()
            .describe("Template tags for parameterized queries"),
        })
        .optional()
        .describe('Required when type is "native"'),
      query: z
        .record(z.unknown())
        .optional()
        .describe(
          'Required when type is "query". Structured query definition, e.g. { "source-table": 1, "filter": [...] }'
        ),
    },
    async (params) => {
      const result = await executeQueryService(client, params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );
};
```

- [ ] **Step 3: Write tool index**

Create `src/tools/index.ts`:

```ts
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { registerSearchTools } from "./search.js";
import { registerDatabaseTools } from "./databases.js";
import { registerTableTools } from "./tables.js";
import { registerCollectionTools } from "./collections.js";
import { registerCardTools } from "./cards.js";
import { registerDashboardTools } from "./dashboards.js";
import { registerActionTools } from "./actions.js";
import { registerDatasetTools } from "./dataset.js";

export const registerAllTools = (
  server: McpServer,
  client: MetabaseClient,
  config: Config
) => {
  registerSearchTools(server, client);
  registerDatabaseTools(server, client);
  registerTableTools(server, client);
  registerCollectionTools(server, client, config);
  registerCardTools(server, client, config);
  registerDashboardTools(server, client, config);
  registerActionTools(server, client, config);
  registerDatasetTools(server, client);
};
```

- [ ] **Step 4: Verify it compiles**

```bash
bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/tools/
git commit -m "feat: MCP tool registrations for actions, dataset, and tool index"
```

---

### Task 13: Entry point and MCP server

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: Write the entry point**

Create `src/index.ts`:

```ts
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { createMetabaseClient } from "./client.js";
import { registerAllTools } from "./tools/index.js";

const main = async () => {
  const config = loadConfig();
  const client = await createMetabaseClient(config);

  const server = new McpServer({
    name: "metabase-mcp",
    version: "0.1.0",
  });

  registerAllTools(server, client, config);

  const transport = new StdioServerTransport();
  await server.connect(transport);
};

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Verify it compiles**

```bash
bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Build**

```bash
bun run build
```

Expected: `dist/index.js` created.

- [ ] **Step 4: Verify the built file has the shebang**

```bash
head -1 dist/index.js
```

Expected: `#!/usr/bin/env node`

If the shebang is missing, prepend it:
```bash
echo '#!/usr/bin/env node' | cat - dist/index.js > dist/index.tmp && mv dist/index.tmp dist/index.js
```

- [ ] **Step 5: Commit**

```bash
git add src/index.ts
git commit -m "feat: MCP server entry point with stdio transport"
```

---

### Task 14: Package configuration for npm publishing

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update package.json for publishing**

Update `package.json` with the following fields (merge with existing content):

```json
{
  "name": "@serdnaley/metabase-mcp",
  "version": "0.1.0",
  "description": "MCP server for Metabase — extends the built-in MCP with write tools for managing dashboards, questions, collections, and actions",
  "type": "module",
  "bin": {
    "metabase-mcp": "dist/index.js"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "generate-types": "bun run scripts/generate-types.ts",
    "build": "bun build src/index.ts --outdir dist --target node",
    "dev": "bun run src/index.ts",
    "prepublishOnly": "bun run build"
  },
  "keywords": ["metabase", "mcp", "model-context-protocol", "ai", "dashboards"],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/serdnaley/metabase-mcp"
  }
}
```

- [ ] **Step 2: Verify build produces publishable output**

```bash
bun run build && ls -la dist/
```

Expected: `dist/index.js` exists.

- [ ] **Step 3: Test dry-run publish**

```bash
npm pack --dry-run
```

Expected: Shows files that would be included — only `dist/` and `package.json`.

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "feat: package configuration for npm publishing"
```

---

### Task 15: Manual smoke test

**Files:** None (testing only)

- [ ] **Step 1: Build the project**

```bash
bun run build
```

Expected: `dist/index.js` created without errors.

- [ ] **Step 2: Test with missing env vars**

```bash
node dist/index.js
```

Expected: Error message about missing `METABASE_URL` or auth credentials, then exit.

- [ ] **Step 3: Test MCP tool listing (if you have a Metabase instance)**

If you have a Metabase instance available:

```bash
METABASE_URL=http://localhost:3000 METABASE_API_KEY=mb_xxx node dist/index.js
```

Then from another terminal, use the MCP inspector or connect from Claude Code:

```bash
claude mcp add metabase-local -- node /path/to/dist/index.js
```

Verify tools are listed and basic operations work.

- [ ] **Step 4: Test read-only mode**

```bash
METABASE_URL=http://localhost:3000 METABASE_API_KEY=mb_xxx METABASE_READ_ONLY_MODE=true node dist/index.js
```

Verify that only 15 read tools are registered (no create/update/delete tools).

- [ ] **Step 5: Commit any fixes**

If any fixes were needed during testing, commit them:

```bash
git add -A
git commit -m "fix: address issues found during smoke testing"
```
