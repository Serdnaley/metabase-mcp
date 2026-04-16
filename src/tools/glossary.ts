import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { listGlossaryTerms, getGlossaryTerm, createGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm } from "../services/glossary.js";

export const registerGlossaryTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool("list_glossary_terms", "List all business glossary terms", {}, async () => {
    const result = await listGlossaryTerms(client);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_glossary_term", "Get a glossary term by ID", {
    id: z.number().describe("Glossary term ID"),
  }, async ({ id }) => {
    const result = await getGlossaryTerm(client, id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  if (!config.readOnly) {
    server.tool("create_glossary_term", "Create a business glossary term", {
      term: z.string().describe("The term to define"),
      definition: z.string().describe("Definition of the term"),
    }, async (params) => {
      const result = await createGlossaryTerm(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("update_glossary_term", "Update a glossary term", {
      id: z.number().describe("Glossary term ID"),
      term: z.string().optional().describe("Updated term"),
      definition: z.string().optional().describe("Updated definition"),
    }, async ({ id, ...params }) => {
      const result = await updateGlossaryTerm(client, id, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });

    server.tool("delete_glossary_term", "Delete a glossary term", {
      id: z.number().describe("Glossary term ID"),
    }, async ({ id }) => {
      const result = await deleteGlossaryTerm(client, id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    });
  }
};
