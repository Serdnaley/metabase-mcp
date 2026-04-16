# Admin & Permissions

Metabase's administration, configuration, database management, authentication, permissions, cloud, and monitoring features.

## Sources

- [Installation Overview](https://www.metabase.com/docs/latest/installation-and-operation/start)
- [Configuration Overview](https://www.metabase.com/docs/latest/configuring-metabase/start)
- [Environment Variables](https://www.metabase.com/docs/latest/configuring-metabase/environment-variables)
- [Databases Overview](https://www.metabase.com/docs/latest/databases/start)
- [Connecting Databases](https://www.metabase.com/docs/latest/databases/connecting)
- [People and Groups](https://www.metabase.com/docs/latest/people-and-groups/managing)
- [Permissions Overview](https://www.metabase.com/docs/latest/permissions/start)
- [Data Permissions](https://www.metabase.com/docs/latest/permissions/data)
- [Collection Permissions](https://www.metabase.com/docs/latest/permissions/collections)
- [Row and Column Security](https://www.metabase.com/docs/latest/permissions/row-and-column-security)
- [Application Permissions](https://www.metabase.com/docs/latest/permissions/application)
- [Notification Permissions](https://www.metabase.com/docs/latest/permissions/notifications)
- [Embedding Permissions](https://www.metabase.com/docs/latest/permissions/embedding)
- [Cloud Overview](https://www.metabase.com/docs/latest/cloud/start)
- [Troubleshooting Guide](https://www.metabase.com/docs/latest/troubleshooting-guide/)
- [Usage Analytics](https://www.metabase.com/docs/latest/usage-and-performance-tools/usage-analytics)
- [Serialization](https://www.metabase.com/docs/latest/installation-and-operation/serialization)
- [Monitoring](https://www.metabase.com/docs/latest/installation-and-operation/monitoring-metabase)
- [Prometheus Observability](https://www.metabase.com/docs/latest/installation-and-operation/observability-with-prometheus)
- [Database Sync and Scan](https://www.metabase.com/docs/latest/databases/sync-scan)
- [Backup and Restore](https://www.metabase.com/docs/latest/installation-and-operation/backing-up-metabase-application-data)
- [Upgrading](https://www.metabase.com/docs/latest/installation-and-operation/upgrading-metabase)
- [Database Users and Roles](https://www.metabase.com/docs/latest/databases/users-roles-privileges)
- [Data Uploads](https://www.metabase.com/docs/latest/databases/uploads)
- [CLI Commands](https://www.metabase.com/docs/latest/installation-and-operation/commands)
- [SSH Tunneling](https://www.metabase.com/docs/latest/databases/ssh-tunnel)
- [Encrypting Database Details](https://www.metabase.com/docs/latest/databases/encrypting-details-at-rest)
- [H2 Migration](https://www.metabase.com/docs/latest/installation-and-operation/migrating-from-h2)
- [Caching](https://www.metabase.com/docs/latest/configuring-metabase/caching)
- [Appearance](https://www.metabase.com/docs/latest/configuring-metabase/appearance)
- [SAML Authentication](https://www.metabase.com/docs/latest/people-and-groups/authenticating-with-saml)
- [Localization](https://www.metabase.com/docs/latest/configuring-metabase/localization)
- [Custom Maps](https://www.metabase.com/docs/latest/configuring-metabase/custom-maps)
- [Email Configuration](https://www.metabase.com/docs/latest/configuring-metabase/email)
- [Slack Integration](https://www.metabase.com/docs/latest/configuring-metabase/slack)
- [Application Database](https://www.metabase.com/docs/latest/installation-and-operation/configuring-application-database)
- [SSL Certificates](https://www.metabase.com/docs/latest/databases/ssl-certificates)
- [Cloud Storage](https://www.metabase.com/docs/latest/cloud/storage)
- [Cloud Custom Domain](https://www.metabase.com/docs/latest/cloud/custom-domain)
- [Cloud Migration](https://www.metabase.com/docs/latest/cloud/migrate/guide)
- [Google Sheets](https://www.metabase.com/docs/latest/cloud/google-sheets)

---

Due to the extensive size of this feature area (245 features), this document covers the key categories with selected features. See the source documentation links above for complete details.

## Feature Categories

### Installation & Deployment
- Metabase Cloud (hosted), JAR file, Docker, Podman, Azure Web Apps, Systemd service, Air-gapped edition, building from source
- Sample database bundled with every install

### Application Database
- H2 embedded (demo only), PostgreSQL (production), MySQL/MariaDB (production)
- H2-to-production migration (`load-from-h2`), manual migration control (`MB_DB_AUTOMIGRATE`)
- Connection pooling configuration

### Backup & Restore
- H2 file backup, PostgreSQL/MySQL backup via native tools
- Backup-based rollback for failed upgrades

### Upgrades
- Automatic Cloud upgrades, self-hosted upgrade process
- Early Cloud upgrade option, downgrade/migrate-down command
- Sequential upgrade requirement (pre-v40 instances)

### Serialization (Pro/Enterprise)
- Content export to YAML (collections, dashboards, questions, models, metrics, actions, snippets, segments, metadata, settings)
- Content import from YAML
- Selective export options (`--collection`, `--no-collections`, `--no-settings`, `--no-data-model`)
- Entity ID management (`seed-entity-ids`, `drop-entity-ids`)
- Git-based version control integration

### Monitoring & Observability
- JMX monitoring, heap dump analysis, thread dump analysis
- Prometheus metrics endpoint (`/metrics`)
- Health check logging control

### CLI Commands
- `export`, `import`, `load-from-h2`, `dump-to-h2`, `migrate`, `reset-password`
- `rotate-encryption-key`, `remove-encryption`
- `seed-entity-ids`, `drop-entity-ids`
- `api-documentation`, `config-template`, `environment-variables-documentation`, `version`

### Web Server (Jetty)
- HTTP server configuration (host, port, thread pool, timeout, header size)
- SSL/TLS termination with keystore, client certificate authentication (mTLS)
- HTTPS redirect enforcement

### Authentication & SSO
- Email/password authentication (can be disabled for SSO-only)
- Google Sign-In with auto account creation
- LDAP/Active Directory with group sync and user attribute sync
- JWT authentication (Pro/Enterprise) with group and tenant claims
- SAML 2.0 (Pro/Enterprise) with SLO support
- Session management (max age, inactivity timeout, brute-force protection)
- New device login notifications, API keys

### User Management
- Manual account creation, editing, password reset
- Account deactivation/reactivation
- User attributes (Pro/Enterprise) for row/column security
- Admin password reset via CLI

### Group Management
- Custom groups, Administrators group, All Users group
- Data Analysts group (Pro/Enterprise)
- Group Managers (Pro/Enterprise)
- SSO group synchronization (LDAP, JWT, SAML)

### Database Connections
- 20+ supported databases (PostgreSQL, MySQL, BigQuery, Snowflake, Redshift, Databricks, MongoDB, etc.)
- Community drivers, writeable connections, multi-tenant routing
- SSH tunneling (password and PKI key auth)
- SSL/TLS for database connections
- Database credential encryption at rest (AES256 + SHA512)
- Encryption key rotation

### Database Sync & Scanning
- Schema sync (hourly default), field value scanning, database fingerprinting
- Manual sync/rescan triggers, API-triggered sync notifications
- Table visibility control, cached field value clearing

### Data Permissions
- View Data (Can View, Granular, Row/Column Security, Impersonated, Blocked)
- Create Queries (Query Builder and Native, Query Builder Only, Granular)
- Download Results (no downloads, 10K rows, 1M rows, granular)
- Manage Table Metadata, Manage Database, Transform permissions

### Collection Permissions
- Curate, View, No Access levels
- Sub-collection independent permissions
- Personal collections with fixed permissions

### Row and Column Security (Pro/Enterprise)
- Row-level security via user attributes
- Column-level security via SQL questions
- SQL variable row restriction
- Multi-ID access via comma-separated attributes

### Application Permissions (Pro/Enterprise)
- Settings Access, Monitoring Access, Subscriptions and Alerts permissions

### Caching
- Duration-based, schedule-based, adaptive cache policies
- Automatic cache refresh (Pro/Enterprise)
- Cache hierarchy: question > dashboard > database > instance
- Parameterized query cache (top 10 combinations)

### Localization & Formatting
- 40+ languages, report timezone, week start day
- Date/time/number/currency format customization

### Appearance & Branding (Pro/Enterprise)
- Custom application name, logo, favicon
- UI color customization, custom chart palette
- Custom font, loading message, illustrations
- Custom help link, hide Metabase links, dark mode

### Cloud Features
- Managed hosting, custom domain, region selection
- IP allowlisting, Cloud Storage (ClickHouse-backed)
- Google Sheets sync, self-hosted to Cloud migration
- Cloud billing and subscription management

### Usage Analytics (Pro/Enterprise)
- Pre-built dashboards: Metabase Metrics, Most Viewed Content, Person Overview, Dashboard Overview, Question Overview, Performance Overview, Content with Cobwebs
- Activity Log, View Log, Query Log, System Tasks models
- 720-day audit data retention (configurable)

### Email & Notifications
- SMTP configuration, custom from/reply-to addresses
- Approved recipient domains (Pro/Enterprise)
- Slack integration with private channel access
- Webhook notifications

---

## Use Cases

**Metabase Cloud**
A startup deploys production analytics in minutes with zero infrastructure management.

**Docker Deployment + Systemd**
A platform team deploys Metabase via Docker with auto-restart on failures.

**Air-Gapped Edition**
A government agency deploys Metabase in a classified network with no internet.

**PostgreSQL App Database + Backup**
A company migrates from H2 to PostgreSQL via `load-from-h2`, then sets up automated pg_dump backups.

**Serialization + Git Integration**
A BI team exports YAML from staging, reviews the diff in a Git PR, then imports to production as CI/CD.

**Remote Sync Auto-Import**
A GitHub Action pushes YAML updates. Metabase polls every 5 minutes and auto-imports changes.

**Prometheus Metrics + Monitoring**
A platform team builds Grafana dashboards tracking Jetty latency, connection pool usage, JVM heap, and email failures.

**SAML Authentication + Group Sync + Row/Column Security**
An enterprise uses Okta SSO. Department attributes flow into Metabase user attributes at login. Row-level security filters each user's view to their business unit.

**LDAP + Group Sync + User Attribute Sync**
Employees log in with Windows credentials. AD group memberships map to Metabase groups automatically.

**JWT Authentication + Multi-Tenancy**
A SaaS company generates JWT tokens with `tenant_id` claim. Metabase maps this to row-level security filters.

**Google Sign-In + Auto Account Creation**
Any employee visits Metabase and logs in with their Google account without admin pre-provisioning.

**Session Timeout + New Device Notifications**
A healthcare organization sets 30-minute inactivity timeout and new-device email alerts for HIPAA compliance.

**Account Deactivation + Bulk Subscription Removal**
When an employee leaves, the admin deactivates their account and bulk-removes all their subscriptions.

**User Attributes + Row-Level Security**
Each customer's `account_id` user attribute filters all tables via `WHERE account_id = {{user.account_id}}`.

**Column-Level Security + Admin-Only SQL Collection**
A SQL question selecting only non-sensitive columns serves as the restricted view for the Managers group.

**Group Managers (Pro/Enterprise)**
Department heads manage their own team's Metabase group membership without full admin access.

**View Data: Blocked + All Users Group**
A sensitive database is blocked for All Users, then explicitly granted to a dedicated Finance group.

**Download Results Permission**
Business users get 10K row limits. The data team gets 1M. Executives have downloads disabled entirely.

**Adaptive Cache + Duration Cache**
A dashboard-level cache refreshes every 6 hours. A specific analyst question uses adaptive policy with 1-hour minimum TTL.

**Automatic Cache Refresh (Pro/Enterprise)**
Customer-facing dashboards are preemptively refreshed so users never trigger live queries.

**CSV Upload + Cloud Storage**
A marketing analyst uploads campaign attribution CSV. Metabase creates a ClickHouse table and model automatically.

**Google Sheets Sync (Cloud)**
A finance team's budget spreadsheet auto-syncs every 15 minutes into Metabase Cloud Storage.

**SSH Tunneling + PKI Key**
Metabase tunnels through an SSH bastion host to reach a VPN-protected database.

**Database Credential Encryption + Key Rotation**
All database passwords are encrypted with AES256. Annual key rotation via `rotate-encryption-key` CLI.

**Custom Domain (Cloud) + Custom Logo + Custom Application Name**
A white-label analytics product uses `insights.theirclient.com` with custom branding throughout.

**Self-Hosted to Cloud Migration**
A two-year-old self-hosted instance is migrated to Cloud, preserving all 500+ questions and 100 dashboards.

**Usage Analytics — Performance Overview + Content with Cobwebs**
A BI manager identifies the 10 slowest dashboards and archives 40 abandoned questions with no views in 6 months.

**Usage Analytics — Query Log + View Log**
A data engineering team builds cost allocation models attributing database query costs to business teams.

**SMTP + Approved Recipient Domains**
Subscription recipients are restricted to `@company.com` addresses to prevent data leakage.

**Slack Integration + Private Channels**
A weekly Slack digest posts key metrics to a private `#growth-metrics` channel.

**Webhook Notifications**
An alert triggers a PagerDuty incident when a data quality metric drops below threshold.

**Custom Homepage Dashboard**
Executives land directly on their KPI summary dashboard after login.

**Application Permissions — Settings + Monitoring**
A Tech Support group manages SMTP configuration. A DevOps group views performance tools. Neither has full admin.

**Connection Impersonation + Database Roles**
Queries run under database roles scoped to each business unit for defense-in-depth security.

**`reset-password` CLI**
A locked-out admin generates a one-time reset URL directly from the server console.

**`dump-to-h2` Command**
A production instance is exported to a portable H2 file for consultant debugging.
