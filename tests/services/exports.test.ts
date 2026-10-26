import { describe, test, expect, afterAll } from "bun:test";
import { existsSync, mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getTestClient, getMetabaseMajor, SAMPLE_DB_ID, testName } from "../helpers.js";
import { exportCardQuery, exportQuery, exportDashboardPdf } from "../../src/services/exports.js";
import { createCard, deleteCard } from "../../src/services/cards.js";
import { createDashboard, deleteDashboard, updateDashboardCards } from "../../src/services/dashboards.js";

const MAJOR = await getMetabaseMajor();
const dir = mkdtempSync(join(tmpdir(), "mb-export-"));
const SQL = "SELECT ID, TOTAL FROM ORDERS WHERE TOTAL > {{minTotal}} ORDER BY ID LIMIT 5";

describe("exports service", () => {
  let cardId: number;
  let dashboardId: number | null = null;
  afterAll(async () => {
    const client = await getTestClient();
    try { await deleteCard(client, cardId); } catch {}
    if (dashboardId) { try { await deleteDashboard(client, dashboardId); } catch {} }
    rmSync(dir, { recursive: true, force: true });
  });

  test("setup: parameterized card", async () => {
    const client = await getTestClient();
    const card = (await createCard(client, {
      name: testName("export-card"),
      display: "table",
      dataset_query: {
        type: "native",
        database: SAMPLE_DB_ID,
        native: {
          query: SQL,
          "template-tags": { minTotal: { id: "mt", name: "minTotal", "display-name": "Min", type: "number" } },
        },
      },
    })) as any;
    cardId = card.id;
  });

  test("csv inline with parameters", async () => {
    const client = await getTestClient();
    const result = (await exportCardQuery(client, cardId, { format: "csv", parameter_values: { minTotal: 100 } })) as any;
    expect(result.format).toBe("csv");
    expect(result.truncated).toBe(false);
    const lines = result.content.trim().split("\n");
    expect(lines[0]).toContain("TOTAL");
    expect(lines.length).toBe(6);
  });

  test("json inline is truncated to max_inline_chars", async () => {
    const client = await getTestClient();
    const result = (await exportCardQuery(client, cardId, {
      format: "json",
      parameter_values: { minTotal: 0 },
      max_inline_chars: 20,
    })) as any;
    expect(result.truncated).toBe(true);
    expect(result.content.length).toBe(20);
    expect(result.note).toContain("output_path");
  });

  test("xlsx needs output_path, then writes the file and refuses to overwrite", async () => {
    const client = await getTestClient();
    await expect(exportCardQuery(client, cardId, { format: "xlsx", parameter_values: { minTotal: 0 } })).rejects.toThrow("output_path");
    const path = join(dir, "out.xlsx");
    const result = (await exportCardQuery(client, cardId, { format: "xlsx", parameter_values: { minTotal: 0 }, output_path: path })) as any;
    expect(result.bytes).toBeGreaterThan(0);
    expect(readFileSync(path).subarray(0, 2).toString()).toBe("PK"); // xlsx is a zip
    await expect(
      exportCardQuery(client, cardId, { format: "xlsx", parameter_values: { minTotal: 0 }, output_path: path })
    ).rejects.toThrow("File exists");
    await expect(exportCardQuery(client, cardId, { format: "csv", output_path: "relative.csv" })).rejects.toThrow("absolute");
  });

  test("export_query exports an ad-hoc query", async () => {
    const client = await getTestClient();
    const result = (await exportQuery(client, {
      format: "csv",
      query: { database: SAMPLE_DB_ID, type: "native", native: { query: "SELECT 1 AS ONE" } },
    })) as any;
    expect(result.content).toContain("ONE");
  });

  test.skipIf(MAJOR < 64)("dashboard PDF is written to output_path", async () => {
    const client = await getTestClient();
    const dash = (await createDashboard(client, { name: testName("pdf-dash") })) as any;
    dashboardId = dash.id;
    await updateDashboardCards(client, dash.id, [{ id: -1, card_id: cardId, row: 0, col: 0, size_x: 12, size_y: 6 }] as any);
    const path = join(dir, "dash.pdf");
    const result = (await exportDashboardPdf(client, dash.id, { output_path: path })) as any;
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path).subarray(0, 4).toString()).toBe("%PDF");
    expect(result.bytes).toBeGreaterThan(1000);
  });
});
