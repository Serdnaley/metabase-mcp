import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName } from "../helpers.js";
import { listDocuments, getDocument, createDocument, updateDocument, deleteDocument, textToProseMirror } from "../../src/services/documents.js";

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
    const result = await listDocuments(client);
    expect(result).toBeDefined();
  });

  test("textToProseMirror splits paragraphs on blank lines", () => {
    expect(textToProseMirror("a\n\nb")).toEqual({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "a" }] },
        { type: "paragraph", content: [{ type: "text", text: "b" }] },
      ],
    });
  });

  test("document CRUD lifecycle", async () => {
    const client = await getTestClient();
    const name = testName("doc");
    const created = (await createDocument(client, { name })) as any;
    expect(created.id).toBeDefined();
    cleanupIds.push(created.id);

    const fetched = (await getDocument(client, created.id)) as any;
    expect(fetched.id).toBe(created.id);

    const updated = (await updateDocument(client, created.id, {
      name: name + "-updated",
      text: "Revenue grew.\n\nChurn fell.",
    })) as any;
    expect(updated.name).toBe(name + "-updated");
    expect(JSON.stringify(updated.document)).toContain("Churn fell.");

    const deleted = await deleteDocument(client, created.id);
    expect(deleted).toEqual({ success: true });
    cleanupIds.splice(cleanupIds.indexOf(created.id), 1);
  });
});
