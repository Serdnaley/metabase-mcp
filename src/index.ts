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
