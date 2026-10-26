#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig, resultLimits } from "./config.js";
import { createMetabaseClient } from "./client.js";
import { buildToolCatalog, parseToolSelection, registerTools, selectTools } from "./registry.js";
import { loadHttpOptions, startHttpServer } from "./http.js";
import { SERVER_NAME, SERVER_VERSION } from "./server-info.js";
import { registerResources } from "./resources.js";
import { registerPrompts } from "./prompts.js";

const fail = (message: string): never => {
  console.error(`Configuration error: ${message}`);
  process.exit(1);
};

const main = async () => {
  const config = loadConfig();

  let httpOptions: ReturnType<typeof loadHttpOptions>;
  let selected: ReturnType<typeof selectTools>;
  try {
    httpOptions = loadHttpOptions(process.env, process.argv.slice(2));
  } catch (err) {
    return fail((err as Error).message);
  }

  const client = await createMetabaseClient(config);
  const catalog = buildToolCatalog(client, config);
  try {
    selected = selectTools(catalog, { ...parseToolSelection(process.env), readOnly: config.readOnly });
  } catch (err) {
    return fail((err as Error).message);
  }
  for (const w of selected.warnings) console.error(`Warning: ${w}`);

  // stderr only: stdout belongs to the stdio transport
  const writes = selected.tools.filter((t) => t.write).length;
  console.error(
    `${SERVER_NAME} ${SERVER_VERSION}: ${selected.tools.length}/${catalog.length} tools enabled ` +
      `(${selected.tools.length - writes} read, ${writes} write)${config.readOnly ? ", read-only mode" : ""}`
  );

  const createServer = () => {
    const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
    registerTools(server, selected.tools, resultLimits(config).maxResponseChars);
    registerResources(server, client, new Set(selected.tools.map((t) => t.toolset)));
    registerPrompts(server, new Set(selected.tools.map((t) => t.name)));
    return server;
  };

  if (httpOptions) {
    await startHttpServer(createServer, httpOptions);
    console.error(
      `${SERVER_NAME}: listening on http://${httpOptions.host}:${httpOptions.port}/mcp` +
        (httpOptions.token ? " (bearer auth)" : " (NO AUTH, loopback only)")
    );
    return;
  }

  await createServer().connect(new StdioServerTransport());
};

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
