# Developer & API

Metabase's REST API, Agent API, MBQL query language, and developer documentation.

## Sources

- [Developer Guide](https://www.metabase.com/docs/latest/developers-guide/start)
- [API Documentation](https://www.metabase.com/docs/latest/api)
- [API Changelog](https://www.metabase.com/docs/latest/developers-guide/api-changelog)
- [Driver Interface Changelog](https://www.metabase.com/docs/latest/developers-guide/driver-changelog)
- [Versioning Policy](https://www.metabase.com/docs/latest/developers-guide/versioning)
- [Working with the Metabase API (Learn)](https://www.metabase.com/learn/metabase-basics/administration/administration-and-operation/metabase-api)
- [Using the REST API (GitHub Wiki)](https://github.com/metabase/metabase/wiki/Using-the-REST-API)
- [API Keys](https://www.metabase.com/docs/latest/people-and-groups/api-keys)
- [Actions Introduction](https://www.metabase.com/docs/latest/actions/introduction)
- [Agent API](https://www.metabase.com/docs/latest/ai/agent-api)

---

## Features

### Authentication and Session Management

**1. Session Authentication (`/api/session`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
User login via username and password, returning a session token (`X-Metabase-Session` header). Sessions valid for 14 days by default.

**2. API Key Authentication (`X-API-Key` header)**
Source: [API Keys](https://www.metabase.com/docs/latest/people-and-groups/api-keys)
API keys created in Admin > Settings > Authentication > API Keys, assigned to a permission group. Recommended for automation and server-to-server integrations.

**3. JWT Authentication (Pro/Enterprise)**
Source: [Agent API](https://www.metabase.com/docs/latest/ai/agent-api)
Bearer token JWT authentication. Required claims: `iat` and `email`. Optional: `first_name`, `last_name`, `groups`. Can exchange JWT for session via `POST /auth/sso/to_session`.

**4. SAML Authentication**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Enterprise SSO integration with Auth0, Microsoft Entra ID, Google, Keycloak, and Okta.

**5. LDAP Configuration (`/api/ldap`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
`PUT /api/ldap/` configures LDAP authentication settings.

### Setup and Administration

**6. Instance Setup (`/api/setup`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
`POST /api/setup` provisions a brand-new instance: creates the first admin user and returns a session ID. Only works on uninitialized instances.

**7. Global Settings (`/api/setting`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
CRUD on global configuration values: instance name, timezone, locale, caching, passwords, features.

**8. Email Configuration (`/api/email`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Configure SMTP settings and send test messages. Required before subscriptions and alerts work.

**9. Slack Integration (`/api/slack`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Configure the Slack bot token and channel settings.

**10. Diagnostic Information (`/api/bug-reporting`)**
Source: [API Changelog](https://www.metabase.com/docs/latest/developers-guide/api-changelog)
Diagnostic details and connection pool state. Renamed from `/api/util/bug_report_details`.

**11. Logger / Log Access (`/api/logger`)**
Source: [API Changelog](https://www.metabase.com/docs/latest/developers-guide/api-changelog)
Retrieve application log output. Renamed from `/api/util/logs`.

**12. API Documentation (`/api/docs`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
`GET /api/docs/openapi.json` returns the full OpenAPI specification. Interactive Swagger UI at `/api/docs`.

### Database Management

**13. Database CRUD (`/api/database`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Full lifecycle: add, list, update, delete database connections. Includes schema, table, and field metadata endpoints. `POST /api/database/validate` tests connection parameters.

**14. Database Sync and Scan Triggering**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
`POST /api/database/:id/sync_schema` triggers rescan. `POST /api/notify/db/:id` is the data pipeline integration endpoint for post-ETL sync.

### Tables and Fields

**15. Table Metadata (`/api/table`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
List tables, get query metadata, update display name/description/visibility/entity type, discard cached field values.

**16. Field Metadata (`/api/field`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Full CRUD on field-level metadata: display names, descriptions, semantic types, visibility, JSON unfolding, remapping, filtering widgets. Get/update/rescan/discard field values.

### Questions and Models

**17. Cards (Questions and Models) (`/api/card`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Create, read, update, archive saved questions and models. As of v0.57, supports `?legacy-mbql=true` for MBQL 4 format.

**18. Card Query Execution (`/api/card`, `/api/dataset`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Execute saved questions, export as CSV/JSON/XLSX. `POST /api/dataset` executes ad-hoc MBQL or native SQL queries.

**19. Card Query Metadata**
Source: [API Changelog](https://www.metabase.com/docs/latest/developers-guide/api-changelog)
`GET /api/card/:id/query_metadata` (added v0.51) returns combined metadata in one round trip.

### Dashboards

**20. Dashboard CRUD (`/api/dashboard`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Create, read, update, archive dashboards. As of v0.50, `PUT` triggers automatic Trash movement.

**21. Dashboard Cards Management**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Add, update layout/visualization/parameters, remove cards. New cards require temporary negative IDs.

**22. Dashboard Query Metadata**
Source: [API Changelog](https://www.metabase.com/docs/latest/developers-guide/api-changelog)
`GET /api/dashboard/:id/query_metadata` (added v0.51) returns all metadata for rendering.

**23. Dashboard Parameters and Filters**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Parameter definitions, auto-complete values endpoint, programmatic filter control.

### Collections and Organization

**24. Collections (`/api/collection`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Create, list, get items, update, archive collections. `GET /api/collection/tree` returns full hierarchy.

**25. Collection Permissions Graph**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
`GET /api/collection/graph` and `PUT /api/collection/graph` manage the complete permissions graph.

### Search

**26. Universal Search (`/api/search`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Search across cards, dashboards, collections, tables, fields, pulses, and metrics.

### Users and Groups

**27. User Management (`/api/user`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Create, list, update, deactivate users. `GET /api/user/current` returns authenticated user profile.

**28. Permission Groups (`/api/permissions`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Create, list, rename, delete groups. Manage group membership.

**29. Permissions Data Graph**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
`GET /api/permissions/graph` returns full data permissions. As of v0.50, split into `view-data` and `create-queries`.

### Segments and Metrics

**30. Segments (`/api/segment`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
CRUD for reusable named filters on tables.

**31. Legacy Metrics (`/api/legacy-metric`)**
Source: [API Changelog](https://www.metabase.com/docs/latest/developers-guide/api-changelog)
Formerly `/api/metric`, renamed in v0.50. Deprecated in favor of newer Metrics feature.

### Notifications, Alerts, and Subscriptions

**32. Notifications (`/api/notification`)**
Source: [API Changelog](https://www.metabase.com/docs/latest/developers-guide/api-changelog)
Current notification system (introduced v0.54). CRUD for notification configurations.

**33. Legacy Pulses (`/api/pulse`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Deprecated scheduled report delivery. Marked for removal.

**34. Legacy Alerts (`/api/alert`)**
Source: [API Changelog](https://www.metabase.com/docs/latest/developers-guide/api-changelog)
Deprecated alert system. Partially removed in v0.54.

### Embedding

**35. Public Sharing (`/api/public`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Serve publicly shared content without authentication. Supports oEmbed.

**36. Signed Embedding (`/api/embed`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Serve signed JWT-authenticated embedded content with optional locked parameters.

**37. Preview Embedding (`/api/preview-embed`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Preview versions of embedded content for development.

### Actions (Write-Back)

**38. Actions (`/api/action`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
CRUD for action definitions. `POST /api/action/:id/execute` executes actions with parameter values. PostgreSQL and MySQL only.

### Automagic / X-Rays

**39. Automagic Dashboards (`/api/automagic-dashboards`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Generate automatic exploratory dashboards for any table, database, field, metric, or segment.

### Revisions and History

**40. Revisions (`/api/revision`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
List revision history and revert cards or dashboards to prior versions.

### Geospatial

**41. GeoJSON (`/api/geojson`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Serve custom GeoJSON map data for region map visualizations.

**42. Map Tiles (`/api/tiles`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Serve raster map tiles for pin/heat map visualizations.

### Entity ID Translation

**43. Entity ID Translation (`/api/eid-translation`)**
Source: [API Changelog](https://www.metabase.com/docs/latest/developers-guide/api-changelog)
Translate entity IDs from serialization files back to API integer IDs.

### Activity and Audit

**44. Activity Feed (`/api/activity`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
Stream of recent user activity. Powers "Recently viewed" and audit logging.

### Background Tasks

**45. Tasks (`/api/task`)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
List all scheduled background tasks and their status.

### Upload

**46. CSV Upload (`/api/upload`)**
Source: [API Changelog](https://www.metabase.com/docs/latest/developers-guide/api-changelog)
Upload CSV files to create new database tables. Renamed from `/api/card/from-csv` in v0.55.

### Agent API

**47. Agent API (`/api/agent/v1`)**
Source: [Agent API](https://www.metabase.com/docs/latest/ai/agent-api)
Versioned REST interface for AI-powered/agentic BI applications. Table/metric discovery, field inspection, query construction. 200 rows/request with continuation token pagination.

### MBQL Query Language

**48. MBQL (Metabase Query Language)**
Source: [API Documentation](https://www.metabase.com/docs/latest/api)
JSON-based query language for request bodies. As of v0.57, the app uses MBQL 5; legacy MBQL 4 available via `?legacy-mbql=true`.

### Versioning and Stability

**49. Versioning Policy**
Source: [Versioning Policy](https://www.metabase.com/docs/latest/developers-guide/versioning)
License.Major.Point.Hotfix format. The REST API is not independently versioned. The Agent API (`/api/agent/v1`) is the only versioned sub-API with stability guarantees.

---

## Use Cases

**Session Authentication (#1) + API Key Authentication (#2)**
A Python automation script uses an API key scoped to a read-only group. It pulls dashboard data, executes queries, and exports results without storing user credentials.

**JWT Authentication (#3) + Signed Embedding (#36)**
A SaaS company signs JWTs with customer email and tenant group. Metabase applies row-level security automatically.

**Instance Setup (#6)**
A DevOps team calls `POST /api/setup` via Terraform to provision Metabase instances without manual UI interaction.

**Global Settings (#7) + Email (#8) + Slack (#9)**
A platform team pushes uniform settings across 50 Metabase environments via the settings API.

**Database CRUD (#13) + Database Sync (#14)**
After each nightly dbt run, a post-hook calls `POST /api/notify/db/:id` so Metabase rescans affected tables within seconds.

**Database CRUD (#13) + Sync**
An onboarding flow calls `POST /api/database/` to add a customer's database, validates connectivity, and triggers sync — all within the signup workflow.

**Table Metadata (#15) + Field Metadata (#16)**
A data governance team's nightly job reads from their catalog and synchronizes descriptions, display names, and semantic types into Metabase.

**Field Metadata (#16) + Field Values**
A BI team clears stale cached values and triggers fresh scans via API to fix slow filter dropdowns.

**Cards CRUD (#17) + Card Query Execution (#18)**
A reporting pipeline calls `POST /api/card/:id/query` daily and loads results into a reporting database.

**Cards (#17) + Export**
A cron job exports 20 standard reports as CSV via `POST /api/card/:id/query/csv` every Monday.

**Dataset / Ad-hoc Query (#18) + MBQL (#48)**
An internal tool POSTs ad-hoc MBQL queries at runtime for live data counts without creating saved questions.

**Dashboard CRUD (#20) + Dashboard Cards (#21)**
A provisioning script creates dashboards from templates and places all cards at configured positions programmatically.

**Dashboard CRUD (#20) + Parameters (#23)**
Per-tenant parameter locks are set via `PUT /api/dashboard/:id`, then signed JWT tokens are generated per tenant.

**Dashboard Query Metadata (#22) + Card Query Metadata (#19)**
A custom frontend gets all column definitions in one round trip, reducing page load latency.

**Collections (#24) + Collection Permissions Graph (#25)**
A quarterly access review compares the permissions graph against HR group memberships and applies corrections atomically.

**Universal Search (#26)**
A BI portal calls `GET /api/search?q=<term>` for a unified search box across all content types.

**User Management (#27) + Permission Groups (#28)**
When a user's IdP role changes, a webhook updates Metabase group memberships via `PUT /api/user/:id` in real time.

**Permissions Data Graph (#29)**
A security auditor extracts all entries where `create-queries` equals `native` and generates a compliance report.

**Segments (#30)**
A data analyst creates audience segments once via API from a config file, then references them in dozens of questions.

**Notifications (#32)**
An automation script creates one notification per region via `POST /api/notification`, binding each to the manager's email.

**Public Sharing (#35)**
A city government publishes open data dashboards. The public API endpoint allows programmatic access.

**Signed Embedding (#36) + JWT (#3)**
A B2B platform generates signed embed URLs with locked `customer_id` parameter for data isolation.

**Preview Embedding (#37)**
Engineers validate dashboard rendering and parameter locking in staging before production deployment.

**Actions (#38) + Dashboard Cards (#21)**
A dashboard "Mark as VIP" button executes a custom SQL action that updates the customer's tier.

**Actions (#38) — Public Forms**
External vendors submit data corrections via a public action form URL.

**Automagic Dashboards (#39)**
A data analyst gets auto-generated exploratory dashboards for each table — distributions, null rates, cardinality, and trends.

**Revisions (#40)**
An admin reverts an accidentally overwritten dashboard filter configuration to the previous version.

**GeoJSON (#41) + Map Tiles (#42)**
A retail chain uploads custom GeoJSON for sales territory boundaries, used in region map visualizations.

**Entity ID Translation (#43)**
A deployment script translates serialized entity IDs to production integer IDs for post-deploy automation.

**Activity Feed (#44)**
A governance team stores activity data in a data warehouse to identify stale content and active users.

**Tasks (#45)**
A Prometheus exporter checks for failed sync tasks and triggers PagerDuty alerts.

**CSV Upload (#46)**
A business analyst uploads weekly Excel exports directly via API for instant table creation.

**Agent API (#47) + JWT (#3)**
An AI assistant uses the Agent API to discover tables, construct queries, and execute them — all scoped to the authenticated user.

**Cards (#17) + Collections (#24) + Permissions Graph (#29)**
A "tenant provisioning" script creates collections, questions, dashboards, permission groups, and sets the graph — fully automated.

**Diagnostics (#10) + Logger (#11)**
An automated health check monitors connection pool exhaustion every 5 minutes for proactive incident response.
