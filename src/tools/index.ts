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

export const registerAllTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  registerSearchTools(server, client);
  registerDatabaseTools(server, client);
  registerTableTools(server, client);
  registerCollectionTools(server, client, config);
  registerCardTools(server, client, config);
  registerDashboardTools(server, client, config);
  registerActionTools(server, client, config);
  registerDatasetTools(server, client);
};
