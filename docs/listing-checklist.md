# Listing checklist (for the maintainer)

Steps to get `@serdnaley/metabase-mcp` listed where people look for MCP servers. Everything in the repo is
prepared (`LICENSE`, `mcpName` in `package.json`, `server.json`, badges, tool catalog). What is left needs
the maintainer's own accounts, so nothing here is automated.

Steps 0–2 follow the registry's own docs (checked 26.10.2026). Steps 3–6 describe third-party sites whose
forms change often; treat them as a guide and follow what the site shows.

## 0. Before anything: a release with the new metadata

The MCP Registry checks that the **published npm package** has `"mcpName": "io.github.Serdnaley/metabase-mcp"`.
0.2.0 on npm does not have it, so the first listing needs the next release (0.3.0):

1. Bump the version in `package.json`, `src/server-info.ts` and both `version` fields of `server.json`.
2. Release as described in `CLAUDE.md` (GitHub release → publish workflow).
3. Check: `npm view @serdnaley/metabase-mcp mcpName` prints `io.github.Serdnaley/metabase-mcp`.

The name is case-sensitive: the registry grants `io.github.<GitHub login>/*` exactly as GitHub returns the
login, which is `Serdnaley`.

## 1. GitHub repository (5 min)

- Settings → Pages → Source: **GitHub Actions**. The `Docs` workflow then publishes the tool catalog to
  <https://serdnaley.github.io/metabase-mcp/> on every push to `main`.
- About (gear icon): description "Headless MCP server for Metabase: API-key auth, stdio or HTTP, 161 tools",
  website = the Pages URL, topics: `mcp`, `mcp-server`, `model-context-protocol`, `metabase`, `bi`,
  `analytics`, `claude`, `ai-agents`.

## 2. Official MCP Registry (10 min, after step 0)

```bash
# macOS/Linux
brew install mcp-publisher          # or download from github.com/modelcontextprotocol/registry/releases
cd metabase-mcp
mcp-publisher validate              # checks server.json
mcp-publisher login github          # device flow in the browser, as Serdnaley
mcp-publisher publish
```

Check: `curl "https://registry.modelcontextprotocol.io/v0/servers?search=io.github.Serdnaley/metabase-mcp"`.
PulseMCP and several other directories import from this registry automatically.

Later this can run in CI (`mcp-publisher login github-oidc` in the publish workflow with
`id-token: write`), so every npm release also updates the listing.

## 3. Glama (5 min)

<https://glama.ai/mcp/servers> → "Add server" → GitHub repo URL. Sign in with GitHub. Glama builds the
server in a sandbox and grades it (license, security, quality); the `LICENSE` file is required for a good
grade. After it is listed, Glama offers a badge for the README.

## 4. Smithery (10 min)

<https://smithery.ai> → sign in with GitHub → "Add server" → pick the repo. For stdio servers it asks for
the start command (`npx -y @serdnaley/metabase-mcp`) and the config schema (`METABASE_URL`,
`METABASE_API_KEY`, optional rest; see `server.json`).

## 5. Claude Desktop directory (optional, longer review)

Anthropic's directory takes one-click MCP bundles (`.mcpb`). Building one needs a `manifest.json`
(`npx @anthropic-ai/mcpb init`, then `mcpb pack`) and a submission through Anthropic's directory form.
Worth doing after 0.3.0 is out and the registry listing works.

## 6. Awesome lists (optional)

PRs to `punkpeye/awesome-mcp-servers` and `wong2/awesome-mcp-servers` under "Data & analytics", one line:
"Headless Metabase MCP: API-key auth, stdio/HTTP, 161 tools with toolsets, any Metabase tier."
