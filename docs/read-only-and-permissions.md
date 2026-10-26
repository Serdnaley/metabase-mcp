# Read-only mode and Metabase permissions

How `METABASE_READ_ONLY_MODE` relates to what Metabase itself allows, and why exports stay
available in read-only mode. Checked against the Metabase v0.64 docs and live probes on a local
v0.64.3.4 (OSS) with `scripts/probe-readonly-perms.py` (needs the test setup from `bun test`) (26.10.2026).

## Two layers

| Layer | What it controls | Where |
|---|---|---|
| `METABASE_READ_ONLY_MODE=true` (this server) | Which MCP tools are **registered**: write tools are not exposed at all. Read tools, `execute_query` and the export tools stay. | `src/tools/*` (`if (!config.readOnly)`) |
| Metabase permissions (the server) | What the API key / user can **actually do**. Enforced by Metabase on every request. | Admin → People / Permissions |

Read-only mode is a convenience that keeps write tools out of the model's tool list. It is not a
security boundary: the real boundary is the Metabase account behind `METABASE_API_KEY`.

## How Metabase scopes an API key

- An API key has no permissions of its own. It belongs to **one group** and gets exactly that
  group's permissions, plus those of *All Users*, which every key is also a member of. Metabase
  always applies the most permissive grant, so restricting a key also means restricting All Users.
- **Collection permissions**: Curate (read and write), View (read only) or No access. View lets a
  key open and run saved questions and dashboards, but not edit, move, archive or pin them.
- **Data permissions** per database, schema or table:
  - *View data*: whether the group can see the data at all.
  - *Create queries*: query builder and native SQL, query builder only, or no.
  - *Download results*: no, 10 thousand rows or 1 million rows. **Pro/Enterprise only.**
  - *Manage table metadata*, *Manage database*: **Pro/Enterprise only.**
  - *Transforms* (0.60+).
- Settings, users, groups, permissions, databases and API keys can only be changed by admins.

## Live probe (v0.64.3.4 OSS)

Key in a group with collection root = View, data View data = unrestricted. All Users restricted to
the same, then restored.

| Call | Create queries = no | Create queries = SQL + builder, Download = none |
|---|---|---|
| `GET /api/card/:id` | 200 | 200 |
| Run a saved question | 202 | 202 |
| Export a saved question (`/api/card/:id/query/csv`) | 200 | 200 |
| Ad-hoc SQL (`/api/dataset`) | 403 | 202 |
| Export ad-hoc SQL (`/api/dataset/csv`) | 403 | 200 |
| Create a question | 403 | 403 |
| Rename a question | 403 | 403 |
| Change a setting | 403 | 403 |

Control run: the same key with *All Users* left at its defaults (Curate on root, SQL allowed) could
also run ad-hoc SQL, create and rename questions. Only the admin-only setting change stayed 403.

Findings:

1. Metabase treats an export exactly like running the query. Whatever a key can read, it can
   export, and whatever it cannot query, it cannot export either.
2. On OSS, `download: none` is accepted by the permissions API but **not enforced**: exports still
   returned 200. Only Pro/Enterprise can stop a group from downloading what it can see.
3. A View-only collection grant plus "Create queries = no" gives a key that can browse, run and
   export saved content but cannot run arbitrary SQL or change anything: the closest thing
   Metabase has to a read-only token.
4. With native query permission, `execute_query` (and `export_query`) can run any SQL the
   database user allows, including writes, in read-only mode too. Use a read-only database user
   or "Create queries = query builder only" when that matters.

## Decision: exports in read-only mode

Exports (`export_card_query`, `export_query`, `export_dashboard_pdf`) stay fully available in
read-only mode, including `output_path` file writes (Andres, 26.10.2026). They don't change anything
in Metabase, and Metabase enforces the same read access as for running the query. The file is
written on the machine running the MCP server. It is never overwritten unless `overwrite: true` is
passed, and the path must be absolute.

## Recommended setup for a read-only assistant

1. Create a group (e.g. "AI read-only") and an API key in it.
2. Collections: View on what it may read, No access elsewhere.
3. Data: View data = can view; Create queries = query builder only, or no to allow saved content
   only. Restrict *All Users* to at most the same, or its grants win.
4. On Pro/Enterprise, set Download results to the row cap you want.
5. Set `METABASE_READ_ONLY_MODE=true` so write tools are not offered at all.
