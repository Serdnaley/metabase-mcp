import { describe, test, expect } from "bun:test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getTestClient } from "../helpers.js";
import { registerAllTools } from "../../src/tools/index.js";

const READ_ONLY_TOOLS = [
  "execute_card_query",
  "execute_query",
  "generate_xray",
  "get_action",
  "get_activity",
  "get_alert",
  "get_card",
  "get_collection",
  "get_collection_permissions",
  "get_collection_tree",
  "get_current_user",
  "get_dashboard",
  "get_database",
  "get_database_metadata",
  "get_database_schema",
  "get_document",
  "get_field",
  "get_field_values",
  "get_glossary_term",
  "get_permissions_graph",
  "get_segment",
  "get_setting",
  "get_snippet",
  "get_table",
  "get_table_query_metadata",
  "get_task",
  "get_timeline",
  "get_user",
  "list_actions",
  "list_alerts",
  "list_bookmarks",
  "list_cards",
  "list_collection_items",
  "list_collections",
  "list_dashboard_subscriptions",
  "list_dashboards",
  "list_database_schemas",
  "list_databases",
  "list_documents",
  "list_glossary_terms",
  "list_groups",
  "list_revisions",
  "list_segments",
  "list_settings",
  "list_snippets",
  "list_tasks",
  "list_timelines",
  "list_users",
  "search",
  "translate_entity_ids",
];

const WRITE_TOOLS = [
  "add_group_member",
  "copy_card",
  "copy_dashboard",
  "create_action",
  "create_action_public_link",
  "create_alert",
  "create_bookmark",
  "create_card",
  "create_card_public_link",
  "create_collection",
  "create_dashboard",
  "create_dashboard_public_link",
  "create_dashboard_subscription",
  "create_database",
  "create_document",
  "create_glossary_term",
  "create_group",
  "create_moderation_review",
  "create_segment",
  "create_snippet",
  "create_timeline",
  "create_timeline_event",
  "create_user",
  "deactivate_user",
  "delete_action",
  "delete_action_public_link",
  "delete_alert",
  "delete_bookmark",
  "delete_card",
  "delete_card_public_link",
  "delete_dashboard",
  "delete_dashboard_public_link",
  "delete_dashboard_subscription",
  "delete_database",
  "delete_document",
  "delete_glossary_term",
  "delete_group",
  "delete_segment",
  "delete_snippet",
  "delete_timeline",
  "delete_timeline_event",
  "discard_field_values",
  "execute_action",
  "invalidate_cache",
  "notify_database",
  "persist_model",
  "reactivate_user",
  "refresh_persisted_model",
  "remove_group_member",
  "reorder_fields",
  "rescan_field_values",
  "revert_revision",
  "sync_database_schema",
  "unpersist_model",
  "update_action",
  "update_alert",
  "update_cache_config",
  "update_card",
  "update_collection",
  "update_collection_permissions",
  "update_dashboard",
  "update_dashboard_cards",
  "update_dashboard_subscription",
  "update_database",
  "update_document",
  "update_field",
  "update_glossary_term",
  "update_group",
  "update_permissions_graph",
  "update_segment",
  "update_setting",
  "update_snippet",
  "update_table",
  "update_timeline",
  "update_timeline_event",
  "update_user",
  "upload_csv",
  "validate_database",
];

const getToolNames = (server: McpServer): string[] => {
  // McpServer stores tools internally — try known property names
  const internal = (server as any)._registeredTools
    ?? (server as any)._tools
    ?? (server as any).tools;
  if (!internal) {
    throw new Error(
      "Cannot access registered tools from McpServer. " +
      "The SDK's internal structure may have changed."
    );
  }
  return Object.keys(internal);
};

describe("E2E: read-only mode", () => {
  test("readOnly=true registers only read tools", async () => {
    const client = await getTestClient();
    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerAllTools(server, client, { metabaseUrl: "http://localhost:3000", readOnly: true });

    const toolNames = getToolNames(server);

    // Guard: ensure we actually found tools (prevents vacuous pass)
    expect(toolNames.length).toBe(READ_ONLY_TOOLS.length);

    for (const tool of READ_ONLY_TOOLS) {
      expect(toolNames).toContain(tool);
    }
    for (const tool of WRITE_TOOLS) {
      expect(toolNames).not.toContain(tool);
    }
  });

  test("readOnly=false registers all tools", async () => {
    const client = await getTestClient();
    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerAllTools(server, client, { metabaseUrl: "http://localhost:3000", readOnly: false });

    const toolNames = getToolNames(server);

    const allTools = [...READ_ONLY_TOOLS, ...WRITE_TOOLS];

    // Guard: ensure we found the expected total
    expect(toolNames.length).toBe(allTools.length);

    for (const tool of allTools) {
      expect(toolNames).toContain(tool);
    }
  });
});
