import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MetabaseClient } from "../client.js";
import type { Config } from "../config.js";
import {
  listUsers,
  getUser,
  getCurrentUser,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
} from "../services/users.js";

export const registerUserTools = (server: McpServer, client: MetabaseClient, config: Config) => {
  server.tool(
    "list_users",
    "List all Metabase users. Supports optional search query to filter by name or email.",
    {
      query: z.string().optional().describe("Search query to filter users by first name, last name, or email"),
    },
    async (params) => {
      const result = await listUsers(client, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_user",
    "Get a Metabase user by ID",
    {
      id: z.number().describe("User ID"),
    },
    async ({ id }) => {
      const result = await getUser(client, id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_current_user",
    "Get the currently authenticated Metabase user",
    {},
    async () => {
      const result = await getCurrentUser(client);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "list_groups",
    "List all Metabase permission groups",
    {},
    async () => {
      const result = await listGroups(client);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  if (!config.readOnly) {
    server.tool(
      "create_user",
      "Create a new Metabase user",
      {
        email: z.string().email().describe("User email address"),
        first_name: z.string().optional().describe("User first name"),
        last_name: z.string().optional().describe("User last name"),
        password: z.string().optional().describe("User password (optional, user will receive a setup email if omitted)"),
        group_ids: z.array(z.number()).optional().describe("Array of permission group IDs to add the user to"),
      },
      async (params) => {
        const result = await createUser(client, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "update_user",
      "Update an existing Metabase user. Only provided fields will be updated.",
      {
        id: z.number().describe("User ID"),
        first_name: z.string().optional().describe("New first name"),
        last_name: z.string().optional().describe("New last name"),
        email: z.string().email().optional().describe("New email address"),
        locale: z.string().optional().describe("User locale (e.g. 'en', 'fr')"),
      },
      async ({ id, ...params }) => {
        const result = await updateUser(client, id, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "deactivate_user",
      "Deactivate a Metabase user (soft-delete). The user record is retained but access is disabled.",
      {
        id: z.number().describe("User ID to deactivate"),
      },
      async ({ id }) => {
        const result = await deactivateUser(client, id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "reactivate_user",
      "Reactivate a previously deactivated Metabase user",
      {
        id: z.number().describe("User ID to reactivate"),
      },
      async ({ id }) => {
        const result = await reactivateUser(client, id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "create_group",
      "Create a new Metabase permission group",
      {
        name: z.string().describe("Group name"),
      },
      async (params) => {
        const result = await createGroup(client, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "update_group",
      "Update the name of a Metabase permission group",
      {
        id: z.number().describe("Group ID"),
        name: z.string().describe("New group name"),
      },
      async ({ id, name }) => {
        const result = await updateGroup(client, id, { name });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "delete_group",
      "Delete a Metabase permission group",
      {
        id: z.number().describe("Group ID to delete"),
      },
      async ({ id }) => {
        const result = await deleteGroup(client, id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "add_group_member",
      "Add a user to a Metabase permission group",
      {
        group_id: z.number().describe("Permission group ID"),
        user_id: z.number().describe("User ID to add to the group"),
      },
      async (params) => {
        const result = await addGroupMember(client, params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );

    server.tool(
      "remove_group_member",
      "Remove a user from a Metabase permission group by membership ID",
      {
        membership_id: z.number().describe("Membership ID to remove (obtain from list_users or list_groups response)"),
      },
      async ({ membership_id }) => {
        const result = await removeGroupMember(client, membership_id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    );
  }
};
