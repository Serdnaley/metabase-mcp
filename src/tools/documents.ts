import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { listDocuments, getDocument, createDocument, updateDocument, deleteDocument } from "../services/documents.js";

export const registerDocumentTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool("list_documents", "List all narrative analytics documents", {}, async () => {
    const result = await listDocuments(client);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_document", "Get a document by ID", {
    id: z.number().describe("Document ID"),
  }, async ({ id }) => {
    const result = await getDocument(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  if (!config.readOnly) {
    server.tool("create_document", "Create a narrative analytics document", {
      name: z.string().describe("Document name"),
      collection_id: z.number().optional().describe("Collection ID to place the document in"),
      content: z.record(z.string(), z.unknown()).optional().describe("Document content structure"),
    }, async (params) => {
      const result = await createDocument(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("update_document", "Update a document", {
      id: z.number().describe("Document ID"),
      name: z.string().optional().describe("Updated document name"),
      collection_id: z.number().optional().describe("Updated collection ID"),
      content: z.record(z.string(), z.unknown()).optional().describe("Updated document content structure"),
      archived: z.boolean().optional().describe("Archive the document"),
    }, async ({ id, ...params }) => {
      const result = await updateDocument(client, id, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("delete_document", "Delete a document", {
      id: z.number().describe("Document ID"),
    }, async ({ id }) => {
      const result = await deleteDocument(client, id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
  }
};
