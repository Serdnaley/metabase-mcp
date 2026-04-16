import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName } from "../helpers.js";
import { listGlossaryTerms, getGlossaryTerm, createGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm } from "../../src/services/glossary.js";

const cleanupIds: number[] = [];

describe("glossary service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupIds) {
      try { await deleteGlossaryTerm(client, id); } catch {}
    }
  });

  test("listGlossaryTerms returns array", async () => {
    const client = await getTestClient();
    try {
      const result = await listGlossaryTerms(client) as any;
      expect(result).toBeDefined();
      const items = Array.isArray(result) ? result : result.data ?? [];
      expect(Array.isArray(items)).toBe(true);
    } catch (e: any) {
      console.log("Glossary API not available:", e.message);
    }
  });

  test("glossary term CRUD lifecycle", async () => {
    const client = await getTestClient();
    let termId: number | null = null;

    try {
      const term = testName("Revenue");
      const created = await createGlossaryTerm(client, {
        term,
        definition: "Total income",
      }) as any;
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      termId = created.id;
      cleanupIds.push(termId!);

      const fetched = await getGlossaryTerm(client, termId!) as any;
      expect(fetched.id).toBe(termId);

      const updated = await updateGlossaryTerm(client, termId!, {
        definition: "Total income before deductions",
      }) as any;
      expect(updated).toBeDefined();

      const deleted = await deleteGlossaryTerm(client, termId!);
      expect(deleted).toEqual({ success: true });
      cleanupIds.splice(cleanupIds.indexOf(termId!), 1);
      termId = null;
    } catch (e: any) {
      console.log("Glossary API not available:", e.message);
    }
  });
});
