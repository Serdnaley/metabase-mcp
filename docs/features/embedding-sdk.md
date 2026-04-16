# Embedding & SDK

Metabase's embedding features: static embedding, public links, full-app embedding, modular embedding, React SDK, and web components.

## Sources

- [Embedding Start](https://www.metabase.com/docs/latest/embedding/start)
- [Modular Embedding](https://www.metabase.com/docs/latest/embedding/modular-embedding)
- [Embedding Components](https://www.metabase.com/docs/latest/embedding/components)
- [Full App Embedding](https://www.metabase.com/docs/latest/embedding/full-app-embedding)
- [Static Embedding](https://www.metabase.com/docs/latest/embedding/static-embedding)
- [Static Embedding Parameters](https://www.metabase.com/docs/latest/embedding/static-embedding-parameters)
- [Public Links](https://www.metabase.com/docs/latest/embedding/public-links)
- [SDK Introduction](https://www.metabase.com/docs/latest/embedding/sdk/introduction)
- [SDK Questions](https://www.metabase.com/docs/latest/embedding/sdk/questions)
- [SDK Dashboards](https://www.metabase.com/docs/latest/embedding/sdk/dashboards)
- [SDK Next.js](https://www.metabase.com/docs/latest/embedding/sdk/next-js)
- [SDK Authentication](https://www.metabase.com/docs/latest/embedding/authentication)
- [SDK Plugins](https://www.metabase.com/docs/latest/embedding/sdk/plugins)
- [SDK Collections](https://www.metabase.com/docs/latest/embedding/sdk/collections)
- [SDK Versioning](https://www.metabase.com/docs/latest/embedding/sdk/version)
- [SDK Config](https://www.metabase.com/docs/latest/embedding/sdk/config)
- [SDK Quickstart](https://www.metabase.com/docs/latest/embedding/sdk/quickstart)
- [Securing Embeds](https://www.metabase.com/docs/latest/embedding/securing-embeds)
- [Appearance Customization](https://www.metabase.com/docs/latest/embedding/appearance)
- [Row and Column Security](https://www.metabase.com/docs/latest/permissions/row-and-column-security)

---

## Features

### Embedding Architecture and Deployment Types

**1. Static Embedding (Signed Embed)**
Source: [Static Embedding](https://www.metabase.com/docs/latest/embedding/static-embedding)
Embed individual questions or dashboards as iframes using server-generated, JWT-signed URLs. The signed token prevents URL tampering and restricts access to only the specific resource.

**2. Public Links and Public Embeds**
Source: [Public Links](https://www.metabase.com/docs/latest/embedding/public-links)
Admins can generate publicly accessible URLs for questions, dashboards, and documents that require no authentication.

**3. Full App Embedding**
Source: [Full App Embedding](https://www.metabase.com/docs/latest/embedding/full-app-embedding)
Embed the entire Metabase application UI inside an iframe. Users interact with Metabase as if it were a first-party feature. Requires Pro or Enterprise.

**4. Modular Embedding (Component Embedding)**
Source: [Modular Embedding](https://www.metabase.com/docs/latest/embedding/modular-embedding)
Embed individual Metabase components via a Web Component script tag. Provides a no-code/low-code integration path with a drop-in script and interactive wizard.

**5. Modular Embedding SDK (React SDK)**
Source: [SDK Introduction](https://www.metabase.com/docs/latest/embedding/sdk/introduction)
A React npm package (`@metabase/embedding-sdk-react`) that lets developers embed Metabase components as native React components inside React applications.

### SDK Components (React SDK)

**6. StaticQuestion Component**
Source: [SDK Questions](https://www.metabase.com/docs/latest/embedding/sdk/questions)
Renders a saved question as a read-only chart. Accepts `height`, `width`, `hiddenParameters`, `initialSqlParameters`, and title display props.

**7. InteractiveQuestion Component**
Source: [SDK Questions](https://www.metabase.com/docs/latest/embedding/sdk/questions)
Renders a question with full interactivity: chart type changes, drill-through, summarization, and exploration. Supports custom child component composition.

**8. StaticDashboard Component**
Source: [SDK Dashboards](https://www.metabase.com/docs/latest/embedding/sdk/dashboards)
Renders a Metabase dashboard in non-interactive mode. No drill-downs, no editing.

**9. InteractiveDashboard Component**
Source: [SDK Dashboards](https://www.metabase.com/docs/latest/embedding/sdk/dashboards)
Full interactive dashboard with drill-downs, click behaviors, question exploration, parameter filtering, and subscriptions.

**10. EditableDashboard Component**
Source: [SDK Dashboards](https://www.metabase.com/docs/latest/embedding/sdk/dashboards)
Extends interactive dashboard with ability to add, remove, and rearrange dashboard cards.

**11. CollectionBrowser Component**
Source: [SDK Collections](https://www.metabase.com/docs/latest/embedding/sdk/collections)
Embeds Metabase's collection navigation interface. Configurable with `collectionId`, `visibleEntityTypes`, `visibleColumns`, `pageSize`, `onClick` callbacks.

**12. AI Chat Component (Metabot) — Web Component**
Source: [Embedding Components](https://www.metabase.com/docs/latest/embedding/components)
Renders the Metabot natural-language AI interface as a drop-in web component (`<metabase-metabot>`). Pro/Enterprise only.

**13. AI Chat Component (Metabot) — SDK**
Source: [SDK Introduction](https://www.metabase.com/docs/latest/embedding/sdk/introduction)
The same Metabot interface as a React component. Supports `isSaveEnabled` and `targetCollection` props.

**14. Query Builder Embedding (Visual)**
Source: [SDK Questions](https://www.metabase.com/docs/latest/embedding/sdk/questions)
Open the visual query builder by setting `questionId="new"`. Lets end users build queries from scratch.

**15. SQL Editor Embedding**
Source: [SDK Questions](https://www.metabase.com/docs/latest/embedding/sdk/questions)
Open the SQL editor by setting `questionId="new-native"`. Allows raw SQL inside the embedded surface.

### Web Component Embedding (Script Tag)

**16. Dashboard Web Component (`<metabase-dashboard>`)**
Source: [Embedding Components](https://www.metabase.com/docs/latest/embedding/components)
Drop-in HTML web component for dashboards. Supports `dashboard-id`, `auto-refresh-interval`, `drills`, `hidden-parameters`, `initial-parameters`, `with-downloads`, `with-subscriptions`, `with-title`.

**17. Question Web Component (`<metabase-question>`)**
Source: [Embedding Components](https://www.metabase.com/docs/latest/embedding/components)
Drop-in HTML web component for questions. Supports `question-id`, `drills`, `hidden-parameters`, `initial-sql-parameters`, `is-save-enabled`, `with-alerts`, `with-downloads`, `with-title`.

**18. Browser Web Component (`<metabase-browser>`)**
Source: [Embedding Components](https://www.metabase.com/docs/latest/embedding/components)
Collection navigation web component. Supports `initial-collection`, `read-only`, `with-new-dashboard`, `with-new-question`. Pro/Enterprise only.

**19. AI Chat Web Component (`<metabase-metabot>`)**
Source: [Embedding Components](https://www.metabase.com/docs/latest/embedding/components)
AI-powered chat interface as a web component. Supports `is-save-enabled`, `layout`, `target-collection`.

### Authentication and Session Management

**20. JWT SSO Authentication**
Source: [SDK Authentication](https://www.metabase.com/docs/latest/embedding/authentication)
Authenticate embedded users via short-lived JWT tokens. Carries user identity, optionally group memberships and user attributes.

**21. SAML SSO Authentication**
Source: [SDK Authentication](https://www.metabase.com/docs/latest/embedding/authentication)
Integrate with identity providers (Auth0, Microsoft Entra ID, Google, Keycloak, Okta) using SAML.

**22. API Key Authentication (Development Only)**
Source: [SDK Authentication](https://www.metabase.com/docs/latest/embedding/authentication)
Use a Metabase API key for local development and evaluation only.

**23. Session Cookie Management**
Source: [SDK Config](https://www.metabase.com/docs/latest/embedding/sdk/config)
Configurable SameSite settings for session cookies. Default session age is 20,160 minutes (2 weeks).

**24. `useMetabaseAuthStatus` Hook**
Source: [SDK Config](https://www.metabase.com/docs/latest/embedding/sdk/config)
React hook that queries the current authentication status of the embedded session.

**25. Per-User Metabase Accounts Requirement**
Source: [SDK Introduction](https://www.metabase.com/docs/latest/embedding/sdk/introduction)
Each end user accessing an authenticated embed must have their own Metabase user account.

**26. Guest Embedding (No Auth Required)**
Source: [Embedding Start](https://www.metabase.com/docs/latest/embedding/start)
Signed JWT embed tokens without requiring end users to log in. View-only access. Available on OSS and Starter plans.

### Data Access Control and Security

**27. Locked Parameters**
Source: [Static Embedding Parameters](https://www.metabase.com/docs/latest/embedding/static-embedding-parameters)
Server-signed JWT parameters that restrict what data is shown. Cannot be changed by the end user.

**28. Editable Parameters (Filter Widgets)**
Source: [Static Embedding Parameters](https://www.metabase.com/docs/latest/embedding/static-embedding-parameters)
Parameters that appear as visible filter widgets in the embedded iframe.

**29. Row-Level Security via User Attributes**
Source: [Row and Column Security](https://www.metabase.com/docs/latest/permissions/row-and-column-security)
Map JWT user attributes to column-level row filters. Each embedded user sees only matching rows.

**30. Column-Level Security**
Source: [Row and Column Security](https://www.metabase.com/docs/latest/permissions/row-and-column-security)
Restrict visible columns using a custom SQL question stored in an admin-only collection.

**31. Group-Based Permission Assignment**
Source: [Securing Embeds](https://www.metabase.com/docs/latest/embedding/securing-embeds)
Assign Metabase user groups via JWT payload. Users inherit all permissions for those groups.

**32. Parameter Signing (Tamper Prevention)**
Source: [Static Embedding Parameters](https://www.metabase.com/docs/latest/embedding/static-embedding-parameters)
Embedding parameters in the JWT payload cannot be altered by client-side URL manipulation.

**33. CORS Configuration**
Source: [SDK Config](https://www.metabase.com/docs/latest/embedding/sdk/config)
Configure Metabase's allowed origins list so only specified host domains can load embedded components.

**34. Row/Column Security Limitation on Public Links**
Source: [Public Links](https://www.metabase.com/docs/latest/embedding/public-links)
Row and column security does not apply to public questions or dashboards — no login context to derive user attributes.

### Appearance and Theming

**35. Light and Dark Theme Presets**
Source: [Appearance Customization](https://www.metabase.com/docs/latest/embedding/appearance)
Two built-in theme presets: light (default) and dark.

**36. Custom Font Family**
Source: [Appearance Customization](https://www.metabase.com/docs/latest/embedding/appearance)
Override the embedded UI's font family. Pro/Enterprise only.

**37. Custom Font Size and Line Height**
Source: [Appearance Customization](https://www.metabase.com/docs/latest/embedding/appearance)
Override base font size and line height. Pro/Enterprise only.

**38. Brand Color Customization**
Source: [Appearance Customization](https://www.metabase.com/docs/latest/embedding/appearance)
Set primary brand colors (`brand`, `brand-hover`, `brand-hover-light`). Pro/Enterprise only.

**39. Full Color Token System**
Source: [Appearance Customization](https://www.metabase.com/docs/latest/embedding/appearance)
Override any of Metabase's UI color tokens: text, background, border, filter, summarize, positive, negative, focus, shadow.

**40. Custom Chart Color Palette**
Source: [Appearance Customization](https://www.metabase.com/docs/latest/embedding/appearance)
Define up to 8 custom chart series colors.

**41. Component-Specific Theming**
Source: [Appearance Customization](https://www.metabase.com/docs/latest/embedding/appearance)
Fine-grained overrides per component type: Dashboard, Question, Tooltips, Tables, Numbers, Cartesian chart padding, pivot table cell styles.

**42. Appearance via URL Hash Parameters (Static and Public Embeds)**
Source: [Appearance Customization](https://www.metabase.com/docs/latest/embedding/appearance)
Control appearance through `#background`, `#bordered`, `#titled`, `#theme`, `#locale`, `#font`, `#downloads`, `#refresh`.

**43. "Powered by Metabase" Banner Removal**
Source: [Appearance Customization](https://www.metabase.com/docs/latest/embedding/appearance)
Hide branding banner on Pro/Enterprise plans.

**44. Custom Loader Component**
Source: [SDK Config](https://www.metabase.com/docs/latest/embedding/sdk/config)
Replace default loading spinner with a custom React component via `loaderComponent`. Pro/Enterprise only.

**45. Custom Error Component**
Source: [SDK Config](https://www.metabase.com/docs/latest/embedding/sdk/config)
Replace default error display with a custom React component via `errorComponent`. Pro/Enterprise only.

**46. Custom No-Data Illustrations**
Source: [SDK Config](https://www.metabase.com/docs/latest/embedding/sdk/config)
Replace default "sailboat" images shown when queries return no results.

### Interactivity and Drill-Through

**47. Drill-Through on Charts**
Source: [SDK Dashboards](https://www.metabase.com/docs/latest/embedding/sdk/dashboards)
Clicking a data point triggers a drill-through menu. Controlled via `drills` attribute/prop.

**48. `mapQuestionClickActions` Plugin**
Source: [SDK Plugins](https://www.metabase.com/docs/latest/embedding/sdk/plugins)
Intercept or augment click-action menus. Can return default actions, append custom actions, or trigger immediate custom actions.

**49. `handleLink` Plugin**
Source: [SDK Plugins](https://www.metabase.com/docs/latest/embedding/sdk/plugins)
Intercept link click events inside embedded content. Return `{ handled: true }` or `{ handled: false }`.

**50. `dashboardCardMenu` Plugin**
Source: [SDK Plugins](https://www.metabase.com/docs/latest/embedding/sdk/plugins)
Modify the overflow (three-dot) menu on individual dashboard cards.

**51. `renderDrillThroughQuestion` Prop**
Source: [SDK Dashboards](https://www.metabase.com/docs/latest/embedding/sdk/dashboards)
Customize the layout of the drill-through question view.

**52. Entity Navigation (`enable-entity-navigation`)**
Source: [Embedding Components](https://www.metabase.com/docs/latest/embedding/components)
Internal links navigate within the embedded context rather than opening Metabase externally.

**53. Summarization and Grouping Controls**
Source: [SDK Questions](https://www.metabase.com/docs/latest/embedding/sdk/questions)
Interactive questions expose summarization and grouping/breakout controls.

**54. Filtering Controls**
Source: [SDK Questions](https://www.metabase.com/docs/latest/embedding/sdk/questions)
Filter widgets controlled by `initialParameters`, `hiddenParameters`, and locked parameters.

**55. Simulated Drill-Through for Public Embeds**
Source: [Public Links](https://www.metabase.com/docs/latest/embedding/public-links)
Configure custom click destinations on public dashboards to navigate to other public dashboards with filter values.

### Subscriptions, Alerts, and Downloads

**56. Dashboard Subscriptions**
Source: [SDK Dashboards](https://www.metabase.com/docs/latest/embedding/sdk/dashboards)
Allow embedded users to subscribe to dashboards. Toggled via `with-subscriptions`. Pro/Enterprise only.

**57. Question Alerts**
Source: [SDK Questions](https://www.metabase.com/docs/latest/embedding/sdk/questions)
Allow embedded users to configure alerts on question results. Toggled via `with-alerts` / `withAlerts`.

**58. Download Controls (Questions)**
Source: [SDK Questions](https://www.metabase.com/docs/latest/embedding/sdk/questions)
Expose download button for CSV, XLSX, and JSON export. Configurable via `with-downloads`.

**59. Download Controls (Dashboards)**
Source: [SDK Dashboards](https://www.metabase.com/docs/latest/embedding/sdk/dashboards)
Expose download buttons for PDF and results export.

**60. Raw / Unformatted Export**
Source: [Public Links](https://www.metabase.com/docs/latest/embedding/public-links)
Append `?format_rows=false` to retrieve raw, unformatted query results.

### Localization and Internationalization

**61. Locale Setting (SDK)**
Source: [SDK Config](https://www.metabase.com/docs/latest/embedding/sdk/config)
Set display language using ISO language codes via `locale` prop on `MetabaseProvider`.

**62. Locale Setting (Static/Public Embeds)**
Source: [Appearance Customization](https://www.metabase.com/docs/latest/embedding/appearance)
Set language via `#locale=ko` hash parameter. Pro/Enterprise only.

**63. Translation Dictionaries**
Source: [Embedding Start](https://www.metabase.com/docs/latest/embedding/start)
Override or supplement Metabase's built-in translations for custom terminology.

### Full App Embedding Controls

**64. Full App Embedding UI Customization via URL Parameters**
Source: [Full App Embedding](https://www.metabase.com/docs/latest/embedding/full-app-embedding)
Control which UI chrome elements are visible: top navigation, side navigation, breadcrumbs, search bar, new item button.

**65. PostMessage Communication**
Source: [Full App Embedding](https://www.metabase.com/docs/latest/embedding/full-app-embedding)
The embedded iframe communicates with the parent page via `postMessage`. Supports location tracking and frame mode switching.

**66. Frame Sizing Modes (`normal` / `fit`)**
Source: [Full App Embedding](https://www.metabase.com/docs/latest/embedding/full-app-embedding)
The iframe can operate in `normal` mode (scrolls independently) or `fit` mode (resizes to content height).

**67. Auto-Resize via iFrame Resizer**
Source: [Full App Embedding](https://www.metabase.com/docs/latest/embedding/full-app-embedding)
Integration with iFrame Resizer library for automatic sizing.

**68. Dashboard Tab Embedding**
Source: [Full App Embedding](https://www.metabase.com/docs/latest/embedding/full-app-embedding)
Link directly to a specific tab within a multi-tab dashboard via URL.

**69. Deep Linking via Entity IDs**
Source: [Full App Embedding](https://www.metabase.com/docs/latest/embedding/full-app-embedding)
Use stable entity IDs so links remain valid across serialization/restore cycles.

**70. Manual Logout URL**
Source: [Full App Embedding](https://www.metabase.com/docs/latest/embedding/full-app-embedding)
A dedicated endpoint for programmatic session logout.

### SDK Configuration and Provider

**71. `MetabaseProvider` Component**
Source: [SDK Config](https://www.metabase.com/docs/latest/embedding/sdk/config)
Root React context provider. Accepts `authConfig`, `theme`, `locale`, `pluginsConfig`, `eventHandlers`, `errorComponent`, `loaderComponent`.

**72. `defineMetabaseAuthConfig()` Function**
Source: [SDK Config](https://www.metabase.com/docs/latest/embedding/sdk/config)
Factory function that produces the `authConfig` object.

**73. `onDashboardLoad` Event Handler**
Source: [SDK Config](https://www.metabase.com/docs/latest/embedding/sdk/config)
Triggered after a dashboard fully loads with all visible cards rendered.

**74. `onDashboardLoadWithoutCards` Event Handler**
Source: [SDK Config](https://www.metabase.com/docs/latest/embedding/sdk/config)
Triggered after dashboard structure loads but before card results are fetched.

**75. Component `key` Reloading**
Source: [SDK Config](https://www.metabase.com/docs/latest/embedding/sdk/config)
Force any SDK component to refetch by incrementing its `key` prop.

**76. `allowConsoleLog` Configuration**
Source: [SDK Config](https://www.metabase.com/docs/latest/embedding/sdk/config)
Enables or suppresses SDK DevTools logging.

### SDK Architecture and Versioning

**77. Two-Part SDK Bundle Architecture (v57+)**
Source: [SDK Versioning](https://www.metabase.com/docs/latest/embedding/sdk/version)
The npm package loads the main SDK bundle from the Metabase instance, guaranteeing compatibility.

**78. Version-Specific npm Distribution Tags**
Source: [SDK Versioning](https://www.metabase.com/docs/latest/embedding/sdk/version)
Install SDK pinned to a specific Metabase release using tags like `@56-stable`.

**79. Canary Distribution Tag**
Source: [SDK Versioning](https://www.metabase.com/docs/latest/embedding/sdk/version)
Install SDK builds compatible with nightly Metabase builds.

**80. Cloud Version Pinning**
Source: [SDK Versioning](https://www.metabase.com/docs/latest/embedding/sdk/version)
Pin Cloud instance to a specific version via Admin > Embedding > Modular > Version Pinning.

**81. Minimum Version Requirement**
Source: [SDK Introduction](https://www.metabase.com/docs/latest/embedding/sdk/introduction)
Requires Metabase 1.52+, React 18 or 19, Node.js 20.x+.

### Dashboard and Question Creation APIs

**82. `useCreateDashboardApi` Hook**
Source: [SDK Dashboards](https://www.metabase.com/docs/latest/embedding/sdk/dashboards)
Programmatic dashboard creation without opening the Metabase UI.

**83. `CreateDashboardModal` Component**
Source: [SDK Dashboards](https://www.metabase.com/docs/latest/embedding/sdk/dashboards)
Modal dialog for user-driven dashboard creation.

**84. `isSaveEnabled` / `is-save-enabled` Prop**
Source: [SDK Questions](https://www.metabase.com/docs/latest/embedding/sdk/questions)
Controls whether the save button is shown on embedded questions.

**85. `onBeforeSave` Callback**
Source: [SDK Questions](https://www.metabase.com/docs/latest/embedding/sdk/questions)
Fired before a question is saved for validation logic.

**86. `onSave` Callback**
Source: [SDK Questions](https://www.metabase.com/docs/latest/embedding/sdk/questions)
Fired after a question is saved.

**87. `targetCollection` / `target-collection` Prop**
Source: [SDK Questions](https://www.metabase.com/docs/latest/embedding/sdk/questions)
Hard-code the destination collection for saved content.

### Public Link Management

**88. Public Link Admin Dashboard**
Source: [Public Links](https://www.metabase.com/docs/latest/embedding/public-links)
Centralized admin view showing all publicly shared content with bulk deactivation.

**89. Public Link Deactivation**
Source: [Public Links](https://www.metabase.com/docs/latest/embedding/public-links)
Revoke individual public links instantly.

**90. Global Public Sharing Disable**
Source: [Public Links](https://www.metabase.com/docs/latest/embedding/public-links)
Disable all public sharing across the entire instance from a single setting.

**91. Filter Parameters on Public Embeds**
Source: [Public Links](https://www.metabase.com/docs/latest/embedding/public-links)
Pass query parameters in the public embed URL to pre-filter data.

**92. Hidden Filter Parameters**
Source: [Public Links](https://www.metabase.com/docs/latest/embedding/public-links)
Use `#hide_parameters` to hide filter widgets while still applying values.

**93. Auto-Refresh for Dashboards**
Source: [Public Links](https://www.metabase.com/docs/latest/embedding/public-links)
Set `#refresh=60` for automatic re-execution at specified intervals.

### Plan and Licensing Boundaries

**94. OSS/Starter Guest Embedding**
Source: [Embedding Start](https://www.metabase.com/docs/latest/embedding/start)
Free plans support guest embedding without SSO.

**95. Pro/Enterprise Authenticated Modular Embedding**
Source: [Embedding Start](https://www.metabase.com/docs/latest/embedding/start)
SSO-backed interactive modular embedding, advanced theming, row/column security, subscriptions, alerts require Pro or Enterprise.

**96. Static Embedding Secret Key Regeneration**
Source: [Static Embedding](https://www.metabase.com/docs/latest/embedding/static-embedding)
Regenerate the secret key to instantly invalidate all previously issued tokens.

**97. Publish/Unpublish Individual Static Embeds**
Source: [Static Embedding](https://www.metabase.com/docs/latest/embedding/static-embedding)
Enable or disable static embedding for each question or dashboard individually.

---

## Use Cases

**Static Embedding (#1) + Locked Parameters (#27)**
A B2B SaaS company embeds a "My Usage" dashboard. The server signs a JWT locking the `tenant_id` parameter. Each customer sees only their own data without manipulation.

**Static Embedding (#1) + Editable Parameters (#28) + Hidden Filter Parameters (#92)**
A product team pre-fills a date range to "last 30 days" but hides the filter widget. The date range is enforced without exposing the filter UI.

**Static Embedding (#1) + Auto-Refresh (#93)**
A logistics company displays live shipment KPIs on a wall-mounted TV with `#refresh=30`.

**Public Links (#2) + CSV/XLSX/JSON Export (#58, #60)**
A finance team publishes a cost summary as a public link. Recipients download raw data as CSV without a Metabase account.

**Public Links (#2) + Filter Parameters (#91) + Simulated Drill-Through (#55)**
An operations site embeds a public dashboard. Each bar chart navigates to a second public dashboard pre-filtered by region.

**Public Links (#2) + Hidden Filter Parameters (#92)**
A marketing agency builds client-facing reports. Each client gets a unique URL with `client_id` baked in as hidden parameter.

**Full App Embedding (#3) + JWT SSO (#20) + Group-Based Permissions (#31)**
An enterprise internal tools platform embeds the full Metabase app. JWT maps each employee's department to a Metabase group.

**Full App Embedding (#3) + UI Customization (#64)**
A company hides Metabase navigation chrome so users never realize they're using a separate product.

**Full App Embedding (#3) + PostMessage (#65)**
A SPA keeps the browser URL bar in sync with what the embedded Metabase is displaying.

**Full App Embedding (#3) + Frame Sizing (#66)**
A CMS embeds a question on an article page. Fit mode eliminates whitespace and internal scrollbars.

**Full App Embedding (#3) + Dashboard Tab Embedding (#68) + Deep Linking (#69)**
Multi-environment SaaS uses entity IDs for stable "bookmark" links across serialization/restore cycles.

**InteractiveDashboard (#9) + `mapQuestionClickActions` (#48)**
An analytics product adds a custom "Open in CRM" action when users click a customer row.

**InteractiveDashboard (#9) + `dashboardCardMenu` (#50)**
A platform team injects a "Copy link to card" action into every dashboard card's overflow menu.

**InteractiveDashboard (#9) + `handleLink` (#49)**
An embedded analytics SPA intercepts Metabase links and converts them to React Router calls.

**EditableDashboard (#10)**
A no-code analytics platform lets customers create dashboards with `targetCollection` scoped to their private collection.

**InteractiveQuestion (#7) + Custom Child Components**
A design-sensitive product renders only the filter bar, chart, and a custom download button using their own component library.

**StaticQuestion (#6) + Component key Reloading (#75)**
A CRM embeds a question showing open deal count. After a new deal is logged, incrementing `key` forces a refresh.

**Query Builder Embedding (#14) + `isSaveEnabled` (#84) + `targetCollection` (#87)**
A BI tool lets power users build ad hoc reports with saving locked to their personal folder.

**SQL Editor Embedding (#15) + Row/Column Security (#29, #30)**
Technical analysts write SQL inside the embedded editor with column-level security hiding PII.

**AI Chat Component (#12, #13) + `isSaveEnabled` (#84) + `targetCollection` (#87)**
A product analytics platform exposes "Ask your data" in plain English. Users save useful Metabot-generated charts to a shared collection.

**CollectionBrowser (#11) + `visibleEntityTypes` + `onClick`**
A report wizard lets users pick an existing dashboard to clone from an embedded collection browser.

**JWT SSO (#20) + User Attributes + Row-Level Security (#29)**
A multi-tenant SaaS uses JWT `tenant_id` attribute. Metabase filters all embedded dashboards automatically.

**JWT SSO (#20) + Group-Based Permissions (#31) + Column-Level Security (#30)**
Physicians see full data; billing staff see restricted columns. Groups are assigned via JWT payload.

**Static Embedding (#1) + Secret Key Regeneration (#96) + Publish/Unpublish (#97)**
After a leaked token, regenerate the secret key instantly, then selectively re-enable embeds.

**Dashboard Subscriptions (#56)**
Executives subscribe to weekly email snapshots from the embedded dashboard.

**Question Alerts (#57)**
A finance manager sets an alert when "Daily Revenue" drops below a threshold.

**Download Controls (#58, #60) + Raw Export**
A data pipeline dashboard exports raw numeric values without formatting via `?format_rows=false`.

**Appearance Theming (#35-#41) + Banner Removal (#43)**
A white-label product applies custom brand colors, font, dark mode, and removes all Metabase branding.

**Custom Loader (#44) + Custom Error (#45) + Custom No-Data (#46)**
A consumer app renders branded loading animation, custom error card, and branded "no results" illustration.

**Localization (#61) + Translation Dictionaries (#63)**
A global SaaS deploys in German and Korean with custom terminology overrides.

**SDK + Next.js App Router (#5) + JWT SSO (#20)**
A Next.js app uses a Route Handler to generate JWTs. SDK components authenticate via `MetabaseProvider`.

**SDK Version Pinning (#80) + Versioned npm Tags (#78)**
A team pins their Cloud instance and uses `56-stable` npm tag for controlled upgrades.

**`useCreateDashboardApi` (#82) + `CreateDashboardModal` (#83)**
An embedded portal lets customers create dashboards programmatically or via a modal.

**`onDashboardLoad` (#73) / `onDashboardLoadWithoutCards` (#74)**
A product hides a skeleton placeholder and reveals content only after `onDashboardLoad` fires.

**CORS Configuration (#33)**
A company adds `app.company.com` to Metabase's allowed origins for cross-domain embedded components.

**Two-Part SDK Bundle Architecture (#77)**
After a Metabase server update, the SDK client code automatically stays in sync — no npm upgrade needed.

**Public Link Admin Dashboard (#88) + Global Public Sharing Disable (#90)**
During a security audit, an admin reviews all public links and disables public sharing globally with one toggle.
