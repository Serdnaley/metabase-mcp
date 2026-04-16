# Data Modeling

Metabase's data modeling features: models, persistence, metadata editing, semantic types, JSON unfolding, formatting, segments, metrics, actions, editable tables, and CSV uploads.

## Sources

- [Data Modeling Overview](https://www.metabase.com/docs/latest/data-modeling/start)
- [Models](https://www.metabase.com/docs/latest/data-modeling/models)
- [Model Persistence](https://www.metabase.com/docs/latest/data-modeling/model-persistence)
- [Semantic Types](https://www.metabase.com/docs/latest/data-modeling/semantic-types)
- [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
- [Editable Tables](https://www.metabase.com/docs/latest/data-modeling/editable-tables)
- [JSON Unfolding](https://www.metabase.com/docs/latest/data-modeling/json-unfolding)
- [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
- [Data Model Reference](https://www.metabase.com/docs/latest/exploration-and-organization/data-model-reference)
- [Segments](https://www.metabase.com/docs/latest/data-modeling/segments)
- [Metrics](https://www.metabase.com/docs/latest/data-modeling/metrics)
- [Actions Overview](https://www.metabase.com/docs/latest/actions/start)
- [Custom Actions](https://www.metabase.com/docs/latest/actions/custom)
- [Basic Actions](https://www.metabase.com/docs/latest/actions/basic)
- [CSV Uploads](https://www.metabase.com/docs/latest/databases/uploads)
- [Referencing Models in SQL](https://www.metabase.com/docs/latest/questions/native-editor/referencing-saved-questions-in-queries)

---

## Features

### Models

**1. Model Creation from Query Builder**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Build a model using Metabase's no-code query builder, selecting columns, applying filters, and joining tables without writing SQL.

**2. Model Creation from Native SQL**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Write raw SQL to define a model, enabling arbitrary transformations, window functions, and database-specific logic.

**3. Convert Saved Question to Model**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Promote an existing saved question to a model, upgrading it to first-class status with column metadata, search indexing, and record-level exploration.

**4. Custom / Calculated Columns in Models**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Add derived columns (e.g., computed fields, expressions) directly inside a model definition so downstream questions inherit them automatically.

**5. Model Column Metadata: Display Names**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Override the underlying database column name with a human-readable label that all users see.

**6. Model Column Metadata: Descriptions**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Attach explanatory text to each column so that analysts understand what a field means.

**7. Model Column Metadata: Semantic Type Assignment**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Assign a semantic type to each model column, required for SQL-based models to unlock query builder exploration.

**8. Model Column Metadata: Database Column Mapping**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Map a model column back to its source database column, preserving foreign key relationships and enabling drill-through.

**9. Model Column Metadata: Visibility Control**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Set per-column visibility to "everywhere," "only in detail views," or "do not include."

**10. Model Column Metadata: Display Format**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Choose whether a text column renders as plain text or as a clickable hyperlink.

**11. Search Indexing for Model Columns**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Mark string columns as searchable so that specific records surface in Metabase's global search. Limited to fields with up to 25,000 unique values; requires an integer entity key.

**12. Model Auto-Pinning to Collection**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
When a model is created, it is automatically pinned to the top of its collection.

**13. Models Elevated in Search Results**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Models are ranked higher than ordinary tables and questions in Metabase search results.

**14. Reference Models in SQL via `{{#model-name}}`**
Source: [Referencing Models in SQL](https://www.metabase.com/docs/latest/questions/native-editor/referencing-saved-questions-in-queries)
Use a model as a sub-query inside any native SQL question by referencing it with a template tag.

**15. Reference Models as CTEs**
Source: [Referencing Models in SQL](https://www.metabase.com/docs/latest/questions/native-editor/referencing-saved-questions-in-queries)
The `{{#model-name}}` syntax can be used inside a `WITH` clause.

**16. Model List View Customization**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Configure which columns appear in the model's tabular list display. Set the primary identifier column, add up to five additional columns, and reorder via drag-and-drop.

**17. Individual Record Exploration (Detail View)**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Navigate to a detail page for a specific row in a model, showing all fields for that record.

**18. Model Detail Page — Overview Tab**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Displays the model's description, creator, last editor, field list, and entity ID.

**19. Model Detail Page — History Tab**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Lists every change made to the model and who made it, providing a full audit trail.

**20. Model Detail Page — Relationships Tab**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Shows which questions depend on the model and which database tables the model draws from.

**21. Model Detail Page — Actions Tab**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Lists all actions (create/update/delete workflows) associated with the model.

**22. Model Detail Page — Insights Tab**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Shows admin-only usage analytics for the model (Pro/Enterprise).

**23. Version History (15 Versions)**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Metabase retains the last 15 versions of a model, allowing rollback or review.

**24. Content Verification for Models**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Admins can mark a model as "verified," signaling trustworthiness.

**25. Breaking Change Detection (Pro/Enterprise)**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
When editing a model's query, Metabase detects renamed or removed columns and warns about dependent questions.

**26. Duplicate Model**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Clone an existing model as a starting point for a new variant.

**27. Trash / Permanent Deletion**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
Move a model to trash or permanently delete it.

**28. Browse Models via Data Reference Sidebar**
Source: [Models](https://www.metabase.com/docs/latest/data-modeling/models)
The data reference panel in the SQL editor lists all models.

### Model Persistence

**29. Model Persistence (Caching Results in Warehouse)**
Source: [Model Persistence](https://www.metabase.com/docs/latest/data-modeling/model-persistence)
Store a model's query results as a physical table in a dedicated schema in the connected data warehouse.

**30. Instance-Level Persistence Toggle**
Source: [Model Persistence](https://www.metabase.com/docs/latest/data-modeling/model-persistence)
Admins enable model persistence globally from Admin > Performance > Model persistence.

**31. Database-Level Persistence Toggle**
Source: [Model Persistence](https://www.metabase.com/docs/latest/data-modeling/model-persistence)
Persistence must also be enabled per database connection in Admin > Databases.

**32. Per-Model Persistence Toggle (Pro/Enterprise)**
Source: [Model Persistence](https://www.metabase.com/docs/latest/data-modeling/model-persistence)
Individual models can have persistence switched on or off independently.

**33. Configurable Refresh Schedules**
Source: [Model Persistence](https://www.metabase.com/docs/latest/data-modeling/model-persistence)
Set refresh frequency using preset intervals or custom cron syntax.

**34. Timezone-Aware Refresh Scheduling**
Source: [Model Persistence](https://www.metabase.com/docs/latest/data-modeling/model-persistence)
Refresh schedules respect the instance's report timezone setting.

**35. Manual Refresh of Persisted Models**
Source: [Model Persistence](https://www.metabase.com/docs/latest/data-modeling/model-persistence)
Users with Curate access can trigger an immediate refresh outside the scheduled window.

**36. Refresh Timestamp Display**
Source: [Model Persistence](https://www.metabase.com/docs/latest/data-modeling/model-persistence)
The model UI shows when the persisted data was last refreshed.

**37. Model Caching Logs**
Source: [Model Persistence](https://www.metabase.com/docs/latest/data-modeling/model-persistence)
Admin Tools includes logs for model persistence activity.

### Metadata Editing (Table & Field Level)

**38. Table Display Name Editing**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Rename a database table in Metabase without modifying the database.

**39. Table Description**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Add a plain-text description to a table.

**40. Table Visibility Toggle**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Hide a table from the query builder using the eye icon.

**41. Hide Entire Databases**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Mark an entire database as hidden from non-admin users.

**42. Schema Sync**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Trigger an on-demand sync of the table schema.

**43. Scan Field Values**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Trigger a scan of a field's distinct values to populate filter dropdown lists.

**44. Discard Cached Field Values**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Clear cached field values for a table or column to force a re-scan.

**45. Field Sort Order**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Arrange columns automatically (alphabetically, by database order) or via custom drag-and-drop.

**46. Field Display Name Customization**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Override any column's name globally across all questions and dashboards.

**47. Field Description**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Add documentation text to individual columns.

**48. Field Preview with Sample Data**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
View sample values from a field in the metadata editor.

**49. Type Casting: Text/Number to Datetime**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Cast a text or numeric column to a datetime type without modifying the database.

**50. Type Casting: Text to Numeric**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Cast a string column to integer or float.

**51. Type Casting: Float to Integer / Datetime to Date**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Narrow numeric or temporal precision at the metadata layer.

**52. Field Visibility Settings**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Control whether a field appears everywhere, only in detail views, or is excluded entirely.

**53. Filter Widget Type Selection**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Choose how users filter on a column: search box, dropdown with checkboxes, or plain input box.

**54. Foreign Key Display Mapping**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Map a foreign key column to show a meaningful value from the related table.

**55. Custom Numeric Value Mapping**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Replace raw numeric codes with human-readable labels in filter dropdowns and table cells.

**56. Field-Level Formatting Overrides**
Source: [Metadata Editing](https://www.metabase.com/docs/latest/data-modeling/metadata-editing)
Apply custom number, date, currency, or text formatting settings to a specific column.

### Semantic Types

**57. Semantic Type: Entity Key**
Source: [Semantic Types](https://www.metabase.com/docs/latest/data-modeling/semantic-types)
Tags a column as the unique row identifier, enabling record-level drill-through, actions, and search indexing.

**58. Semantic Type: Foreign Key**
Source: [Semantic Types](https://www.metabase.com/docs/latest/data-modeling/semantic-types)
Tags a column as a reference to another table's entity key, enabling automatic join suggestions.

**59. Semantic Types: Numeric**
Source: [Semantic Types](https://www.metabase.com/docs/latest/data-modeling/semantic-types)
Quantity, Score, Percentage, Currency, Discount, Income — categorize numeric fields by business meaning.

**60. Semantic Types: Location**
Source: [Semantic Types](https://www.metabase.com/docs/latest/data-modeling/semantic-types)
Latitude, Longitude, City, State, Country, ZipCode — enable geographic visualization types and geo-based filtering.

**61. Semantic Types: Temporal**
Source: [Semantic Types](https://www.metabase.com/docs/latest/data-modeling/semantic-types)
Creation Date/Time/Timestamp, Joined Date/Time/Timestamp, Birthday — enable smarter defaults for time-based analysis.

**62. Semantic Types: Text**
Source: [Semantic Types](https://www.metabase.com/docs/latest/data-modeling/semantic-types)
Entity Name, Email, URL, Image URL, Avatar URL, Category, Name, Title, Description, Product, Source — provide business context for text columns.

**63. Semantic Type: Field Containing JSON**
Source: [Semantic Types](https://www.metabase.com/docs/latest/data-modeling/semantic-types)
Tags a column as JSON, enabling JSON-specific display and unfolding features.

**64. Visualization Intelligence via Semantic Types**
Source: [Semantic Types](https://www.metabase.com/docs/latest/data-modeling/semantic-types)
Metabase automatically selects chart types based on semantic types.

**65. URL / Email Extraction**
Source: [Semantic Types](https://www.metabase.com/docs/latest/data-modeling/semantic-types)
URL-typed fields can extract just the host/domain; email fields can extract just the domain portion.

**66. Type Casting (Semantic Layer)**
Source: [Semantic Types](https://www.metabase.com/docs/latest/data-modeling/semantic-types)
Change how Metabase interprets a column's data type without altering the underlying database schema.

### JSON Unfolding

**67. JSON Column Unfolding**
Source: [JSON Unfolding](https://www.metabase.com/docs/latest/data-modeling/json-unfolding)
Automatically expand a JSON object column into individual sub-columns, one per top-level key.

**68. Database-Level JSON Unfolding Toggle**
Source: [JSON Unfolding](https://www.metabase.com/docs/latest/data-modeling/json-unfolding)
Admins can disable JSON unfolding for an entire database.

**69. Column-Level JSON Unfolding Toggle**
Source: [JSON Unfolding](https://www.metabase.com/docs/latest/data-modeling/json-unfolding)
Enable or disable unfolding for individual JSON columns through table metadata.

**70. Unfolded Column Visibility Settings**
Source: [JSON Unfolding](https://www.metabase.com/docs/latest/data-modeling/json-unfolding)
Control which unfolded sub-columns are visible to users.

**71. Automatic Unfolding for Specific Databases**
Source: [JSON Unfolding](https://www.metabase.com/docs/latest/data-modeling/json-unfolding)
BigQuery automatically unfolds STRUCT types; MongoDB automatically unfolds nested fields.

**72. Renaming Unfolded Columns**
Source: [JSON Unfolding](https://www.metabase.com/docs/latest/data-modeling/json-unfolding)
Unfolded sub-columns can be renamed via table metadata editing or by creating a model.

**73. JSON Filtering Constraint**
Source: [JSON Unfolding](https://www.metabase.com/docs/latest/data-modeling/json-unfolding)
In the query builder, Metabase can only filter JSON columns (pre-unfolding) by "is empty" or "not empty"; unfolded columns support full filtering.

### Data Formatting

**74. Global Formatting Defaults**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Set instance-wide formatting defaults for numbers, currencies, and datetimes via Admin > Settings > Localization.

**75. Field-Level Formatting Overrides in Table Metadata**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Override global defaults for a specific column in the table metadata editor.

**76. Question-Level Formatting in Visualization Options**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Override formatting for a column within a specific question's visualization settings.

**77. Text Alignment**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Set left, center, or right alignment for text values in table cells.

**78. Text Display Options**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Render as plain text, clickable email link, image, auto-detected type, or custom link with `{{variable}}` substitution.

**79. Custom Link with Variable Substitution**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Build dynamic URLs by embedding column values (e.g., `https://example.com/{{id}}`).

**80. Date Display Style**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Choose from multiple regional date formats.

**81. Date Abbreviation Toggle**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Shorten month and day names.

**82. Time Granularity Display**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Show dates with four levels of time detail.

**83. 12-Hour / 24-Hour Clock Toggle**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Control whether times display in 12-hour or 24-hour format.

**84. Number Display Style**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Choose automatic, plain text, or clickable link rendering for numeric values.

**85. Number Format: Normal / Percentage / Scientific Notation / Currency**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Set how numeric values are presented.

**86. Thousand/Decimal Separator Style**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Select regional separator conventions.

**87. Decimal Places Specification**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Set the exact number of decimal places to display.

**88. Number Multiplier**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Apply a multiplier to displayed values.

**89. Number Prefix and Suffix**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Add arbitrary text before or after numeric values.

**90. Mini Bar Charts in Tables**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Display a small inline bar chart in a table cell representing a numeric value's magnitude.

**91. Currency Label Style**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Display currency as symbol ($), local symbol, ISO code (USD), or full name.

**92. Currency Label Position**
Source: [Formatting](https://www.metabase.com/docs/latest/data-modeling/formatting)
Place the currency indicator in the column header or inline in each cell.

### Segments

**93. Segment Creation**
Source: [Segments](https://www.metabase.com/docs/latest/data-modeling/segments)
Admins define a named, reusable filter on a table.

**94. Segment Preview Before Save**
Source: [Segments](https://www.metabase.com/docs/latest/data-modeling/segments)
Test a segment's filter logic and see resulting record count before publishing.

**95. Segments in Filter Dropdowns**
Source: [Segments](https://www.metabase.com/docs/latest/data-modeling/segments)
Published segments appear as options in the query builder's filter interface.

**96. Segment Editing with Change Notes**
Source: [Segments](https://www.metabase.com/docs/latest/data-modeling/segments)
Admins can update segment definitions with required change notes.

**97. Segment Revision History**
Source: [Segments](https://www.metabase.com/docs/latest/data-modeling/segments)
Full history of changes to a segment's definition is stored.

**98. Segment Retirement**
Source: [Segments](https://www.metabase.com/docs/latest/data-modeling/segments)
Retire a segment to remove it from filter dropdowns without breaking existing content.

**99. Automatic Notifications on Segment Changes**
Source: [Segments](https://www.metabase.com/docs/latest/data-modeling/segments)
When a segment is edited or retired, Metabase notifies creators of dependent content.

### Metrics

**100. Metric Creation**
Source: [Metrics](https://www.metabase.com/docs/latest/data-modeling/metrics)
Define a named aggregation built on a model, table, or saved question.

**101. Metrics Built on Top of Metrics**
Source: [Metrics](https://www.metabase.com/docs/latest/data-modeling/metrics)
Compose new metrics using existing metrics as building blocks.

**102. Default Time Dimension for Metrics**
Source: [Metrics](https://www.metabase.com/docs/latest/data-modeling/metrics)
Optionally attach a default time dimension to a metric.

**103. Metrics in Summarization Section ("Common Metrics")**
Source: [Metrics](https://www.metabase.com/docs/latest/data-modeling/metrics)
Access defined metrics directly in the query builder's summarization panel.

**104. Multiple Metrics Selected Simultaneously**
Source: [Metrics](https://www.metabase.com/docs/latest/data-modeling/metrics)
Select more than one metric in a question; each is calculated independently.

**105. Metrics as Data Sources**
Source: [Metrics](https://www.metabase.com/docs/latest/data-modeling/metrics)
Use a metric as the starting point for a new question.

**106. Combine Metrics in Custom Expressions**
Source: [Metrics](https://www.metabase.com/docs/latest/data-modeling/metrics)
Reference multiple metrics inside a custom expression formula.

**107. Metric Storage in Collections**
Source: [Metrics](https://www.metabase.com/docs/latest/data-modeling/metrics)
Save metrics to any collection for organized discovery.

**108. Metric Access via Command Palette**
Source: [Metrics](https://www.metabase.com/docs/latest/data-modeling/metrics)
Open the metric creation flow via Cmd/Ctrl+K.

**109. Default Chart Type for Metrics**
Source: [Metrics](https://www.metabase.com/docs/latest/data-modeling/metrics)
Metabase displays metrics as number or line charts based on whether a time dimension is set.

### Actions

**110. Basic (Implicit) Actions: Create**
Source: [Basic Actions](https://www.metabase.com/docs/latest/actions/basic)
Automatically generated action that inserts a new record.

**111. Basic (Implicit) Actions: Update**
Source: [Basic Actions](https://www.metabase.com/docs/latest/actions/basic)
Automatically generated action that applies changes to an existing record.

**112. Basic (Implicit) Actions: Delete**
Source: [Basic Actions](https://www.metabase.com/docs/latest/actions/basic)
Automatically generated action that deletes a record.

**113. Auto Schema Tracking for Basic Actions**
Source: [Basic Actions](https://www.metabase.com/docs/latest/actions/basic)
Basic action forms automatically reflect schema changes.

**114. Custom Actions with Parameterized SQL**
Source: [Custom Actions](https://www.metabase.com/docs/latest/actions/custom)
Write arbitrary SQL with named parameters surfaced as form inputs.

**115. Custom Action Variable Types**
Source: [Custom Actions](https://www.metabase.com/docs/latest/actions/custom)
Parameters can be typed as text, number, or date/date+time with various input styles.

**116. Optional Parameters with Default Values**
Source: [Custom Actions](https://www.metabase.com/docs/latest/actions/custom)
Mark action parameters as optional with default values.

**117. Custom Action Placeholder Text**
Source: [Custom Actions](https://www.metabase.com/docs/latest/actions/custom)
Configure placeholder text for each form field.

**118. Action Form Preview**
Source: [Custom Actions](https://www.metabase.com/docs/latest/actions/custom)
See a live rendering of the action form before publishing.

**119. Action Success Message Customization**
Source: [Custom Actions](https://www.metabase.com/docs/latest/actions/custom)
Set a custom confirmation message after successful execution.

**120. Conditional SQL with Optional Parameters (`[[ ]]`)**
Source: [Custom Actions](https://www.metabase.com/docs/latest/actions/custom)
Wrap query segments in double brackets for conditional inclusion.

**121. Public Action Forms**
Source: [Custom Actions](https://www.metabase.com/docs/latest/actions/custom)
Generate a publicly shareable URL for an action form.

**122. Actions on Dashboards as Buttons**
Source: [Actions Overview](https://www.metabase.com/docs/latest/actions/start)
Add action buttons to dashboards; filter values can be passed into action parameters.

**123. Actions in Object Detail Views**
Source: [Actions Overview](https://www.metabase.com/docs/latest/actions/start)
Trigger update or delete actions on an individual record from its detail view.

**124. Enable/Disable Basic Actions Toggle**
Source: [Basic Actions](https://www.metabase.com/docs/latest/actions/basic)
Basic actions can be switched on or off per model.

**125. Actions Require Write-Enabled Database Connection**
Source: [Actions Overview](https://www.metabase.com/docs/latest/actions/start)
The underlying database connection must have write-back enabled.

### Editable Tables

**126. Direct Record Creation in Tables**
Source: [Editable Tables](https://www.metabase.com/docs/latest/data-modeling/editable-tables)
Click "+ New record" to open an inline form and insert a row.

**127. Direct Record Editing in Tables**
Source: [Editable Tables](https://www.metabase.com/docs/latest/data-modeling/editable-tables)
Click into a cell to update its value directly.

**128. Direct Record Deletion**
Source: [Editable Tables](https://www.metabase.com/docs/latest/data-modeling/editable-tables)
Select and delete rows directly from the Metabase table interface.

**129. Batch Row Deletion**
Source: [Editable Tables](https://www.metabase.com/docs/latest/data-modeling/editable-tables)
Delete multiple selected rows simultaneously.

**130. Referential Integrity Enforcement**
Source: [Editable Tables](https://www.metabase.com/docs/latest/data-modeling/editable-tables)
Prevents deletion of rows referenced by foreign keys in other tables.

**131. Type Safety Enforcement**
Source: [Editable Tables](https://www.metabase.com/docs/latest/data-modeling/editable-tables)
Prevents entering a value of the wrong type.

**132. Sequential Primary Key Protection**
Source: [Editable Tables](https://www.metabase.com/docs/latest/data-modeling/editable-tables)
Auto-increment primary key columns cannot be manually edited.

**133. Dropdown Lists for Column Values**
Source: [Editable Tables](https://www.metabase.com/docs/latest/data-modeling/editable-tables)
Editable table fields show dropdowns of existing values.

**134. Add New Values to Dropdown Lists**
Source: [Editable Tables](https://www.metabase.com/docs/latest/data-modeling/editable-tables)
Users can add values not yet in the dropdown during record creation.

### CSV Upload

**135. CSV Upload to Collection**
Source: [CSV Uploads](https://www.metabase.com/docs/latest/databases/uploads)
Upload a CSV file to a Metabase collection; Metabase creates a backing database table and model.

**136. Admin-Configured Upload Target Database and Schema**
Source: [CSV Uploads](https://www.metabase.com/docs/latest/databases/uploads)
Admins designate which database and schema receives uploaded CSV data.

**137. Table Name Prefix for Uploads**
Source: [CSV Uploads](https://www.metabase.com/docs/latest/databases/uploads)
Admins can specify a naming prefix for uploaded tables.

**138. MySQL `local_infile` Acceleration**
Source: [CSV Uploads](https://www.metabase.com/docs/latest/databases/uploads)
Enabling this MySQL setting speeds up CSV ingestion.

**139. Group Permission Control for Uploads**
Source: [CSV Uploads](https://www.metabase.com/docs/latest/databases/uploads)
Upload access is controlled by group-level permissions on the upload schema.

### Data Model Reference

**140. Data Reference Panel**
Source: [Data Model Reference](https://www.metabase.com/docs/latest/exploration-and-organization/data-model-reference)
A browsable sidebar listing all databases, schemas, tables, models, and their field details.

**141. Table Details in Data Reference**
Source: [Data Model Reference](https://www.metabase.com/docs/latest/exploration-and-organization/data-model-reference)
Each table entry shows description, field names, types, sample values, and related questions.

**142. X-Ray from Data Reference**
Source: [Data Model Reference](https://www.metabase.com/docs/latest/exploration-and-organization/data-model-reference)
Trigger an automatic x-ray exploration from a table's data reference entry.

**143. Glossary**
Source: [Data Model Reference](https://www.metabase.com/docs/latest/exploration-and-organization/data-model-reference)
A shared, editable dictionary where teams define business terms.

**144. Segments Browser in Data Reference**
Source: [Data Model Reference](https://www.metabase.com/docs/latest/exploration-and-organization/data-model-reference)
Lists all admin-defined segments for discovery.

**145. Foreign Key Relationship Navigation**
Source: [Data Model Reference](https://www.metabase.com/docs/latest/exploration-and-organization/data-model-reference)
Shows column relationships defined by foreign keys.

**146. Direct URL Access to Data Reference**
Source: [Data Model Reference](https://www.metabase.com/docs/latest/exploration-and-organization/data-model-reference)
Accessible via a direct URL for bookmarking or linking.

**147. Metadata Editing Shortcut from Data Reference**
Source: [Data Model Reference](https://www.metabase.com/docs/latest/exploration-and-organization/data-model-reference)
Admins can navigate directly from data reference to the metadata editor.

---

## Use Cases

**Model Creation from Query Builder (#1) + Model Column Metadata (#5, #6, #7)**
A data team creates a "Customers" model that joins three raw tables, renames cryptic column codes to human-readable names, adds descriptions, and assigns semantic types. Every analyst now builds questions off a clean, self-documenting layer.

**Model Creation from Native SQL (#2) + Reference Models in SQL (#14)**
A data engineer writes a complex SQL model using window functions to compute customer lifetime value. A downstream analyst references that model in a new SQL question using `{{#ltv_model}}` inside a CTE.

**Model Persistence (#29) + Configurable Refresh Schedules (#33)**
A "Weekly Revenue Summary" model aggregates billions of events from Redshift. After enabling persistence with an hourly refresh cron, all dashboards load in under 2 seconds.

**Per-Model Persistence Toggle (#32) + Manual Refresh (#35)**
During a finance close process, an analyst manually triggers a refresh of the persisted "Monthly P&L" model immediately after the accounting team finalizes data.

**Breaking Change Detection (#25)**
A data engineer renames a column. Metabase warns that 12 saved questions reference the old column name, allowing the engineer to coordinate updates.

**Search Indexing (#11) + Semantic Type: Entity Key (#57)**
A support team finds specific customer records by name in Metabase's global search, because the "Customer Name" field is indexed and the model has an integer entity key.

**Version History (#23)**
After a model edit produces unexpected dashboard results, the data team rolls back to a previous model version.

**Content Verification (#24)**
An analytics lead marks five core models as "verified." Business users filter the model browser to show only verified models.

**Table Visibility Toggle (#40) + Field Visibility: "Do Not Include" (#52)**
A company hides staging tables and sets PII columns to "do not include" so they are invisible in the query builder.

**Field Display Name (#46) + Field Description (#47) + Field Preview (#48)**
An admin renames vendor fields like `f_qty_ord_ytd` to plain English, adds descriptions, and verifies sample values.

**Type Casting: Text to Datetime (#49) + Filter Widget Type (#53)**
A legacy database stores dates as Unix epoch integers in varchar. After casting to Datetime, Metabase presents a calendar picker instead of a free-text box.

**Foreign Key Display Mapping (#54)**
An orders table's `customer_id` shows the customer's full name instead of raw integer IDs.

**Custom Numeric Value Mapping (#55)**
Lead status integers (1, 2, 3, 4) are mapped to "New", "Contacted", "Qualified", "Closed" in every filter dropdown and chart legend.

**JSON Column Unfolding (#67) + Renaming Unfolded Columns (#72)**
An event table's JSON `properties` column is unfolded into individual columns and renamed to "Page URL" and "UTM Source."

**Database-Level JSON Unfolding Toggle (#68)**
A wide metadata JSON column with hundreds of keys is disabled from unfolding to prevent performance degradation.

**Semantic Types: Location (#60)**
A logistics company assigns Latitude and Longitude semantic types. Metabase automatically offers a pin map visualization.

**Semantic Types: Country + State + City (#60)**
A marketing analyst groups by "Country" field. Metabase renders a choropleth map by default.

**Semantic Types: Image URL (#62)**
A product catalog table renders `thumbnail_url` as actual inline images rather than raw URLs.

**Semantic Types: Email (#62) + URL Extraction (#65)**
The `user_email` column renders as a clickable mailto link. The analyst can break out by email domain to count users per organization.

**Semantic Type: Entity Key (#57) + Basic Actions (#110, #111, #112)**
A "User Records" model with Entity Key on `user_id` auto-generates Create, Update, and Delete action forms.

**Segments (#93) + Retirement (#98) + Automatic Notifications (#99)**
A "High-Value Customers" segment threshold changes. The admin edits it with a change note. All 8 question/dashboard creators receive notifications.

**Segments in Filter Dropdowns (#95)**
A sales manager applies an "Active Subscriptions" segment via the filter dropdown, replacing 4 individual filter conditions.

**Metrics (#100) + Default Time Dimension (#102) + Metrics as Data Sources (#105)**
"Net Revenue" is defined as sum(amount) minus sum(refunds) with "Invoice Date" as the default time dimension. Analysts immediately get a time-series line chart.

**Multiple Metrics (#104) + Combine Metrics in Expressions (#106)**
A growth team selects "New Users" and "Churned Users" metrics and creates `[New Users] - [Churned Users]` as a custom expression for "Net New Users."

**Metrics Built on Metrics (#101) + Metric Storage (#107)**
"Gross Margin %" is created as `([Gross Revenue] - [COGS]) / [Gross Revenue]`. All three metrics are stored in the Finance collection.

**Custom Actions (#114) + Variable Types (#115) + Optional Parameters (#116)**
A content moderation action: `UPDATE posts SET flagged = {{flagged_status}} WHERE id = {{post_id}} [[ AND category = {{category}} ]]`.

**Public Action Forms (#121)**
External field agents submit daily inventory counts via a public action form URL.

**Actions on Dashboards (#122) + Dashboard Filters**
A customer success dashboard shows at-risk accounts. Each row has a "Mark as Contacted" button that pre-fills the account_id from the dashboard filter.

**Editable Tables (#126) + Dropdown Lists (#133)**
A product team manages a `feature_flags` table directly in Metabase with dropdown selections.

**Batch Row Deletion (#129) + Referential Integrity (#130)**
An admin purges expired promo codes. Deletion is blocked for codes still referenced by orders.

**CSV Upload (#135) + Upload Schema (#136) + Group Permissions (#139)**
A marketing analyst uploads campaign attribution CSV. Metabase creates a table and model, and the analyst joins it against CRM data.

**Global Formatting (#74) + Field-Level Overrides (#75) + Question-Level Overrides (#76)**
EUR is set globally. The "Revenue" column shows two decimal places. A specific dashboard adds mini bar charts.

**Custom Link with Variable Substitution (#79)**
A support dashboard formats `ticket_id` as `https://helpdesk.example.com/tickets/{{ticket_id}}`.

**Date Display (#80) + Clock Toggle (#83) + Time Granularity (#82)**
A European team sets 24-hour clock and "31/1/2018" format globally. A monitoring question shows timestamps to milliseconds.

**Data Reference Panel (#140) + Glossary (#143) + Metabot Integration**
An analyst asks Metabot "What is our MRR?" The Glossary entry tells Metabot it means "Monthly Recurring Revenue." The analyst also browses the data reference for field descriptions.

**X-Ray from Data Reference (#142)**
A new team member clicks "X-ray this table" to instantly get distribution charts, common values, and temporal trends.

**Segments Browser (#144) + Foreign Key Navigation (#145)**
A SQL author browses segments to find "Paid Users" and checks foreign key relationships before writing their JOIN clause.

**Model List View (#16) + Individual Record Exploration (#17)**
A CRM model shows "Company Name" as the primary column with "ARR", "Plan", "Owner", and "Last Contact Date." A sales manager clicks rows to see full details.

**Schema Sync (#42) + Scan Field Values (#43) + Discard Cached Values (#44)**
After a migration adds columns, the admin syncs schema and refreshes stale filter dropdowns.
