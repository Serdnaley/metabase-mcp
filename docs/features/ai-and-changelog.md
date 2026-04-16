# AI Features & Changelog

Metabase's AI capabilities and features introduced in recent versions (53–60).

## Sources

- [AI Features Overview](https://www.metabase.com/docs/latest/ai/start)
- [Agent API](https://www.metabase.com/docs/latest/ai/agent-api)
- [Changelog](https://www.metabase.com/changelog)
- [Releases](https://www.metabase.com/releases)
- [Metabase 60 Changelog](https://www.metabase.com/changelog/60)
- [Metabase 59 Changelog](https://www.metabase.com/changelog/59)
- [Metabase 58 Changelog](https://www.metabase.com/changelog/58)
- [Metabase 57 Changelog](https://www.metabase.com/changelog/57)
- [Metabase 56 Changelog](https://www.metabase.com/changelog/56)
- [Metabase 55 Changelog](https://www.metabase.com/changelog/55)
- [Metabase 54 Changelog](https://www.metabase.com/changelog/54)
- [Metabase 53 Changelog](https://www.metabase.com/changelog/53)

---

## Features

### AI Features

**1. Metabot AI Assistant**
Source: [AI Features Overview](https://www.metabase.com/docs/latest/ai/start)
A conversational AI assistant embedded in Metabase. Ask questions in natural language and receive data answers. Paid add-on for Metabase Cloud. Emerged from beta in v58.

**2. Metabot for Internal Users**
Source: [AI Features Overview](https://www.metabase.com/docs/latest/ai/start)
Separate configuration track for internal users. Admins can focus Metabot on specific data collections and define example prompts.

**3. Metabot for Embedded Users**
Source: [AI Features Overview](https://www.metabase.com/docs/latest/ai/start)
Separate configuration for users accessing Metabase via the embedding SDK. Can be enabled independently. Supports saving and editing Metabot-generated questions.

**4. Metabot in Slack**
Source: [Changelog 60](https://www.metabase.com/changelog/60)
Direct Metabot integration with Slack. Ask analytical questions from Slack channels. Introduced in v60.

**5. AI SQL Generation (Open Source / Self-Hosted)**
Source: [Changelog 59](https://www.metabase.com/changelog/59)
Single-shot text-to-SQL generation for OSS and self-hosted instances. Introduced in v59. Can be triggered via keyboard shortcut.

**6. Bring Your Own Key (BYOK) for Metabot**
Source: [Changelog 60](https://www.metabase.com/changelog/60)
Supply your own LLM API key with model selection capability. Introduced in v60 beta.

**7. Metabase MCP Server**
Source: [Changelog 60](https://www.metabase.com/changelog/60)
Official MCP server for integration with Claude and Cursor. Enables AI coding assistants to query Metabase data directly. Introduced in v60 beta.

**8. Metabot Awareness of Measures and Segments**
Source: [Changelog 59](https://www.metabase.com/changelog/59)
Metabot discovers and uses published Measures and Segments from the semantic layer. Added in v59.

**9. Glossary for AI Context**
Source: [AI Features Overview](https://www.metabase.com/docs/latest/ai/start)
A data reference section where admins define business terminology. Metabot reads the glossary to improve understanding of domain-specific language.

**10. Agent API**
Source: [Agent API](https://www.metabase.com/docs/latest/ai/agent-api)
A dedicated REST API at `/api/agent/v1` for building headless, agentic BI applications on top of Metabase's semantic layer.

**11. Agent API: Table and Metric Search**
Source: [Agent API](https://www.metabase.com/docs/latest/ai/agent-api)
Endpoint to search and discover available tables and metrics within the semantic layer.

**12. Agent API: Field Metadata Inspection**
Source: [Agent API](https://www.metabase.com/docs/latest/ai/agent-api)
Endpoint to examine field-level details, data types, semantic types, and metadata.

**13. Agent API: Query Construction and Execution**
Source: [Agent API](https://www.metabase.com/docs/latest/ai/agent-api)
Build and run queries programmatically without knowing MBQL. Returns up to 200 rows per request.

**14. Agent API: Pagination via Continuation Tokens**
Source: [Agent API](https://www.metabase.com/docs/latest/ai/agent-api)
Paginated result retrieval via continuation tokens beyond the 200-row limit.

**15. Agent API: API Key Authentication**
Source: [Agent API](https://www.metabase.com/docs/latest/ai/agent-api)
Simplest auth path via API keys assigned to user groups.

**16. Agent API: Session Token Authentication**
Source: [Agent API](https://www.metabase.com/docs/latest/ai/agent-api)
Authenticate via username/password for a session token. Per-user permissions.

**17. Agent API: JWT Authentication (Pro/Enterprise)**
Source: [Agent API](https://www.metabase.com/docs/latest/ai/agent-api)
Bearer token JWT authentication. Supports email claims, name fields, and group synchronization.

**18. AI Chat Component in Embedding SDK**
Source: [AI Features Overview](https://www.metabase.com/docs/latest/ai/start)
Embeddable conversational AI chat interface. `MetabotQuestion` component supports layout options.

### Version 60 Features

**19. Metrics Explorer**
Source: [Changelog 60](https://www.metabase.com/changelog/60)
A dedicated home page for exploring, editing metric definitions, and configuring metric settings.

**20. Data Source Replacement (Pro/Enterprise)**
Source: [Changelog 60](https://www.metabase.com/changelog/60)
Swap the underlying data source across questions and dashboards without rebuilding them.

**21. Stacked Visualizations with "Split series into panels"**
Source: [Changelog 60](https://www.metabase.com/changelog/60)
Bar, line, area, and scatter charts can split series into separate panels.

**22. Table Column and Row Freezing**
Source: [Changelog 60](https://www.metabase.com/changelog/60)
Pin columns or rows in table visualizations so they remain visible during scrolling.

**23. Transform Inspector**
Source: [Changelog 60](https://www.metabase.com/changelog/60)
Diagnostic tool for transforms showing column statistics and join analysis.

**24. One-Click Model-to-Transform Conversion**
Source: [Changelog 60](https://www.metabase.com/changelog/60)
Convert an existing model into a transform with one click.

**25. OpenID Authentication Support**
Source: [Changelog 60](https://www.metabase.com/changelog/60)
Added OpenID as an authentication option.

**26. Git Provider Support Beyond GitHub**
Source: [Changelog 60](https://www.metabase.com/changelog/60)
Remote sync now works with GitLab, Bitbucket, etc.

**27. Embedding Setup Wizard**
Source: [Changelog 60](https://www.metabase.com/changelog/60)
Step-by-step configuration wizard for embedding setup.

### Version 59 Features

**28. Data Studio**
Source: [Changelog 59](https://www.metabase.com/changelog/59)
Analyst workbench for shaping data and curating the semantic layer.

**29. Library (Pro/Enterprise)**
Source: [Changelog 59](https://www.metabase.com/changelog/59)
Curated repository of trusted analytics content.

**30. Glossary**
Source: [Changelog 59](https://www.metabase.com/changelog/59)
Define and maintain business-relevant terms in data reference.

**31. Dependency Graph Visualization (Pro/Enterprise)**
Source: [Changelog 59](https://www.metabase.com/changelog/59)
Visual graph showing relationships between analytics entities.

**32. Dependency Diagnostics**
Source: [Changelog 59](https://www.metabase.com/changelog/59)
Identifies broken dependencies between content entities.

**33. Transforms**
Source: [Changelog 59](https://www.metabase.com/changelog/59)
Data wrangling capability using SQL or Python to reshape data.

**34. Box and Whisker Plot**
Source: [Changelog 59](https://www.metabase.com/changelog/59)
New visualization type for statistical distribution analysis.

**35. Conditional Colors for Big Number Visualization**
Source: [Changelog 59](https://www.metabase.com/changelog/59)
Threshold-based color changes for big number cards.

**36. Agent API for LLM Agents**
Source: [Changelog 59](https://www.metabase.com/changelog/59)
Dedicated API for LLM agents to access the semantic layer.

**37. Custom Y-Axis Ranges**
Source: [Changelog 59](https://www.metabase.com/changelog/59)
Set explicit min/max ranges on Y-axes.

### Version 58 Features

**38. Tenants Feature (Pro/Enterprise)**
Source: [Changelog 58](https://www.metabase.com/changelog/58)
Multi-tenant permission management with JWT-based tenant assignment.

**39. Guest Embeds**
Source: [Changelog 58](https://www.metabase.com/changelog/58)
View-only charts and dashboards without user authentication. WYSIWYG wizard and deeper theming.

**40. Metabot Generally Available**
Source: [Changelog 58](https://www.metabase.com/changelog/58)
Exits beta, available as paid add-on for Cloud.

**41. AWS IAM Authentication for Aurora (Pro/Enterprise)**
Source: [Changelog 58](https://www.metabase.com/changelog/58)
Connect to RDS databases using IAM roles without static credentials.

**42. Documents Available on All Plans**
Source: [Changelog 58](https://www.metabase.com/changelog/58)
Previously Pro/Enterprise only, now universally available.

### Version 57 Features

**43. Remote Sync (Pro/Enterprise)**
Source: [Changelog 57](https://www.metabase.com/changelog/57)
Sync Metabase instances with a GitHub repository for development-to-production workflows.

**44. Dark Mode**
Source: [Changelog 57](https://www.metabase.com/changelog/57)
User-level dark mode preference via Account Settings or command palette.

**45. Broken Dependencies Checker (Pro/Enterprise)**
Source: [Changelog 57](https://www.metabase.com/changelog/57)
Alerts when changes would break dependent entities.

**46. Documents (Pro/Enterprise)**
Source: [Changelog 57](https://www.metabase.com/changelog/57)
Combine text, charts, and content into narrative stories. Supports commenting and @-mentions.

**47. Editable Tables (Pro/Enterprise)**
Source: [Changelog 57](https://www.metabase.com/changelog/57)
Edit data directly from the Metabase interface for PostgreSQL and MySQL.

**48. SQL Snippet Variables**
Source: [Changelog 57](https://www.metabase.com/changelog/57)
Include filters and time grouping parameters in SQL snippets.

**49. Dynamic Progress Bar Goals**
Source: [Changelog 57](https://www.metabase.com/changelog/57)
Column-based goal values instead of static numeric constants.

**50. Database Routing for Snowflake**
Source: [Changelog 57](https://www.metabase.com/changelog/57)
Route queries to different Snowflake databases based on user attributes.

### Version 56 Features

**51. Dashboard Filters in Card Bodies and Headers**
Source: [Changelog 56](https://www.metabase.com/changelog/56)
Add filter widgets directly inside dashboard cards.

**52. Time Granularity Parameters in SQL Questions**
Source: [Changelog 56](https://www.metabase.com/changelog/56)
Allow time breakout selection as a SQL question parameter.

**53. Field Filters for Aliased Tables**
Source: [Changelog 56](https://www.metabase.com/changelog/56)
Enable field filters with CTEs and aliased table references.

**54. Multi-Value Selection in Basic SQL Variables**
Source: [Changelog 56](https://www.metabase.com/changelog/56)
Select multiple values for a single SQL variable.

**55. Reference Previous Aggregations**
Source: [Changelog 56](https://www.metabase.com/changelog/56)
Build custom aggregation expressions referencing earlier aggregations.

**56. Joins Using Custom Expressions or Constants**
Source: [Changelog 56](https://www.metabase.com/changelog/56)
Supports non-equi joins including 1=1 cross-joins.

**57. `today()` Custom Expression Function**
Source: [Changelog 56](https://www.metabase.com/changelog/56)
Returns the current date for calculated fields and filters.

**58. `datetime()` Custom Expression Function**
Source: [Changelog 56](https://www.metabase.com/changelog/56)
Constructs datetime values in custom expressions.

**59. Boolean SQL Variable Type**
Source: [Changelog 56](https://www.metabase.com/changelog/56)
Use boolean values as SQL template variables.

### Version 55 Features

**60. Multi-Catalog Databricks Support**
Source: [Changelog 55](https://www.metabase.com/changelog/55)
Connect to multiple catalogs within a single Databricks workspace.

**61. Database Routing**
Source: [Changelog 55](https://www.metabase.com/changelog/55)
Route query execution to actual databases based on user attributes.

**62. New Dashboard Card Editing Interface**
Source: [Changelog 55](https://www.metabase.com/changelog/55)
Reuse queries with drag-and-drop for measures, dimensions, and series.

**63. Funnel Visualization from Individual Pieces**
Source: [Changelog 55](https://www.metabase.com/changelog/55)
Build funnels step-by-step from individual queries.

**64. Type Casting Expressions (`date()`, `text()`, `integer()`, `float()`)**
Source: [Changelog 55](https://www.metabase.com/changelog/55)
Type casting for converting values at the expression level.

**65. `splitPart()` Expression**
Source: [Changelog 55](https://www.metabase.com/changelog/55)
Extract the nth segment of a string split by a delimiter.

**66. Keyboard Shortcuts**
Source: [Changelog 55](https://www.metabase.com/changelog/55)
Global contextual shortcuts for common actions.

### Version 54 Features

**67. Multi-Line Custom Expression Editor**
Source: [Changelog 54](https://www.metabase.com/changelog/54)
Rewritten editor with multiple lines, auto-formatting, and function library.

**68. `DistinctIf()` Custom Expression**
Source: [Changelog 54](https://www.metabase.com/changelog/54)
Count distinct values that meet a specified condition.

**69. `path()` Custom Expression**
Source: [Changelog 54](https://www.metabase.com/changelog/54)
Extract path components from URL strings.

**70. Cron Expression Support for Alerts**
Source: [Changelog 54](https://www.metabase.com/changelog/54)
Define custom alert schedules using cron syntax.

**71. ClickHouse Driver Officialized**
Source: [Changelog 54](https://www.metabase.com/changelog/54)
ClickHouse becomes a first-party supported driver.

### Version 53 Features

**72. Questions Saved Directly in Dashboards**
Source: [Changelog 53](https://www.metabase.com/changelog/53)
Questions can be created and saved within the dashboard context.

**73. Preemptive Caching**
Source: [Changelog 53](https://www.metabase.com/changelog/53)
Automatically rerun queries when cache is invalidated, before a user requests results.

**74. `in` and `notIn` Custom Expression Functions**
Source: [Changelog 53](https://www.metabase.com/changelog/53)
Check whether a value is (or is not) in a specified list.

**75. Parameters Support in Link/Iframe Cards**
Source: [Changelog 53](https://www.metabase.com/changelog/53)
Pass parameter values to link cards and iframe cards in dashboards.

---

## Use Cases

**Metabot AI Assistant (#1)**
A business analyst asks "What were our top 10 products by revenue last quarter in EMEA?" in Metabot and receives a formatted answer without SQL.

**Metabot for Embedded Users (#3) + Save/Edit from Embedded Metabot**
A SaaS customer asks Metabot for a churn trend, then saves the generated chart as a pinned item in their personal dashboard.

**Metabot in Slack (#4)**
An operations team queries metrics directly from Slack during standup without opening a browser.

**AI SQL Generation (#5) + Bring Your Own Key (#6)**
A startup self-hosting Metabase configures their own API key and enables text-to-SQL generation without the cloud add-on.

**Agent API (#10-#14) + API Key Authentication (#15)**
An engineering team builds an internal LLM data assistant. The Agent API discovers tables, inspects metadata, constructs queries, and executes them — all respecting user permissions.

**Agent API (#10-#14) + JWT Authentication (#17) + Continuation Tokens (#14)**
A product team builds a customer-facing AI analyst. JWT scopes each query. Continuation tokens paginate through large result sets.

**Metabase MCP Server (#7)**
A developer uses Claude or Cursor to query their Metabase instance without switching context to the Metabase UI.

**Glossary (#9) + Metabot (#1)**
A finance team defines "ARR" in the Glossary. Metabot uses the definition to produce the correct calculation when asked.

**Data Studio (#28) + Transforms (#33) + Library (#29) + Dependency Graph (#31)**
A data team uses Transforms to write SQL reshaping raw data, publishes to the Library, and uses the Dependency Graph to check impact before changes.

**Dependency Diagnostics (#32) + Broken Dependencies Checker (#45)**
An analyst renames a column. Metabase surfaces all broken references, allowing fixes before users encounter errors.

**Remote Sync (#43) + Git Provider Support (#26)**
A team stores Metabase YAML definitions in GitLab. PR review, merge, and auto-deployment to production.

**Data Source Replacement (#20)**
Dashboards built against staging are swapped to production in one operation.

**Tenants (#38) + Database Routing (#61) + JWT Authentication (#17)**
A single Metabase instance serves all B2B customers. JWTs identify tenants, route queries to correct databases, and restrict collection access.

**Guest Embeds (#39)**
A public-facing benchmark dashboard is embedded with no login required, styled to match the website.

**Documents (#46) + @-Mentions + Commenting**
A product manager creates a monthly review document combining narrative text with live charts. Engineers reply to comments in-thread.

**Editable Tables (#47)**
A sales ops team edits account tier overrides directly in a Metabase table, turning it into a lightweight admin panel.

**Dashboard Filters in Card Bodies (#51)**
Each chart section has its own contextual filter rather than a shared global filter.

**Box and Whisker Plot (#34)**
A data science team monitors model inference latency distributions across deployments.

**Time Granularity Parameters (#52)**
A single SQL query serves daily, weekly, monthly, and quarterly analysis via a granularity dropdown.

**SQL Snippet Variables (#48)**
A complex CTE snippet with injected filter parameters is reused consistently across dozens of queries.

**Preemptive Caching (#73)**
Executive dashboards load instantly because queries are pre-executed before users arrive.

**Questions Saved in Dashboards (#72)**
A product manager creates questions in-context while building a dashboard — no separate "New Question" flow needed.

**Database Routing (#61) + Connection Impersonation**
A healthcare analytics platform runs each query under a database role scoped to the provider organization.

**AWS IAM Authentication (#41)**
An enterprise eliminates static database credentials by connecting to Aurora via IAM roles.

**Metrics Explorer (#19)**
A data governance team views, edits, and manages all metrics from a single catalog.

**Cron Expression Alerts (#70)**
A logistics company checks inventory at 5:50 AM weekdays and 11:30 PM after reconciliation.

**Transform Inspector (#23) + Model-to-Transform Conversion (#24)**
A data engineer analyzes join statistics, then converts a slow model to a pre-computed transform.

**Content Translation for Embedding**
A global enterprise translates column names and labels into 12 languages without maintaining separate configurations.

**`splitPart()` (#65) + `path()` (#69) + Type Casting (#64)**
A data team casts raw string event logs into proper types and extracts structured segments — all within Metabase's expression layer.

**Multi-Line Expression Editor (#67)**
An analyst formats a complex nested `Case` statement with the function library for reference.

**Dark Mode (#44)**
A data analyst switches to dark mode for late-evening dashboard review.

**Embedding Setup Wizard (#27)**
A developer is guided through the complete embedding setup step by step.

**`mapQuestionClickActions` Plugin + `handleLinks` Plugin**
A CRM intercepts data point clicks and routes them to the relevant CRM record instead of Metabase drill-through.

**Keyboard Shortcuts (#66)**
A power user navigates and operates Metabase entirely from the keyboard.

**Dynamic Progress Bar Goals (#49)**
A sales dashboard reads each rep's individual quota from the database for personalized targets.

**Detail View with Unique URLs**
A customer success team links directly to specific customer records in support tickets.

**`in` / `notIn` (#74) + `DistinctIf()` (#68)**
A marketing analyst counts unique users who performed any of five high-value actions in a single expression.

**Preemptive Caching (#73) + Parameterized Queries**
The top 10 parameter combinations are pre-cached so common dashboard views are always instant.

**API Key Management via `config.yml`**
A DevOps team manages API keys through version-controlled infrastructure-as-code.
