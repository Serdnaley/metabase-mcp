import { describe, test, expect } from "bun:test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getTestClient } from "../helpers.js";
import { registerAllTools } from "../../src/tools/index.js";

const READ_ONLY_TOOLS = [
  "search",
  "list_databases", "get_database", "get_database_metadata",
  "list_database_schemas", "get_database_schema",
  "get_table", "get_table_query_metadata", "get_field", "get_field_values",
  "list_collections", "get_collection", "list_collection_items",
  "list_cards", "get_card", "execute_card_query",
  "list_dashboards", "get_dashboard",
  "list_actions", "get_action",
  "execute_query",
];

const WRITE_TOOLS = [
  "create_collection", "update_collection",
  "create_card", "update_card", "delete_card", "copy_card",
  "create_dashboard", "update_dashboard", "delete_dashboard",
  "copy_dashboard", "update_dashboard_cards",
  "create_action", "update_action", "delete_action", "execute_action",
];

describe("E2E: read-only mode", () => {
  test("readOnly=true registers only read tools", async () => {
    const client = await getTestClient();
    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerAllTools(server, client, { metabaseUrl: "http://localhost:3000", readOnly: true });

    const registeredTools = (server as any)._registeredTools;
    const toolNames = Object.keys(registeredTools || {});

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

    const registeredTools = (server as any)._registeredTools;
    const toolNames = Object.keys(registeredTools || {});

    const allTools = [...READ_ONLY_TOOLS, ...WRITE_TOOLS];
    for (const tool of allTools) {
      expect(toolNames).toContain(tool);
    }
  });
});
