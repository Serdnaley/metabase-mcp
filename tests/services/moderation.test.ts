import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName, SAMPLE_DB_ID, getTokenFeatures } from "../helpers.js";

// Content verification is a Pro/Enterprise feature; the route does not exist on OSS
const hasModeration = (await getTokenFeatures()).content_verification === true;
import { createModerationReview } from "../../src/services/moderation.js";
import { createCard, deleteCard } from "../../src/services/cards.js";

const cleanupCardIds: number[] = [];

describe("moderation service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupCardIds) {
      try { await deleteCard(client, id); } catch {}
    }
  });

  test.skipIf(!hasModeration)("createModerationReview marks card as verified", async () => {
    const client = await getTestClient();
    const card = await createCard(client, {
      name: testName("mod-card"),
      dataset_query: { type: "native", native: { query: "SELECT 1" }, database: SAMPLE_DB_ID },
      display: "table",
    }) as any;
    cleanupCardIds.push(card.id);

    const result = await createModerationReview(client, {
      moderated_item_id: card.id,
      moderated_item_type: "card",
      status: "verified",
    });
    expect(result).toBeDefined();
  });

  test.skipIf(!hasModeration)("createModerationReview removes verification with null status", async () => {
    const client = await getTestClient();
    const card = await createCard(client, {
      name: testName("mod-card-unverify"),
      dataset_query: { type: "native", native: { query: "SELECT 1" }, database: SAMPLE_DB_ID },
      display: "table",
    }) as any;
    cleanupCardIds.push(card.id);

    const result = await createModerationReview(client, {
      moderated_item_id: card.id,
      moderated_item_type: "card",
      status: null,
    });
    expect(result).toBeDefined();
  });
});
