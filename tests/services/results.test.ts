import { describe, test, expect } from "bun:test";
import { capText, compactJsonText, loadResultLimits, shapeQueryResult } from "../../src/results.js";
import { wrapHandler } from "../../src/registry.js";
import { getTestClient, SAMPLE_DB_ID } from "../helpers.js";
import { executeQuery } from "../../src/services/dataset.js";

const dataset = (n: number) => ({
  status: "completed",
  row_count: n,
  running_time: 12,
  data: {
    rows: Array.from({ length: n }, (_, i) => [i, `name-${i}`]),
    cols: [
      { name: "ID", display_name: "ID", base_type: "type/Integer", field_ref: ["field", 1, null], "lib/source": "x" },
      { name: "NAME", display_name: "Name", base_type: "type/Text", effective_type: "type/Text" },
    ],
    results_metadata: { columns: [{ fingerprint: { big: true } }] },
    insights: [{ a: 1 }],
  },
});

const limits = { maxRows: 5, maxResponseChars: 1000 };

describe("result shaping", () => {
  test("compact view keeps columns + rows, drops metadata", () => {
    const out = shapeQueryResult(dataset(3), limits) as any;
    expect(out.columns).toEqual([
      { name: "ID", type: "type/Integer" },
      { name: "NAME", display_name: "Name", type: "type/Text" },
    ]);
    expect(out.rows).toHaveLength(3);
    expect(out.row_count).toBe(3);
    expect(out.truncated).toBeUndefined();
    expect(JSON.stringify(out)).not.toContain("results_metadata");
  });

  test("row cap and offset paging with a notice", () => {
    const first = shapeQueryResult(dataset(12), limits) as any;
    expect(first.rows).toHaveLength(5);
    expect(first.truncated).toBe(true);
    expect(first.note).toContain("offset: 5");
    const second = shapeQueryResult(dataset(12), limits, { offset: 10 }) as any;
    expect(second.rows.map((r: any) => r[0])).toEqual([10, 11]);
    expect(second.truncated).toBeUndefined();
  });

  test("per-call max_rows cannot exceed the global cap", () => {
    expect((shapeQueryResult(dataset(20), limits, { max_rows: 50 }) as any).rows).toHaveLength(5);
    expect((shapeQueryResult(dataset(20), limits, { max_rows: 2 }) as any).rows).toHaveLength(2);
  });

  test("verbose returns the raw shape (rows still capped)", () => {
    const out = shapeQueryResult(dataset(12), limits, { verbose: true }) as any;
    expect(out.data.results_metadata).toBeDefined();
    expect(out.data.rows).toHaveLength(5);
  });

  test("non-dataset results pass through; failed queries are reduced to the error", () => {
    expect(shapeQueryResult({ id: 1 }, limits)).toEqual({ id: 1 });
    const failed = { ...dataset(0), status: "failed", error: "Syntax error", error_type: "invalid-query" };
    expect(shapeQueryResult(failed, limits)).toEqual({ status: "failed", error: "Syntax error", error_type: "invalid-query" });
  });

  test("capText and compactJsonText", () => {
    expect(capText("abc", 10)).toBe("abc");
    const capped = capText("x".repeat(50), 10);
    expect(capped.startsWith("x".repeat(10))).toBe(true);
    expect(capped).toContain("METABASE_MAX_RESPONSE_CHARS");
    expect(compactJsonText('{\n  "a": 1\n}')).toBe('{"a":1}');
    expect(compactJsonText("not json")).toBe("not json");
  });

  test("loadResultLimits validates env", () => {
    expect(loadResultLimits({})).toEqual({ maxRows: 500, maxResponseChars: 100_000 });
    expect(loadResultLimits({ METABASE_MAX_ROWS: "50", METABASE_MAX_RESPONSE_CHARS: "" })).toEqual({
      maxRows: 50,
      maxResponseChars: 100_000,
    });
    expect(() => loadResultLimits({ METABASE_MAX_ROWS: "0" })).toThrow("METABASE_MAX_ROWS");
  });

  test("wrapHandler compacts and caps every tool response", async () => {
    const handler = wrapHandler(
      (async () => ({ content: [{ type: "text", text: JSON.stringify({ big: "y".repeat(500) }, null, 2) }] })) as any,
      100
    );
    const res = (await (handler as any)({}, {})) as any;
    expect(res.content[0].text.startsWith('{"big":"')).toBe(true);
    expect(res.content[0].text).toContain("[truncated");
  });

  test("live: a 500-row query shrinks well below the raw response", async () => {
    const client = await getTestClient();
    const raw = await executeQuery(client, {
      database: SAMPLE_DB_ID,
      type: "native",
      native: { query: "SELECT * FROM ORDERS LIMIT 500" },
    });
    const shaped = shapeQueryResult(raw, { maxRows: 500, maxResponseChars: 100_000 }) as any;
    expect(shaped.rows).toHaveLength(500);
    expect(JSON.stringify(shaped).length).toBeLessThan(JSON.stringify(raw, null, 2).length * 0.5);
  });
});
