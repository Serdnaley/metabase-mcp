# Listing checklist (for the maintainer)

Where `@serdnaley/metabase-mcp` is published and what still needs a human account.

## Automated on every GitHub release (`.github/workflows/publish.yml`)

| Store | How | Needs from the maintainer |
|---|---|---|
| npm `@serdnaley/metabase-mcp` | OIDC trusted publishing | nothing (already configured on npmjs.com) |
| Official MCP Registry `io.github.Serdnaley/metabase-mcp` | `mcp-publisher login github-oidc` + `publish` | nothing: GitHub OIDC proves the `io.github.Serdnaley/*` namespace |
| GitHub release asset `metabase-mcp-X.Y.Z.mcpb` | `bun run mcpb` | nothing |
| GHCR `ghcr.io/serdnaley/metabase-mcp` | docker build-push | once: make the package public (see below) |

PulseMCP and several other directories import from the official MCP Registry on their own.

A failed job can be repeated: Actions → Release → Run workflow → tag `vX.Y.Z`. Every step skips what is
already published.

## One-time steps that need the maintainer's accounts

### GHCR package visibility (1 min, after the first release)

GitHub creates new container packages as private. github.com/Serdnaley?tab=packages → `metabase-mcp` →
Package settings → Change visibility → Public. Also "Connect repository" if it is not linked yet.

### Smithery: not used

Dropped on 26.10.2026 (Andres). Smithery's API rejects stdio bundles ("Updating servers has been removed")
and its web form only accepts an already hosted HTTPS server, i.e. a public multi-tenant gateway that
would relay users' Metabase API keys. Not worth it next to npm, the MCP Registry, Glama and `.mcpb`.

### Glama (3 min)

`glama.json` in the repo already names the maintainer. glama.ai/mcp/servers → find or "Add server" with
the repo URL → sign in with GitHub to claim it. Glama re-indexes the repo by itself; no CI step.

### Claude Desktop directory (optional, reviewed by Anthropic)

The `.mcpb` bundle on each GitHub release is the artifact Anthropic's directory takes. Submit it through
Anthropic's MCP directory submission form (linked from the Claude Help Center, "Connectors directory") with:
repo URL, bundle URL from the latest release, privacy note ("runs locally, talks only to the user's own
Metabase"), and a test Metabase if they ask for one.

### Awesome lists (optional)

PRs to `punkpeye/awesome-mcp-servers` and `wong2/awesome-mcp-servers` under data & analytics, one line:
"Headless Metabase MCP: API-key auth, stdio/HTTP, 161 tools with toolsets, any Metabase tier."
