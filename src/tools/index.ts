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
import { registerUserTools } from "./users.js";
import { registerPermissionTools } from "./permissions.js";
import { registerSegmentTools } from "./segments.js";
import { registerRevisionTools } from "./revisions.js";
import { registerSettingTools } from "./settings.js";
import { registerNotificationTools } from "./notifications.js";
import { registerXrayTools } from "./xrays.js";
import { registerCacheTools } from "./cache.js";
import { registerPersistenceTools } from "./persistence.js";
import { registerUploadTools } from "./upload.js";
import { registerActivityTools } from "./activity.js";
import { registerSnippetTools } from "./snippets.js";
import { registerGlossaryTools } from "./glossary.js";
import { registerDocumentTools } from "./documents.js";
import { registerTimelineTools } from "./timelines.js";
import { registerBookmarkTools } from "./bookmarks.js";
import { registerModerationTools } from "./moderation.js";
import { registerEidTranslationTools } from "./eid-translation.js";
import { registerMetricTools } from "./metrics.js";
import { registerMeasureTools } from "./measures.js";
import { registerTransformTools } from "./transforms.js";
import { registerExportTools } from "./exports.js";

export type ToolModule = {
  /** Toolset id used in METABASE_TOOLSETS */
  toolset: string;
  /** Human-readable domain label (README, docs) */
  label: string;
  register: (server: McpServer, client: MetabaseClient, config: Config) => void;
};

/** Every tool domain, in registration order. One module = one toolset. */
export const TOOL_MODULES: ToolModule[] = [
  { toolset: "search", label: "Search", register: (s, c) => registerSearchTools(s, c) },
  { toolset: "databases", label: "Databases", register: (s, c, cfg) => registerDatabaseTools(s, c, cfg) },
  { toolset: "tables", label: "Tables & Fields", register: (s, c, cfg) => registerTableTools(s, c, cfg) },
  { toolset: "collections", label: "Collections", register: (s, c, cfg) => registerCollectionTools(s, c, cfg) },
  { toolset: "cards", label: "Cards", register: (s, c, cfg) => registerCardTools(s, c, cfg) },
  { toolset: "dashboards", label: "Dashboards", register: (s, c, cfg) => registerDashboardTools(s, c, cfg) },
  { toolset: "actions", label: "Actions", register: (s, c, cfg) => registerActionTools(s, c, cfg) },
  { toolset: "dataset", label: "Dataset (ad-hoc queries)", register: (s, c) => registerDatasetTools(s, c) },
  { toolset: "users", label: "Users & Groups", register: (s, c, cfg) => registerUserTools(s, c, cfg) },
  { toolset: "permissions", label: "Permissions", register: (s, c, cfg) => registerPermissionTools(s, c, cfg) },
  { toolset: "segments", label: "Segments", register: (s, c, cfg) => registerSegmentTools(s, c, cfg) },
  { toolset: "revisions", label: "Revisions", register: (s, c, cfg) => registerRevisionTools(s, c, cfg) },
  { toolset: "settings", label: "Settings", register: (s, c, cfg) => registerSettingTools(s, c, cfg) },
  { toolset: "notifications", label: "Alerts & Subscriptions", register: (s, c, cfg) => registerNotificationTools(s, c, cfg) },
  { toolset: "xrays", label: "X-Rays", register: (s, c) => registerXrayTools(s, c) },
  { toolset: "cache", label: "Cache", register: (s, c, cfg) => registerCacheTools(s, c, cfg) },
  { toolset: "persistence", label: "Model Persistence", register: (s, c, cfg) => registerPersistenceTools(s, c, cfg) },
  { toolset: "upload", label: "Uploads", register: (s, c, cfg) => registerUploadTools(s, c, cfg) },
  { toolset: "activity", label: "Activity & Tasks", register: (s, c) => registerActivityTools(s, c) },
  { toolset: "snippets", label: "Snippets", register: (s, c, cfg) => registerSnippetTools(s, c, cfg) },
  { toolset: "glossary", label: "Glossary", register: (s, c, cfg) => registerGlossaryTools(s, c, cfg) },
  { toolset: "documents", label: "Documents", register: (s, c, cfg) => registerDocumentTools(s, c, cfg) },
  { toolset: "timelines", label: "Timelines", register: (s, c, cfg) => registerTimelineTools(s, c, cfg) },
  { toolset: "bookmarks", label: "Bookmarks", register: (s, c, cfg) => registerBookmarkTools(s, c, cfg) },
  { toolset: "moderation", label: "Moderation", register: (s, c, cfg) => registerModerationTools(s, c, cfg) },
  { toolset: "eid-translation", label: "EID Translation", register: (s, c) => registerEidTranslationTools(s, c) },
  { toolset: "metrics", label: "Metrics", register: (s, c, cfg) => registerMetricTools(s, c, cfg) },
  { toolset: "measures", label: "Measures", register: (s, c, cfg) => registerMeasureTools(s, c, cfg) },
  { toolset: "transforms", label: "Transforms", register: (s, c, cfg) => registerTransformTools(s, c, cfg) },
  { toolset: "exports", label: "Exports", register: (s, c, cfg) => registerExportTools(s, c, cfg) },
];

/** Registers every tool on the server (no toolset filtering, no annotations). */
export const registerAllTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  for (const mod of TOOL_MODULES) mod.register(server, client, config);
};
