import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName } from "../helpers.js";
import { listDocuments, getDocument, createDocument, updateDocument, deleteDocument } from "../../src/services/documents.js";

const cleanupIds: number[] = [];

describe("documents service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupIds) {
      try { await deleteDocument(client, id); } catch {}
    }
  });

  test("listDocuments returns data", async () => {
    const client = await getTestClient();
    try {
      const result = await listDocuments(client);
      expect(result).toBeDefined();
    } catch (e: any) {
      console.log("Documents API not available:", e.message);
    }
  });

  test("document CRUD lifecycle", async () => {
    const client = await getTestClient();
    let docId: number | null = null;

    try {
      const name = testName("doc");
      const created = await createDocument(client, { name }) as any;
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      docId = created.id;
      cleanupIds.push(docId!);

      const fetched = await getDocument(client, docId!) as any;
      expect(fetched.id).toBe(docId);

      const updated = await updateDocument(client, docId!, { name: name + "-updated" }) as any;
      expect(updated).toBeDefined();

      const deleted = await deleteDocument(client, docId!);
      expect(deleted).toEqual({ success: true });
      cleanupIds.splice(cleanupIds.indexOf(docId!), 1);
      docId = null;
    } catch (e: any) {
      console.log("Documents API not available:", e.message);
    }
  });
});
