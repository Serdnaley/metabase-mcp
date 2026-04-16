# Core Features

Metabase's core analytics features: questions, dashboards, collections, visualizations, data studio, documents, and uploads.

## Sources

- [Questions Introduction](https://www.metabase.com/docs/latest/questions/introduction)
- [Query Builder Editor](https://www.metabase.com/docs/latest/questions/query-builder/editor)
- [Writing SQL](https://www.metabase.com/docs/latest/questions/native-editor/writing-sql)
- [SQL Parameters](https://www.metabase.com/docs/latest/questions/native-editor/sql-parameters)
- [SQL Snippets](https://www.metabase.com/docs/latest/questions/native-editor/snippets)
- [Referencing Saved Questions](https://www.metabase.com/docs/latest/questions/native-editor/referencing-saved-questions-in-queries)
- [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
- [Exporting Results](https://www.metabase.com/docs/latest/questions/exporting-results)
- [Alerts](https://www.metabase.com/docs/latest/questions/alerts)
- [Dashboards Introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
- [Dashboard Filters](https://www.metabase.com/docs/latest/dashboards/filters)
- [Linked Filters](https://www.metabase.com/docs/latest/dashboards/linked-filters)
- [Interactive Dashboards](https://www.metabase.com/docs/latest/dashboards/interactive)
- [Dashboard Actions](https://www.metabase.com/docs/latest/dashboards/actions)
- [Dashboard Subscriptions](https://www.metabase.com/docs/latest/dashboards/subscriptions)
- [Collections](https://www.metabase.com/docs/latest/exploration-and-organization/collections)
- [Delete and Restore](https://www.metabase.com/docs/latest/exploration-and-organization/delete-and-restore)
- [Content Verification](https://www.metabase.com/docs/latest/exploration-and-organization/content-verification)
- [Basic Exploration](https://www.metabase.com/docs/latest/exploration-and-organization/exploration)
- [X-Rays](https://www.metabase.com/docs/latest/exploration-and-organization/x-rays)
- [Events and Timelines](https://www.metabase.com/docs/latest/exploration-and-organization/events-and-timelines)
- [History](https://www.metabase.com/docs/latest/exploration-and-organization/history)
- [Keyboard Shortcuts](https://www.metabase.com/docs/latest/exploration-and-organization/keyboard-shortcuts)
- [Data Model Reference](https://www.metabase.com/docs/latest/exploration-and-organization/data-model-reference)
- [Uploads](https://www.metabase.com/docs/latest/exploration-and-organization/uploads)
- [Data Studio Overview](https://www.metabase.com/docs/latest/data-studio/overview)
- [Data Structure](https://www.metabase.com/docs/latest/data-studio/data-structure)
- [Library](https://www.metabase.com/docs/latest/data-studio/library)
- [Dependency Graph](https://www.metabase.com/docs/latest/data-studio/dependency-graph)
- [Dependency Diagnostics](https://www.metabase.com/docs/latest/data-studio/dependency-diagnostics)
- [Transforms Overview](https://www.metabase.com/docs/latest/data-studio/transforms/transforms-overview)
- [Query Transforms](https://www.metabase.com/docs/latest/data-studio/transforms/query-transforms)
- [Python Transforms](https://www.metabase.com/docs/latest/data-studio/transforms/python-transforms)
- [Transform Jobs and Runs](https://www.metabase.com/docs/latest/data-studio/transforms/jobs-and-runs)
- [Documents Introduction](https://www.metabase.com/docs/latest/documents/introduction)
- [Documents Start](https://www.metabase.com/docs/latest/documents/start)
- [Models](https://www.metabase.com/docs/latest/data-modeling/models)
- [Model Persistence](https://www.metabase.com/docs/latest/data-modeling/model-persistence)
- [Metrics](https://www.metabase.com/docs/latest/data-modeling/metrics)

---

## Features

### Questions — Query Building

**1. Graphical Query Builder (No-SQL Editor)**
Source: [Query Builder Editor](https://www.metabase.com/docs/latest/questions/query-builder/editor)
A visual, step-by-step interface for constructing queries without writing SQL. Users pick a data source, add filters, join tables, create custom columns, apply aggregations, and sort — all through a guided point-and-click UI.

**2. Data Source Selection**
Source: [Query Builder Editor](https://www.metabase.com/docs/latest/questions/query-builder/editor)
Within the query builder, users can choose from raw database tables, saved models, pre-defined metrics, or previously saved questions as the starting point of a query. Supports browsing by database, schema, or collection.

**3. Table Joins**
Source: [Query Builder Editor](https://www.metabase.com/docs/latest/questions/query-builder/editor)
The query builder allows joining multiple tables from the same database using an interactive join interface, specifying join type and matching columns without writing SQL.

**4. Custom Columns**
Source: [Query Builder Editor](https://www.metabase.com/docs/latest/questions/query-builder/editor)
Users can create derived fields using math operators (+, -, *, /) and spreadsheet-like functions (e.g., `Average(sqrt[FieldX]) + Sum([FieldY])`). Results become usable as dimensions or metrics in the same query.

**5. Filtering (Query Builder)**
Source: [Query Builder Editor](https://www.metabase.com/docs/latest/questions/query-builder/editor)
Restricts retrieved rows using conditional logic. Filters can be applied at data retrieval time and can reference any column or custom column in the dataset.

**6. Summarization and Aggregation**
Source: [Query Builder Editor](https://www.metabase.com/docs/latest/questions/query-builder/editor)
Compute aggregations (count, sum, average, cumulative sum, etc.) grouped by any dimension. Cumulative functions are order-dependent. Multiple metrics can be calculated simultaneously.

**7. Sorting and Row Limiting**
Source: [Query Builder Editor](https://www.metabase.com/docs/latest/questions/query-builder/editor)
Order query results by one or more columns (ascending/descending). Cap result sets — up to 2,000 rows for unaggregated queries and 10,000 for aggregated queries in the UI display.

**8. Step-by-Step Data Preview**
Source: [Query Builder Editor](https://www.metabase.com/docs/latest/questions/query-builder/editor)
A preview button shows the first 10 rows of data at each query-building step, letting users verify transformations incrementally before finalizing.

**9. Column Visibility Toggle**
Source: [Query Builder Editor](https://www.metabase.com/docs/latest/questions/query-builder/editor)
Hide or show columns in query results. Note: hiding columns does not restrict data access for security purposes — it is a display-only control.

**10. Native SQL / SQL Query Editor**
Source: [Writing SQL](https://www.metabase.com/docs/latest/questions/native-editor/writing-sql)
A full SQL editor for writing raw queries against any connected database. Supports query execution with Ctrl/Cmd+Enter, partial query execution (run highlighted selection), and multi-database querying.

**11. SQL Auto-Formatting**
Source: [Writing SQL](https://www.metabase.com/docs/latest/questions/native-editor/writing-sql)
Automatically formats SQL syntax for readability via a document icon in the editor toolbar.

**12. SQL Parameterized Queries (Variables and Filter Widgets)**
Source: [SQL Parameters](https://www.metabase.com/docs/latest/questions/native-editor/sql-parameters)
Embed variables into SQL using `{{variable_name}}` syntax. Variables generate interactive filter widgets on the question or dashboard. Four types: Field Filter, Basic (text/number/date), Time Grouping, and Table Variables.

**13. Field Filter Variables**
Source: [SQL Parameters](https://www.metabase.com/docs/latest/questions/native-editor/sql-parameters)
The most powerful SQL variable type — connects a SQL template parameter to an actual database column, enabling intelligent filter widgets (date pickers, dropdowns, search boxes) that understand semantic types.

**14. Optional SQL Blocks**
Source: [SQL Parameters](https://www.metabase.com/docs/latest/questions/native-editor/sql-parameters)
Wrap SQL fragments in `[[...]]` to make them conditionally included only when a parameter value is provided, enabling queries that work with or without filter inputs.

**15. SQL Snippets**
Source: [SQL Snippets](https://www.metabase.com/docs/latest/questions/native-editor/snippets)
Reusable blocks of SQL or native query code that any native editor user can create and reference organization-wide using `{{snippet: snippet_name}}` syntax. Can include their own parameters and table variables.

**16. SQL Snippet Folder Permissions**
Source: [SQL Snippets](https://www.metabase.com/docs/latest/questions/native-editor/snippets)
Snippets can be organized into folders. Access to snippet folders can be permission-controlled, allowing teams to maintain private or shared snippet libraries.

**17. Model and Saved Question References in SQL**
Source: [Referencing Saved Questions](https://www.metabase.com/docs/latest/questions/native-editor/referencing-saved-questions-in-queries)
Reference any saved model or question in SQL using `{{#ID-name}}` notation. The referenced entity is substituted as a subquery (wrapped in parentheses) or used as a CTE in a WITH clause.

**18. Metabot AI Query Generation**
Source: [Questions Introduction](https://www.metabase.com/docs/latest/questions/introduction)
A natural language interface that generates SQL or graphical queries from plain-English descriptions. Accessible within both the SQL editor and query builder.

**19. "Explore Results" (SQL-to-Query-Builder)**
Source: [Writing SQL](https://www.metabase.com/docs/latest/questions/native-editor/writing-sql)
After running a SQL query, users can click "Explore Results" to open the result set in the graphical query builder for further no-SQL analysis and visualization.

**20. Console / SQL View of Query Builder Questions**
Source: [Query Builder Editor](https://www.metabase.com/docs/latest/questions/query-builder/editor)
View the underlying SQL or API query that the graphical query builder generates, via the Console icon. Useful for debugging and learning query construction.

**21. Drill-Through (Interactive Chart Exploration)**
Source: [Basic Exploration](https://www.metabase.com/docs/latest/exploration-and-organization/exploration)
Clicking on a data point in a chart or table opens a context menu with options to filter, break out by another dimension, see underlying records, access automatic insights, or compare to the rest of the data.

**22. Breaking Change Detection**
Source: [Questions Introduction](https://www.metabase.com/docs/latest/questions/introduction)
On Pro/Enterprise plans, Metabase can detect when editing a question, model, or metric would break downstream dependent entities, warning users before they save destructive changes.

### Visualizations

**23. Automatic Chart Type Selection**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
The query builder automatically selects the most appropriate chart type based on the shape and type of query results, with the option to override.

**24. Bar Charts**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Display numerical values grouped by categories. Supports stacking, grouping, and multiple series.

**25. Line Charts**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Visualize trends over time. Supports multiple series, goal lines, and trend lines.

**26. Area Charts**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Compare proportions of metrics over time with filled areas. Supports stacking.

**27. Combo Charts**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Combine bars with lines or areas in a single visualization, useful for comparing metrics with different scales.

**28. Pie, Donut, and Sunburst Charts**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Break down a metric by a single (pie/donut) or multiple (sunburst) categorical dimensions.

**29. Row Charts**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Horizontal bar charts suited for categorical data with many possible values, where labels need more space.

**30. Scatterplots and Bubble Charts**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Visualize correlations between two or three variables. Bubble size can encode a third numeric dimension.

**31. Maps**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Automatically selected when geographic data is present. Supports pin maps, region (choropleth) maps, and grid maps depending on data type.

**32. Tables**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Tabular display of raw or aggregated data. Supports conditional formatting, column reordering, clickable links, and sorting.

**33. Pivot Tables**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Reorganize aggregated data with rows and columns that can be swapped. Supports grouping and subtotals. Available only for query builder questions, not native SQL.

**34. Number Display**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Present a single KPI number prominently. Supports trend arrows, goal values, and color-coded conditional formatting.

**35. Trend Charts**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Show change between exactly two time periods, with directional indicators and percentage change.

**36. Progress Bars**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Compare a value against a goal value. Usable as dashboard KPI widgets and as alert targets.

**37. Gauge Charts**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Display a single number within a colored range context (e.g., green/yellow/red zones), conveying performance level at a glance.

**38. Funnel Charts**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Visualize multi-step conversion or progression, showing drop-off between stages.

**39. Waterfall Charts**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Show cumulative effects of sequential positive and negative values.

**40. Box Plots**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Display statistical distributions: median, quartiles, and outliers for a dataset.

**41. Sankey Charts**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Visualize multi-dimensional data flow or the distribution of values from one set of categories to another.

**42. Histograms**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Bin continuous numeric data into ranges and display frequency distributions.

**43. Detail View**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
A single-record display showing all fields in a two-column format. Used when drilling into a specific row.

**44. Conditional Formatting (Tables)**
Source: [Visualizing Results](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results)
Apply cell background colors or text colors to table cells based on value ranges or conditions, making patterns immediately visible.

**45. Visualization Settings Per Card**
Source: [Dashboards Introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
Each dashboard card can have independent visualization settings (colors, axis labels, number formatting, etc.) that override the original question's settings without modifying the source question.

### Questions — Management and Organization

**46. Saving Questions to Collections or Dashboards**
Source: [Questions Introduction](https://www.metabase.com/docs/latest/questions/introduction)
Saved questions are stored in collections for organization and reuse. Questions can also be saved directly into dashboards during creation.

**47. Question Bookmarks**
Source: [Basic Exploration](https://www.metabase.com/docs/latest/exploration-and-organization/exploration)
Users can bookmark frequently used questions, dashboards, models, and collections. Bookmarks appear in the left sidebar for quick access and can be drag-and-drop reordered. Bookmarked items receive a boost in search results.

**48. Question Version History**
Source: [History](https://www.metabase.com/docs/latest/exploration-and-organization/history)
Metabase tracks the 15 most recent versions of questions, dashboards, models, metrics, transforms, segments, and measures. Users can revert to any prior version.

**49. Question Descriptions (Markdown)**
Source: [Questions Introduction](https://www.metabase.com/docs/latest/questions/introduction)
Questions can have Markdown-formatted descriptions attached, providing context about the purpose, data source, caveats, or methodology to other users.

**50. Content Verification (Pro/Enterprise)**
Source: [Content Verification](https://www.metabase.com/docs/latest/exploration-and-organization/content-verification)
Admins can mark questions, models, metrics, and dashboards with a blue checkmark as "verified," indicating data quality and accuracy. Verified items surface more prominently in search. Modifications to the underlying query automatically remove verification (except for dashboards, which retain verification through edits).

**51. Caching Policies (Pro/Enterprise)**
Source: [Questions Introduction](https://www.metabase.com/docs/latest/questions/introduction)
Configure result caching at the question level, database level, or dashboard level to reduce database load and speed up repeated queries. Cache durations are configurable.

**52. Exporting / Downloading Results**
Source: [Exporting Results](https://www.metabase.com/docs/latest/questions/exporting-results)
Export query results as CSV, XLSX, JSON, or PNG (for charts). Supports "formatted" (with Metabase display formatting applied) and "unformatted" (raw data) exports. Row limit defaults to 1,048,575 but is configurable.

**53. Public Links for Questions**
Source: [Exporting Results](https://www.metabase.com/docs/latest/questions/exporting-results)
Generate shareable public URLs for questions that allow anyone with the link to view results without a Metabase login. Public links can be format-specific (e.g., CSV download link).

**54. Alerts**
Source: [Alerts](https://www.metabase.com/docs/latest/questions/alerts)
Set up automated notifications triggered by question results. Three types: (a) Results Alerts — fire when a question returns any results; (b) Goal Line Alerts — fire when a time-series crosses a threshold; (c) Progress Bar Alerts — fire when a progress bar value reaches or drops below a goal. Delivered via email, Slack, or webhooks.

**55. Alert Scheduling**
Source: [Alerts](https://www.metabase.com/docs/latest/questions/alerts)
Alerts can be checked on minute, hourly, daily, weekly, or monthly intervals. Custom schedules use Quartz cron syntax. Alerts can be one-time (disposable) or recurring.

### Dashboards

**56. Dashboard Grid Layout**
Source: [Dashboards Introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
Dashboards arrange cards (questions, text, iframes, links) on a configurable grid. Cards can be resized, repositioned, duplicated, and replaced.

**57. Dashboard Tabs**
Source: [Dashboards Introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
Multiple tabs can be added to a single dashboard to segment content thematically, keeping related cards together while reducing scroll. Tabs can be duplicated with all their cards.

**58. Card Types on Dashboards**
Source: [Dashboards Introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
Dashboards support five card types: (a) Question cards (charts/tables from saved questions); (b) Text/Markdown cards; (c) Heading cards; (d) Iframe cards (embed external content like videos, surveys, spreadsheets); (e) Link cards (internal Metabase items or external URLs).

**59. Dashboard Sections (Layout Templates)**
Source: [Dashboards Introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
Pre-arranged section templates (e.g., KPI Grid, large chart layouts) that can be added to dashboards to quickly scaffold standard reporting layouts.

**60. Dashboard Filter Widgets**
Source: [Dashboard Filters](https://www.metabase.com/docs/latest/dashboards/filters)
Add filter widgets to dashboards that apply query parameters across multiple cards simultaneously. Filter types: Date Picker, Location, ID, Number, Text/Category, Boolean, and Time Grouping Parameter.

**61. Filter Placement Levels**
Source: [Dashboard Filters](https://www.metabase.com/docs/latest/dashboards/filters)
Filters can be scoped at three levels: dashboard-wide (all tabs), header-level (current tab only), or card-level (individual card only).

**62. Filter Configuration Options**
Source: [Dashboard Filters](https://www.metabase.com/docs/latest/dashboards/filters)
Filters support renaming, type changes, operator modification, input display type (dropdown, search box, input box), multi-select, custom selectable values, required marking, default values, and auto-connect to relevant cards.

**63. Auto-Apply Filters Toggle**
Source: [Dashboard Filters](https://www.metabase.com/docs/latest/dashboards/filters)
When enabled, dashboard filters apply automatically as values change. When disabled, a manual "Apply" button appears, allowing users to set multiple filters before triggering re-query.

**64. Linked Filters**
Source: [Linked Filters](https://www.metabase.com/docs/latest/dashboards/linked-filters)
Configure parent-child relationships between dashboard filters so that selecting a value in the parent filter (e.g., a State) restricts the available options in the child filter (e.g., City). Requires explicit foreign key or table relationships in the underlying data.

**65. Dashboard Interactivity / Click Behavior Customization**
Source: [Interactive Dashboards](https://www.metabase.com/docs/latest/dashboards/interactive)
Configure what happens when a user clicks on a chart element. Options: open the drill-through menu, navigate to a custom destination (another dashboard, question, or external URL), or update dashboard filters (cross-filtering).

**66. Cross-Filtering**
Source: [Interactive Dashboards](https://www.metabase.com/docs/latest/dashboards/interactive)
Clicking a chart element can pass its value to a dashboard filter, which then updates all connected cards on the dashboard — creating interactive, self-filtering dashboards without writing code.

**67. Dynamic URL Construction**
Source: [Interactive Dashboards](https://www.metabase.com/docs/latest/dashboards/interactive)
Create click behaviors that construct dynamic destination URLs using template variables like `{{ColumnName}}`, incorporating clicked values into links to external systems (e.g., CRMs, ticketing tools).

**68. Dashboard Auto-Refresh**
Source: [Dashboards Introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
Set dashboards to auto-refresh at intervals of 1, 5, 10, 15, 30, or 60 minutes. Can be configured via the UI or URL parameters (e.g., `#refresh=60`).

**69. Fullscreen / TV Mode**
Source: [Dashboards Introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
Dashboards can be displayed in fullscreen mode, typically combined with auto-refresh for TV/monitor display in offices. Configurable via URL parameters.

**70. Dashboard Version History**
Source: [History](https://www.metabase.com/docs/latest/exploration-and-organization/history)
Dashboards retain up to 15 previous versions. Any saved change, move, revert, trash action, or verification event is tracked. Users can revert to any prior version.

**71. Dashboard Duplication**
Source: [Dashboards Introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
Duplicate a dashboard to copy its layout, cards, and filters. Subscriptions and actions are not copied.

**72. Dashboard Width Settings**
Source: [Dashboards Introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
Choose between fixed-width (constrained to a center column) and full-width (expands to fill the screen) layout modes.

**73. Card Hiding When No Results**
Source: [Dashboards Introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
Configure individual dashboard cards to be hidden when their query returns no data, keeping dashboards clean when data conditions are not met.

**74. Dashboard Actions (Write-Back Buttons)**
Source: [Dashboard Actions](https://www.metabase.com/docs/latest/dashboards/actions)
Add action buttons to dashboards that allow users to create or update records in a database (via model-defined actions). Buttons can be pre-filled using dashboard filter values. Not available on public dashboards.

**75. Dashboard Subscriptions**
Source: [Dashboard Subscriptions](https://www.metabase.com/docs/latest/dashboards/subscriptions)
Schedule automated delivery of dashboard results via email or Slack. Emails can include screenshots and/or data attachments (CSV/XLSX). Slack delivery sends to channels or individual users.

**76. Subscription Filter Customization (Pro/Enterprise)**
Source: [Dashboard Subscriptions](https://www.metabase.com/docs/latest/dashboards/subscriptions)
Each subscription can apply different filter values before delivery. This allows a single dashboard to generate multiple subscription variants (e.g., per-region reports) from one template.

**77. Conditional Subscription Delivery**
Source: [Dashboard Subscriptions](https://www.metabase.com/docs/latest/dashboards/subscriptions)
Subscriptions can be configured to skip delivery when the dashboard returns no results, preventing empty email/Slack messages.

**78. PDF Export of Dashboards**
Source: [Dashboards Introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
Export the currently visible dashboard view as a PDF file, capturing all visible cards as screenshots.

**79. Dashboard Public Links**
Source: [Dashboards Introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
Generate a shareable public URL for a dashboard, allowing anyone with the link to view it without logging into Metabase.

### Collections and Organization

**80. Collections (Folder System)**
Source: [Collections](https://www.metabase.com/docs/latest/exploration-and-organization/collections)
Hierarchical folder-like containers for organizing questions, dashboards, models, metrics, and documents. Items exist in exactly one collection. Collections can be nested.

**81. Collection Access Levels**
Source: [Collections](https://www.metabase.com/docs/latest/exploration-and-organization/collections)
Three permission tiers: No Access (hidden), View (read-only), and Curate (full edit, move, pin, delete). Permissions are set at the group level and cascade through collection hierarchies.

**82. Official Collections (Pro/Enterprise)**
Source: [Collections](https://www.metabase.com/docs/latest/exploration-and-organization/collections)
Mark a collection as "Official" with a yellow badge. Items inside receive prominence in search results and suggestions, signaling to users that the content is authoritative and curated.

**83. Item Pinning**
Source: [Collections](https://www.metabase.com/docs/latest/exploration-and-organization/collections)
Pin important items (dashboards, models, questions) to the top of a collection so they appear prominently when users browse that collection.

**84. Bulk Item Operations**
Source: [Collections](https://www.metabase.com/docs/latest/exploration-and-organization/collections)
Select multiple items in a collection to move, trash, or restore them simultaneously. Can bulk-move questions into their respective dashboards.

**85. Personal Collections**
Source: [Collections](https://www.metabase.com/docs/latest/exploration-and-organization/collections)
Each Metabase user has a private personal collection, visible only to them and administrators. Used as a sandbox for work-in-progress or experimental analysis.

**86. Collection Cleanup (Pro/Enterprise)**
Source: [Collections](https://www.metabase.com/docs/latest/exploration-and-organization/collections)
Automatically identify and send unused or stale items in a collection to Trash based on configurable time thresholds (from 1 month to 2+ years of inactivity).

**87. Trash and Restore**
Source: [Delete and Restore](https://www.metabase.com/docs/latest/exploration-and-organization/delete-and-restore)
Deleted items go to Trash and do not appear in search. Items can be restored to their original collection or a different collection. Permanent deletion is irreversible. Collections cannot be permanently deleted.

**88. Trash Search and Sorting**
Source: [Delete and Restore](https://www.metabase.com/docs/latest/exploration-and-organization/delete-and-restore)
Advanced search can filter for items in Trash. Trash contents can be sorted by item type, deletion timestamp, or the user who deleted the item.

**89. Bulk Restore**
Source: [Delete and Restore](https://www.metabase.com/docs/latest/exploration-and-organization/delete-and-restore)
Select multiple trashed items and restore them simultaneously in a single operation.

### Data Modeling (Summary)

**90. Models**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
A special category of saved question that serves as a reusable, curated data layer. Models appear higher in search results, can have column-level metadata (descriptions, renamed columns, semantic types), and act as starting points for further analysis.

**91. Model Column Metadata**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
For each column in a model, users can set a display name, description, semantic type, visibility, and display format.

**92. Model Persistence (Pro/Enterprise)**
Source: [Model Persistence](https://www.metabase.com/docs/latest/data-modeling/model-persistence)
Persist model results as a materialized table in the connected data warehouse. Refresh frequency is configurable at instance, database, or individual model level.

**93. Model Persistence Audit Logs**
Source: [Model Persistence](https://www.metabase.com/docs/latest/data-modeling/model-persistence)
Admins can view model caching logs in Admin > Tools to monitor refresh timing, success, and failures.

**94. Model Entity Key Configuration**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Configure a string field as an entity key so that individual records matching that field surface in Metabase's global search results.

**95. Convert Question to Model**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Any saved question can be promoted to a model via the three-dot menu.

**96. Metrics**
Source: [Metrics](https://www.metabase.com/docs/latest/data-modeling/metrics)
Define official, reusable aggregation calculations (e.g., "Monthly Recurring Revenue") that standardize how key business numbers are computed. Metrics can be built on top of models, tables, or other metrics.

**97. Metric Default Time Dimension**
Source: [Metrics](https://www.metabase.com/docs/latest/data-modeling/metrics)
A metric can have a default time dimension specified for display purposes, without restricting users from grouping by other time granularities.

**98. Segments (Saved Filters)**
Source: [Data Structure](https://www.metabase.com/docs/latest/data-studio/data-structure)
Define official, reusable filter conditions (e.g., "Active Customers", "High-Value Orders") that create named subsets of a table.

**99. Measures (Saved Aggregations)**
Source: [Data Structure](https://www.metabase.com/docs/latest/data-studio/data-structure)
Define official aggregations on a specific table. Support complex expressions and can be used alongside breakouts in the query builder.

### Data Studio

**100. Library (Pro/Enterprise)**
Source: [Library](https://www.metabase.com/docs/latest/data-studio/library)
A curated, centrally managed section of Metabase that acts as the single source of truth for analytics. Contains published tables, official metrics, and SQL snippets.

**101. Data Structure**
Source: [Data Structure](https://www.metabase.com/docs/latest/data-studio/data-structure)
A Data Studio interface for browsing all tables across all connected databases. Supports viewing table ownership, row counts, publication status, and field-level metadata.

**102. Table Publishing to Library**
Source: [Library](https://www.metabase.com/docs/latest/data-studio/library)
Explicitly publish a table to the Library, making it appear first in query builder data selections.

**103. Table Visibility Tiers (Hidden / Internal / Final)**
Source: [Data Structure](https://www.metabase.com/docs/latest/data-studio/data-structure)
Control whether a table appears in the query builder: Hidden (not accessible), Internal (admins/data analysts only), or Final (all permitted users).

**104. Table Ownership Assignment**
Source: [Data Structure](https://www.metabase.com/docs/latest/data-studio/data-structure)
Assign a Metabase user or email address as the responsible owner for a table.

**105. Table Entity Type Categorization**
Source: [Data Structure](https://www.metabase.com/docs/latest/data-studio/data-structure)
Tag tables with entity types (e.g., "Transaction", "Event", "User") to provide semantic context.

**106. Field Metadata Editing**
Source: [Data Structure](https://www.metabase.com/docs/latest/data-studio/data-structure)
Edit field-level metadata including descriptions, display names, data types, visibility settings, and format options.

**107. Manual Schema Sync**
Source: [Data Structure](https://www.metabase.com/docs/latest/data-studio/data-structure)
Trigger an immediate re-sync of a table's schema to pick up newly added or removed columns.

**108. Field Value Re-Scanning**
Source: [Data Structure](https://www.metabase.com/docs/latest/data-studio/data-structure)
Trigger a rescan or discard of cached field values used to populate filter dropdowns.

**109. Glossary**
Source: [Data Studio Overview](https://www.metabase.com/docs/latest/data-studio/overview)
Define business terms and their meanings in plain language for both human users and AI agents (Metabot).

**110. Dependency Graph (Pro/Enterprise)**
Source: [Dependency Graph](https://www.metabase.com/docs/latest/data-studio/dependency-graph)
A visual map showing how all Metabase content is interconnected — tables, questions, models, snippets, transforms, metrics, dashboards, and documents.

**111. Dependency Diagnostics (Pro/Enterprise)**
Source: [Dependency Diagnostics](https://www.metabase.com/docs/latest/data-studio/dependency-diagnostics)
Automatically identifies broken dependencies and unreferenced entities that are candidates for cleanup.

**112. Transforms (Query-Based)**
Source: [Transforms Overview](https://www.metabase.com/docs/latest/data-studio/transforms/transforms-overview)
Write SQL or use the graphical query builder to create scheduled data transformation jobs that write results back to the database as persistent tables.

**113. Incremental Transforms**
Source: [Query Transforms](https://www.metabase.com/docs/latest/data-studio/transforms/query-transforms)
A transform mode that appends only new rows since the last run, using a checkpoint column.

**114. Python Transforms**
Source: [Python Transforms](https://www.metabase.com/docs/latest/data-studio/transforms/python-transforms)
Write Python scripts using pandas DataFrames to transform data and write results back as a new database table.

**115. Transform Tagging and Scheduling (Jobs)**
Source: [Transform Jobs and Runs](https://www.metabase.com/docs/latest/data-studio/transforms/jobs-and-runs)
Assign tags to transforms and create Jobs that run all transforms with specified tags on a defined schedule.

**116. Transform Run History**
Source: [Transform Jobs and Runs](https://www.metabase.com/docs/latest/data-studio/transforms/jobs-and-runs)
View a log of all past and current transform executions with timestamps, run status, error messages, and Python console output.

**117. Transform Dependencies (Pro/Enterprise)**
Source: [Transform Jobs and Runs](https://www.metabase.com/docs/latest/data-studio/transforms/jobs-and-runs)
Transforms can reference other transforms as dependencies. Metabase automatically runs dependency transforms first.

**118. Remote Sync / Git Version Control (Pro/Enterprise)**
Source: [Data Studio Overview](https://www.metabase.com/docs/latest/data-studio/overview)
Sync Library content (and transforms) with a Git repository for version-controlled change history.

### Data Reference

**119. Data Reference Browser**
Source: [Data Model Reference](https://www.metabase.com/docs/latest/exploration-and-organization/data-model-reference)
A built-in documentation layer accessible from the left sidebar or the SQL editor. Displays databases, schemas, tables, fields, sample values, and related questions.

**120. Data Reference in SQL Editor**
Source: [Data Model Reference](https://www.metabase.com/docs/latest/exploration-and-organization/data-model-reference)
A quick-access panel within the SQL editor for looking up column and table names, descriptions, and foreign key relationships while writing queries.

**121. Foreign Key Relationship Visualization**
Source: [Data Model Reference](https://www.metabase.com/docs/latest/exploration-and-organization/data-model-reference)
The data reference displays which fields connect to other tables via foreign keys.

### Exploration Features

**122. Home Page with Pinned Content**
Source: [Basic Exploration](https://www.metabase.com/docs/latest/exploration-and-organization/exploration)
The Metabase home page shows recently viewed and pinned dashboards and questions from curated collections.

**123. Command Palette**
Source: [Basic Exploration](https://www.metabase.com/docs/latest/exploration-and-organization/exploration)
A global search and navigation tool (Cmd/Ctrl+K) for creating new items, finding saved content, and jumping to admin or account settings.

**124. Advanced Search**
Source: [Basic Exploration](https://www.metabase.com/docs/latest/exploration-and-organization/exploration)
Full-featured search with filters for content type, creator, last editor, creation date, last edit date, verification status, native query contents, and trash items.

**125. Database Browser**
Source: [Basic Exploration](https://www.metabase.com/docs/latest/exploration-and-organization/exploration)
Browse connected databases, tables, models, and metrics from the left sidebar.

**126. X-Rays**
Source: [X-Rays](https://www.metabase.com/docs/latest/exploration-and-organization/x-rays)
Automatic insight generation that analyzes a table, model, or data point and produces a set of summary charts. Results can be saved as a dashboard.

**127. "Compare to the Rest" Insights**
Source: [X-Rays](https://www.metabase.com/docs/latest/exploration-and-organization/x-rays)
When drilling into a data point, users can compare the selected segment against the full dataset, generating automatic comparative charts.

**128. Events and Timelines**
Source: [Events and Timelines](https://www.metabase.com/docs/latest/exploration-and-organization/events-and-timelines)
Annotate time-series charts with dated events (e.g., product launches, marketing campaigns, outages). Events appear as vertical markers on charts.

**129. Bookmarks**
Source: [Basic Exploration](https://www.metabase.com/docs/latest/exploration-and-organization/exploration)
Personal shortcuts in the left sidebar for frequently visited items. Bookmarked items receive a boost in search results.

**130. Keyboard Shortcuts**
Source: [Keyboard Shortcuts](https://www.metabase.com/docs/latest/exploration-and-organization/keyboard-shortcuts)
A comprehensive keyboard shortcut system for creating items, navigating, and performing dashboard/question actions.

**131. History and Version Revert**
Source: [History](https://www.metabase.com/docs/latest/exploration-and-organization/history)
Track and revert to any of the 15 most recent saved versions of questions, dashboards, models, metrics, transforms, segments, and measures.

### Documents

**132. Documents**
Source: [Documents Introduction](https://www.metabase.com/docs/latest/documents/introduction)
Long-form or short-form analytical narrative documents that combine Markdown-formatted text with embedded charts and data from questions and models.

**133. Command Menu in Documents**
Source: [Documents Introduction](https://www.metabase.com/docs/latest/documents/introduction)
Type `/` inside a document to access a command menu for inserting headings, blockquotes, code blocks, images, charts, and other elements.

**134. Embedding Charts in Documents**
Source: [Documents Introduction](https://www.metabase.com/docs/latest/documents/introduction)
Insert questions and models from collections directly into documents. Embedded charts create independent copies.

**135. Side-by-Side Layout in Documents**
Source: [Documents Introduction](https://www.metabase.com/docs/latest/documents/introduction)
Arrange up to three charts or text blocks side-by-side in a horizontal layout group within a document.

**136. Document Comments and Reactions**
Source: [Documents Introduction](https://www.metabase.com/docs/latest/documents/introduction)
Collaborators can leave comments on text sections and charts, react with emojis, mention users with `@syntax`, link to specific comments, and resolve comment threads.

**137. Document Public Links**
Source: [Documents Introduction](https://www.metabase.com/docs/latest/documents/introduction)
Admins can generate public links for documents, enabling sharing with people outside Metabase.

**138. Document Print**
Source: [Documents Introduction](https://www.metabase.com/docs/latest/documents/introduction)
Print a document via the three-dot menu, producing a formatted printable version.

### Uploads

**139. CSV Upload**
Source: [Uploads](https://www.metabase.com/docs/latest/exploration-and-organization/uploads)
Upload CSV files (up to 50 MB) directly through a collection page. Metabase creates a queryable model from the uploaded data.

**140. CSV Append, Replace, and Update**
Source: [Uploads](https://www.metabase.com/docs/latest/exploration-and-organization/uploads)
After initial upload, subsequent CSV files can be appended (adds new rows) or used to replace the existing model's data entirely.

### Embedding and Sharing (Summary)

**141. Public Embedding (iframes)**
Source: [Questions Introduction](https://www.metabase.com/docs/latest/questions/introduction)
Embed individual questions, dashboards, or documents in any external website via iframe.

**142. White-Label Embedding (Pro/Enterprise)**
Source: [Questions Introduction](https://www.metabase.com/docs/latest/questions/introduction)
Remove the "Made with Metabase" branding from exports and embedded views.

**143. Embedded Analytics SDK**
Source: [Questions Introduction](https://www.metabase.com/docs/latest/questions/introduction)
A JavaScript SDK for embedding Metabase components directly into a React application.

### Permissions and Governance (Summary)

**144. Collection Permissions**
Source: [Collections](https://www.metabase.com/docs/latest/exploration-and-organization/collections)
Group-based access control for collections with three levels: No Access, View, and Curate.

**145. Notification Permissions**
Source: [Alerts](https://www.metabase.com/docs/latest/questions/alerts)
Control which users can set up alerts and subscriptions. Admins can view and manage all alerts and subscriptions.

**146. Download Results Permissions**
Source: [Exporting Results](https://www.metabase.com/docs/latest/questions/exporting-results)
A separate permission layer controlling whether users or groups can export/download query results.

**147. Row and Column Security (Pro/Enterprise)**
Source: [Questions Introduction](https://www.metabase.com/docs/latest/questions/introduction)
Data-level permissions that filter rows or hide columns based on user attributes.

**148. Usage Analytics**
Source: [Data Studio Overview](https://www.metabase.com/docs/latest/data-studio/overview)
A built-in analytics dashboard showing how Metabase itself is being used.

---

## Use Cases

**Graphical Query Builder (#1) + Summarization (#6) + Visualizations (#23-#44)**
A marketing analyst wants to see total orders per product category by month without knowing SQL. They open the query builder, select the Orders table, add a filter for the current year, summarize by Count grouped by Category and Month, and get an automatic bar chart.

**Custom Columns (#4) + Summarization (#6)**
A sales analyst needs to calculate "Revenue per Deal" as a derived metric. They add a custom column dividing the revenue field by the deal count field, then summarize the average of that custom column by sales rep.

**Table Joins (#3)**
An analyst needs to combine customer demographic information with their purchase history. They use the query builder join interface to link two tables on customer ID and then filter and aggregate the combined dataset.

**Native SQL Editor (#10) + SQL Parameterized Queries (#12) + Field Filter Variables (#13)**
A data engineer writes a complex SQL query with a date range variable and a customer segment variable. Both parameters become interactive filter widgets on the resulting chart — making the query reusable by non-SQL users.

**SQL Snippets (#15)**
A data team has a standard "active customers" filter condition used in 30+ SQL queries. They save it as a snippet. When the business definition changes, they update the snippet once and all queries referencing it automatically use the new logic.

**Model and Saved Question References in SQL (#17)**
An analyst wants to build on top of a carefully constructed "Cohort Analysis" model without duplicating its logic. They reference the model in a new SQL query using `{{#42-cohort-analysis}}` and add further transformations as a CTE.

**Metabot AI Query Generation (#18)**
A business user types "show me monthly revenue by region for the last 12 months" into Metabot. Metabot generates the appropriate query, which the user can review, modify, and save.

**"Explore Results" (#19)**
A data analyst writes a complex SQL join query to produce a clean dataset. They then use "Explore Results" to hand the result off to the query builder, where a colleague can independently slice and dice the data.

**Step-by-Step Data Preview (#8)**
A new analyst building a multi-step query uses the preview button at each step to verify that their filter is actually reducing rows as expected and that their join hasn't created unexpected duplicates.

**Breaking Change Detection (#22)**
A data engineer renames a column in a widely used model. Before saving, Metabase warns them that 15 downstream questions and 3 dashboards reference the old column name.

**Pivot Tables (#33)**
A finance analyst needs a classic cross-tab showing revenue by product line (rows) and quarter (columns) with subtotals. They build an aggregated query and switch to the pivot table visualization.

**Combo Charts (#27)**
A product manager wants to see daily active users (bar) alongside the 7-day rolling average (line) on the same chart. They use a combo chart to overlay the two metrics with independent y-axis scales.

**Maps (#31)**
A regional sales director wants to see sales volume by U.S. state as a color-coded map. Metabase detects the state column's geographic semantic type and renders a choropleth map.

**Funnel Charts (#38)**
A growth team tracks user progression through onboarding: signed up > activated > invited team > paid. They build a funnel chart showing volume and drop-off percentage at each step.

**Sankey Charts (#41)**
An e-commerce analyst wants to understand which acquisition channels lead to which product categories. They build a Sankey chart showing flow from traffic source to product category, weighted by revenue.

**Number Display (#34) + Trend Charts (#35)**
An executive dashboard shows Monthly Recurring Revenue as a large number card with a trend arrow indicating whether it grew or shrank versus the previous month.

**Conditional Formatting (#44)**
A customer success manager views a table of accounts with health scores. They apply conditional formatting to color-code the score column red/yellow/green based on value thresholds.

**Visualization Settings Per Card (#45)**
The same "Revenue by Month" question appears on three different dashboards. On each dashboard, the card has different axis labels, colors, and title overrides — without creating three separate questions.

**Dashboard Tabs (#57) + Dashboard Sections (#59)**
A company-wide operations dashboard has separate tabs for Finance, Sales, and Support. Each tab uses a KPI Grid section template to display key metrics at the top, followed by detailed charts.

**Dashboard Filter Widgets (#60) + Auto-Apply Filters (#63)**
An executive reviews a sales dashboard filtered by region and date range. With auto-apply off, they set both filters before applying, preventing the dashboard from re-querying after each individual selection.

**Linked Filters (#64)**
A support dashboard has a Country filter and a City filter. When a user selects "France" in the Country filter, the City filter automatically restricts its options to French cities only.

**Cross-Filtering (#66) + Click Behavior (#65)**
A marketing dashboard has a bar chart of campaigns by channel. When a user clicks a channel bar, all other cards on the dashboard automatically filter to show data for only that channel.

**Dynamic URL Construction (#67) + Click Behavior (#65)**
A support dashboard lists customer tickets in a table. Each row's "Customer ID" cell navigates to `https://crm.company.com/customers/{{CustomerID}}`, opening the CRM record directly.

**Dashboard Actions (#74) + Dashboard Filters (#60)**
A customer success dashboard shows churning accounts. An action button labeled "Mark as Renewed" is pre-connected to the dashboard's Account ID filter. Clicking the button updates the account's status in the database.

**Auto-Refresh (#68) + Fullscreen / TV Mode (#69)**
A company reception area runs a TV displaying the real-time operations dashboard on a 5-minute auto-refresh cycle in fullscreen mode.

**Card Hiding When No Results (#73)**
A monitoring dashboard has an "Overdue Tickets" card configured to hide when the query returns zero rows, keeping the dashboard clean.

**Dashboard Duplication (#71)**
A template dashboard is built for a monthly business review. Each month, an analyst duplicates it, updates the date filter default, and presents a clean copy.

**Iframe Cards (#58)**
An analytics dashboard for a sales team embeds a Google Sheets quota tracker via an iframe card alongside Metabase charts.

**Results Alerts (#54) + Slack Integration**
A DevOps team creates a question that queries an error log table. They set up a Results Alert that fires when the query returns any rows, delivering a Slack message to the #incidents channel.

**Goal Line Alerts (#54)**
A growth team tracks daily signups. They set a goal line alert to fire when the 7-day rolling average drops below 100 signups/day.

**Progress Bar Alerts (#54)**
A fundraising organization tracks total donations against an annual goal as a progress bar. They set an alert to fire when 100% of the goal is reached.

**Dashboard Subscriptions (#75) + Subscription Filter Customization (#76)**
A regional sales leader manages 10 regions. They create one dashboard with a Region filter and set up 10 subscriptions, each applying a different region value.

**Dashboard Subscriptions (#75) + CSV Attachments**
A finance team needs raw transaction data every Monday for import into their accounting system. They set up a dashboard subscription with CSV attachment option.

**Conditional Subscription Delivery (#77)**
An anomaly-detection dashboard's subscription is configured to skip delivery when no results are returned, preventing daily empty emails.

**Alert Scheduling (#55) + Webhooks**
A technical team configures a webhook-based alert on a data quality check question, triggering a PagerDuty incident when failing rows appear.

**Collections (#80) + Collection Access Levels (#81) + Official Collections (#82)**
A data team creates an "Official Analytics" collection marked as Official. All verified dashboards and models live here. The yellow badge and search prominence help employees identify trustworthy content.

**Personal Collections (#85)**
An analyst experiments with several approaches in their personal collection. Only when the work is polished do they move it into the shared collection.

**Collection Cleanup (#86)**
A large organization enables collection cleanup with a 6-month threshold, automatically surfacing and trashing content that no one has viewed.

**Item Pinning (#83)**
A team lead pins the three most important dashboards to the top of the collection.

**Bulk Item Operations (#84)**
After a reorganization, an admin bulk-moves 200 questions from one collection into their respective dashboards.

**Models (#90) + Model Column Metadata (#91)**
A data team builds a "Customer 360" model on top of a complex 6-table SQL join and annotates each column with business-friendly names and descriptions.

**Model Persistence (#92) + Audit Logs (#93)**
A "Daily Active Users" model involving a 45-second query across 500M rows is persisted with a 1-hour refresh interval. Downstream dashboards load in under 1 second.

**Metrics (#96) + Metric Default Time Dimension (#97)**
A company defines "Monthly Recurring Revenue" as an official metric. Every analyst uses the same definition from the query builder's "Common metrics" section.

**Segments (#98)**
The "High-Value Customer" segment (customers with lifetime value > $10,000) is defined once. Any analyst can apply this segment as a filter.

**Convert Question to Model (#95)**
An analyst builds a question that produces a useful clean dataset. A data engineer reviews it, adds column metadata, and promotes it to a model.

**Library (#100) + Table Publishing (#102)**
A data team publishes their three "gold standard" tables to the Library. These published tables appear at the top of the data source list.

**Dependency Graph (#110) + Dependency Diagnostics (#111)**
A data engineer is about to rename a column. They check the Dependency Graph and see that 47 questions and 12 dashboards depend on this model.

**Transforms (#112) + Transform Scheduling (#115)**
A data team writes a query transform for a "Weekly Sales Summary" table refreshed every Sunday night.

**Incremental Transforms (#113)**
A large events table receives 5 million new rows daily. An incremental transform using a checkpoint column runs in 2 minutes instead of 30.

**Python Transforms (#114)**
A data science team writes a Python transform that loads customer features, applies a pre-trained churn prediction model, and writes back results.

**Transform Dependencies (#117)**
The "Customer Lifetime Value" transform depends on the "Order History Aggregation" transform. Metabase runs the dependency first.

**Glossary (#109)**
A new analyst asks Metabot "show me our ARR trend." The Glossary defines "ARR" as "Annual Recurring Revenue, calculated as MRR x 12," helping Metabot use the right metric.

**Data Structure (#101) + Table Visibility Tiers (#103)**
A data team sets raw staging tables to "Hidden", making them invisible in the query builder while keeping them accessible for SQL power users.

**X-Rays (#126)**
A new employee hovers over a table in the database browser and clicks the lightning bolt icon. Metabase generates summary charts giving a rapid overview of the data.

**X-Rays (#126) + Drill-Through (#21)**
An analyst reviewing a monthly signups chart notices a spike. They click the data point and select "Automatic insights." Metabase surfaces that 70% of signups came from a specific referral campaign.

**Events and Timelines (#128)**
An analyst reviews a 12-month revenue trend and notices a dip. A "Website Outage" event marker on the chart provides immediate context.

**Data Reference (#119) + Foreign Key Visualization (#121)**
A SQL developer opens the Data Reference panel to check that `customer_id` in Orders links to `id` in Customers.

**Advanced Search (#124) + Content Verification (#50)**
An analyst searches for "revenue" and filters by "Verified" to find only admin-approved content.

**Command Palette (#123) + Keyboard Shortcuts (#130)**
A power user uses Cmd+K to jump to items by name and keyboard shortcuts to operate dashboards without a mouse.

**Documents (#132) + Embedded Charts (#134) + Side-by-Side Layout (#135)**
A data analyst prepares a quarterly business review as a Document, embedding 4 charts side-by-side with narrative analysis.

**Document Comments (#136) + User Mentions**
A CFO leaves a comment on a revenue chart and @mentions the lead analyst. The analyst replies in-thread.

**Document Public Links (#137)**
A consultant generates a public link for a document, allowing a client to view the full report without a Metabase account.

**CSV Upload (#139) + Models (#90)**
A sales ops analyst uploads a CSV of manually tracked partnership deals, creating a queryable model that can be joined against the main Deals table.

**CSV Append (#140)**
A marketing team appends new survey results monthly to an existing model. All dashboards automatically include the new data.

**Content Verification (#50) + Official Collections (#82) + Library (#100)**
A financial services company marks approved analytics content as Verified, stores it in Official Collections within the Library, and trains employees to only use verified content.

**Version History (#48) + History and Version Revert (#131)**
A data engineer accidentally introduces a bug in a core model. They open the version history, identify the last known-good version, and revert.

**Usage Analytics (#148)**
A BI team lead opens Usage Analytics to show that 240 unique users accessed dashboards in the last 30 days — demonstrating platform ROI.

**Notification Permissions (#145)**
An employee leaves the company. The admin bulk-deletes all alerts and subscriptions owned by that user.
