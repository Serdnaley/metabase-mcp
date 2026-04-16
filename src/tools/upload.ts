import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import { uploadCsv } from "../services/upload.js";

export const registerUploadTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  if (!config.readOnly) {
    server.tool(
      "upload_csv",
      "Upload a CSV file as a new table in Metabase",
      {
        csv_data: z.string().describe("Raw CSV content to upload"),
        table_name: z.string().describe("Name for the new table"),
        collection_id: z.number().optional().describe("Collection ID to place the resulting model in"),
      },
      async ({ csv_data, table_name, collection_id }) => {
        const result = await uploadCsv(client, {
          file: csv_data,
          table_name,
          collection_id,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );
  }
};
