# Metabase MCP — Testing & CI Design

## Overview

Integration test suite for the Metabase MCP server. Tests run against a real Metabase instance via Docker Compose using bun's built-in test runner. Covers full CRUD for every domain, end-to-end workflows, and CI via GitHub Actions.

## Docker Compose

Minimal Metabase setup using the embedded H2 database with auto-installed sample data:

```yaml
services:
  metabase:
    image: metabase/metabase:latest
    ports:
      - "3000:3000"
    healthcheck:
      test: curl -f http://localhost:3000/api/health
      interval: 10s
      timeout: 5s
      retries: 30
```

No external database needed — Metabase's H2 + sample database provides enough data for tests.

## Test Setup

- `tests/setup.ts` — Global setup: checks Metabase health, completes initial setup (creates admin user via `/api/setup`), generates an API key, exports config
- `tests/helpers.ts` — Shared `MetabaseClient` factory using the generated API key, cleanup utilities
- Health check at test start: skip all tests with clear message if Metabase isn't running
- Each test suite cleans up what it creates — no cross-test pollution

## Test Structure

```
tests/
├── setup.ts                          # Global setup: health check, admin setup, API key
├── helpers.ts                        # Client factory, cleanup utils
├── services/
│   ├── search.test.ts                # Search across entities
│   ├── databases.test.ts             # List, get, metadata, schemas
│   ├── tables.test.ts                # Get table, query metadata, fields, field values
│   ├── collections.test.ts           # Create → get → list → update → delete
│   ├── cards.test.ts                 # Create → get → list → update → copy → execute → delete
│   ├── dashboards.test.ts            # Create → get → list → update → copy → update cards → delete
│   ├── actions.test.ts               # Create → get → list → update → execute → delete
│   └── dataset.test.ts               # Native SQL query, structured query
├── e2e/
│   ├── analytics-workflow.test.ts    # Search → metadata → create question → execute → verify
│   ├── dashboard-builder.test.ts     # Collection → cards → dashboard → layout → verify
│   ├── content-management.test.ts    # Create → move → copy → archive → delete → verify
│   └── read-only-mode.test.ts        # Verify readOnly config excludes write tools
└── ci/
    └── wait-for-metabase.sh          # Poll Metabase health for CI startup
```

## Test Approach

**Service tests**: Call functions from `src/services/` directly against real Metabase. No mocks. Each CRUD suite follows: create → read → update → read again → delete → verify gone.

**E2E tests**: Compose multiple service calls into realistic workflows:
1. **Analytics workflow** — Search for table → get metadata → create native SQL question → execute → verify results
2. **Dashboard builder** — Create collection → create multiple cards → create dashboard → add cards with layout positions → verify dashboard contents
3. **Content management** — Create items → move between collections → copy dashboard → archive → delete → verify cleanup
4. **Read-only mode** — Instantiate MCP server with `readOnly: true` → list tools → verify only read tools present

**Sample database assumption**: Metabase auto-installs a "Sample Database" (H2) with tables like ORDERS, PRODUCTS, PEOPLE, REVIEWS. Tests use this for read operations and query execution. Database ID is typically 1.

## CI: GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: docker compose up -d
      - run: ./tests/ci/wait-for-metabase.sh
      - run: bun test
      - run: docker compose down
```

## Configuration

Tests use environment variables (with defaults for local dev):
- `METABASE_URL` — defaults to `http://localhost:3000`
- API key generated during setup and passed to test client
