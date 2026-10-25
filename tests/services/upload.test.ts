import { describe, test, expect } from "bun:test";
import { getTestClient, skipOnEnvError } from "../helpers.js";
import { uploadCsv } from "../../src/services/upload.js";

describe("upload service", () => {
  test("uploadCsv sends a valid multipart request", async () => {
    const client = await getTestClient();
    // A real upload needs an uploads database (Postgres/MySQL) configured in Metabase;
    // reaching that check means the request itself was accepted.
    await skipOnEnvError("uploadCsv", [/uploads database is not configured|uploads are not enabled/i], async () => {
      const result = await uploadCsv(client, { file: "id,name\n1,test\n2,test2", table_name: "test_upload" });
      expect(result).toBeDefined();
    });
  });
});
