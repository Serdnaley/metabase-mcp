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
      document: z.record(z.string(), z.unknown()).optional().describe("Document body as a ProseMirror JSON doc, e.g. {\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Hello\"}]}]}"),
      text: z.string().optional().describe("Plain-text shortcut for the body: paragraphs separated by blank lines (ignored if document is given)"),
      content: z.record(z.string(), z.unknown()).optional().describe("Deprecated alias for document"),
    }, async (params) => {
      const result = await createDocument(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("update_document", "Update a document", {
      id: z.number().describe("Document ID"),
      name: z.string().optional().describe("Updated document name"),
      collection_id: z.number().optional().describe("Updated collection ID"),
      document: z.record(z.string(), z.unknown()).optional().describe("Document body as a ProseMirror JSON doc, e.g. {\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Hello\"}]}]}"),
      text: z.string().optional().describe("Plain-text shortcut for the body: paragraphs separated by blank lines (ignored if document is given)"),
      content: z.record(z.string(), z.unknown()).optional().describe("Deprecated alias for document"),
      archived: z.boolean().optional().describe("Archive the document"),
    }, async ({ id, ...params }) => {
      const result = await updateDocument(client, id, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("delete_document", "Permanently delete a document (archives it first, as Metabase requires)", {
      id: z.number().describe("Document ID"),
    }, async ({ id }) => {
      const result = await deleteDocument(client, id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
  }
};
