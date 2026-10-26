import { z } from "zod";
/**
 * Large-result safety. Metabase query responses carry the rows plus a lot of metadata
 * (column internals, results_metadata fingerprints, insights) that an LLM rarely needs.
 * shapeQueryResult() returns a compact view with a row cap and a size cap; `verbose`
 * returns the raw response (still size-capped).
 */

export const DEFAULT_MAX_ROWS = 500;
export const DEFAULT_MAX_RESPONSE_CHARS = 100_000;

export type ResultLimits = {
  /** Max rows returned by query tools (METABASE_MAX_ROWS) */
  maxRows: number;
  /** Max characters of any tool response (METABASE_MAX_RESPONSE_CHARS) */
  maxResponseChars: number;
};

export type ShapeOptions = {
  /** Rows to return (capped by limits.maxRows) */
  max_rows?: number;
  /** Skip this many rows of the result first (client-side paging over what Metabase returned) */
  offset?: number;
  /** Return the raw Metabase response instead of the compact view */
  verbose?: boolean;
};

const positiveInt = (raw: string | undefined, fallback: number, name: string): number => {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`${name} must be a positive integer, got "${raw}"`);
  return n;
};

export const loadResultLimits = (env: Record<string, string | undefined>): ResultLimits => ({
  maxRows: positiveInt(env.METABASE_MAX_ROWS, DEFAULT_MAX_ROWS, "METABASE_MAX_ROWS"),
  maxResponseChars: positiveInt(
    env.METABASE_MAX_RESPONSE_CHARS,
    DEFAULT_MAX_RESPONSE_CHARS,
    "METABASE_MAX_RESPONSE_CHARS"
  ),
});

type Col = Record<string, unknown>;

const compactCol = (c: Col) => {
  const out: Record<string, unknown> = { name: c.name };
  if (c.display_name && c.display_name !== c.name) out.display_name = c.display_name;
  out.type = c.effective_type ?? c.base_type;
  if (c.semantic_type) out.semantic_type = c.semantic_type;
  if (c.unit) out.unit = c.unit;
  return out;
};

/** Is this a Metabase dataset response ({ data: { rows, cols } })? */
const isDataset = (r: unknown): r is { data: { rows: unknown[][]; cols: Col[] } } & Record<string, unknown> =>
  !!r &&
  typeof r === "object" &&
  !!(r as any).data &&
  Array.isArray((r as any).data.rows) &&
  Array.isArray((r as any).data.cols);

export const shapeQueryResult = (result: unknown, limits: ResultLimits, opts: ShapeOptions = {}): unknown => {
  if (!isDataset(result)) return result;
  if ((result as any).status === "failed") {
    return { status: "failed", error: (result as any).error, error_type: (result as any).error_type };
  }
  const allRows = result.data.rows;
  const offset = Math.max(0, opts.offset ?? 0);
  const maxRows = Math.min(opts.max_rows ?? limits.maxRows, limits.maxRows);
  const rows = allRows.slice(offset, offset + maxRows);
  const metabaseTruncated = (result.data as any).rows_truncated ?? (result as any).row_count >= 2000;

  if (opts.verbose) {
    return { ...result, data: { ...result.data, rows } };
  }

  const out: Record<string, unknown> = {
    status: (result as any).status ?? "completed",
    columns: result.data.cols.map(compactCol),
    rows,
    row_count: rows.length,
    total_rows_returned_by_metabase: allRows.length,
  };
  if (offset) out.offset = offset;
  if ((result as any).running_time !== undefined) out.running_time_ms = (result as any).running_time;

  const more = offset + rows.length < allRows.length;
  const notes: string[] = [];
  if (more) {
    notes.push(
      `Showing rows ${offset + 1}-${offset + rows.length} of ${allRows.length}. ` +
        `Pass offset: ${offset + rows.length} for the next page, or use an export tool with output_path for everything.`
    );
  }
  if (metabaseTruncated && allRows.length >= 2000) {
    notes.push(
      "Metabase itself stops ad-hoc results at 2000 rows; add LIMIT/OFFSET to the query or export to a file for the full set."
    );
  }
  if (notes.length) {
    out.truncated = true;
    out.note = notes.join(" ");
  }
  return out;
};

/**
 * Serialises a tool result compactly and caps its size. JSON is emitted without indentation
 * (about 45% fewer characters than pretty-printed); oversized text is cut with a notice.
 */
export const capText = (text: string, maxChars: number): string => {
  if (text.length <= maxChars) return text;
  return (
    text.slice(0, maxChars) +
    `\n\n[truncated: response was ${text.length} characters, limit is ${maxChars} ` +
    `(METABASE_MAX_RESPONSE_CHARS). Narrow the request (filters, max_rows, offset) or export to a file.]`
  );
};

/** Re-serialise pretty JSON text content compactly; leave non-JSON text alone. */
export const compactJsonText = (text: string): string => {
  const t = text.trimStart();
  if (!(t.startsWith("{") || t.startsWith("["))) return text;
  try {
    return JSON.stringify(JSON.parse(text));
  } catch {
    return text;
  }
};

/** Shared paging/verbosity inputs for tools that return query rows. */
export const resultShapeInputs = {
  max_rows: z.number().int().positive().optional().describe("Max rows to return (capped by METABASE_MAX_ROWS, default 500)"),
  offset: z.number().int().min(0).optional().describe("Skip this many result rows first, for paging through a large result"),
  verbose: z.boolean().optional().describe("Return the raw Metabase response (column internals, results_metadata, insights) instead of the compact columns + rows view"),
};
