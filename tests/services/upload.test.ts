import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, getWarehouseDbId, skipOnEnvError } from "../helpers.js";
import { uploadCsv } from "../../src/services/upload.js";
import { deleteCard } from "../../src/services/cards.js";

// Uploads need a database that supports them; tests/setup.ts points uploads at the
// optional Postgres "Test Warehouse". Without it only the request shape is checked.
const WAREHOUSE = await getWarehouseDbId();

describe("upload service", () => {
  const cleanup: number[] = [];
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanup) { try { await deleteCard(client, id); } catch {} }
  });

  test.skipIf(WAREHOUSE === null)("uploadCsv creates a model from CSV", async () => {
    const client = await getTestClient();
    const modelId = await uploadCsv(client, { file: "id,name\n1,test\n2,test2", table_name: `mcp_upload_${Date.now()}` });
    expect(typeof modelId).toBe("number");
    cleanup.push(modelId as unknown as number);
  });

  test.skipIf(WAREHOUSE !== null)("uploadCsv sends a valid multipart request", async () => {
    const client = await getTestClient();
    // Reaching Metabase's "uploads not configured" check means the request itself was accepted.
    await skipOnEnvError("uploadCsv", [/uploads database is not configured|uploads are not enabled/i], async () => {
      const result = await uploadCsv(client, { file: "id,name\n1,test\n2,test2", table_name: "test_upload" });
      expect(result).toBeDefined();
    });
  });
});
