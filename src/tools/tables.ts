import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  getTable,
  getTableQueryMetadata,
  getField,
  getFieldValues,
  updateTable,
  updateField,
  rescanFieldValues,
  discardFieldValues,
  reorderFields,
} from "../services/tables.js";

export const registerTableTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool("get_table", "Get table details and field info", { id: z.number().describe("Table ID") }, async ({ id }) => {
    const result = await getTable(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_table_query_metadata", "Get full query metadata for a table (fields, FKs, metrics)", { id: z.number().describe("Table ID") }, async ({ id }) => {
    const result = await getTableQueryMetadata(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_field", "Get field details including type, special type, fingerprint", { id: z.number().describe("Field ID") }, async ({ id }) => {
    const result = await getField(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_field_values", "Get sample values for a field", { id: z.number().describe("Field ID") }, async ({ id }) => {
    const result = await getFieldValues(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  if (!config.readOnly) {
    server.tool(
      "update_table",
      "Update table display name, description, visibility type, or entity type",
      {
        id: z.number().describe("Table ID"),
        display_name: z.string().optional().describe("Display name"),
        description: z.string().optional().describe("Description"),
        visibility_type: z.string().optional().describe("Visibility type (e.g. hidden, technical, cruft)"),
        entity_type: z.string().optional().describe("Entity type (e.g. entity/GenericTable, entity/EventTable)"),
      },
      async ({ id, ...params }) => {
        const result = await updateTable(client, id, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "update_field",
      "Update field display name, description, semantic type, visibility, or FK target",
      {
        id: z.number().describe("Field ID"),
        display_name: z.string().optional().describe("Display name"),
        description: z.string().optional().describe("Description"),
        semantic_type: z.string().optional().describe("Semantic type (e.g. type/Name, type/Category)"),
        visibility_type: z.string().optional().describe("Visibility type (e.g. normal, details-only, hidden, sensitive)"),
        has_field_values: z.string().optional().describe("How field values are retrieved (e.g. list, search, none)"),
        fk_target_field_id: z.number().optional().describe("Target field ID for foreign key relationships"),
        coercion_strategy: z.string().optional().describe("Coercion strategy for type casting (e.g. 'ISO8601->DateTime', 'UNIXSeconds->DateTime')"),
      },
      async ({ id, ...params }) => {
        const result = await updateField(client, id, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "rescan_field_values",
      "Trigger a re-scan of field values used to populate filter dropdowns",
      { id: z.number().describe("Field ID") },
      async ({ id }) => {
        const result = await rescanFieldValues(client, id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "discard_field_values",
      "Clear cached field values for a field",
      { id: z.number().describe("Field ID") },
      async ({ id }) => {
        const result = await discardFieldValues(client, id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "reorder_fields",
      "Set a custom field ordering for a table by providing an ordered list of field IDs",
      {
        id: z.number().describe("Table ID"),
        field_order: z.array(z.number()).describe("Ordered list of field IDs"),
      },
      async ({ id, field_order }) => {
        const result = await reorderFields(client, id, field_order);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );
  }
};
