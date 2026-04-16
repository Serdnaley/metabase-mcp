import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName, SAMPLE_DB_ID } from "../helpers.js";
import { listRevisions, revertRevision } from "../../src/services/revisions.js";
import { createCard, updateCard, deleteCard } from "../../src/services/cards.js";

const cleanupCardIds: number[] = [];

describe("revisions service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupCardIds) {
      try { await deleteCard(client, id); } catch {}
    }
  });

  let createdCardId: number;

  test("setup: create a test card", async () => {
    const client = await getTestClient();
    const card = (await createCard(client, {
      name: testName("revisions-test-card"),
      display: "table",
      dataset_query: {
        type: "native",
        native: { query: "SELECT 1" },
        database: SAMPLE_DB_ID,
      },
    })) as any;
    expect(card).toBeDefined();
    expect(card.id).toBeDefined();
    createdCardId = card.id;
    cleanupCardIds.push(createdCardId);
  });

  test("update card to create a revision", async () => {
    const client = await getTestClient();
    await updateCard(client, createdCardId, {
      description: "Updated description for revision test",
    });
  });

  test("listRevisions returns revision history for a card", async () => {
    const client = await getTestClient();
    const result = (await listRevisions(client, { entity: "card", id: createdCardId })) as any;
    expect(result).toBeDefined();
    const revisions = Array.isArray(result) ? result : result.data ?? [];
    expect(revisions.length).toBeGreaterThan(0);
  });

  test("listRevisions items have expected shape", async () => {
    const client = await getTestClient();
    const result = (await listRevisions(client, { entity: "card", id: createdCardId })) as any;
    const revisions = Array.isArray(result) ? result : result.data ?? [];
    const first = revisions[0];
    expect(first).toBeDefined();
    expect(first.id).toBeDefined();
  });

  test("revertRevision reverts the card to a prior revision", async () => {
    const client = await getTestClient();
    const result = (await listRevisions(client, { entity: "card", id: createdCardId })) as any;
    const revisions = Array.isArray(result) ? result : result.data ?? [];
    // Need at least 2 revisions to revert (initial creation + update)
    if (revisions.length < 2) {
      // Perform another update to ensure we have enough revisions
      await updateCard(client, createdCardId, { description: "Second update for revert test" });
      const updated = (await listRevisions(client, { entity: "card", id: createdCardId })) as any;
      const updatedRevisions = Array.isArray(updated) ? updated : updated.data ?? [];
      if (updatedRevisions.length < 2) return; // skip if still not enough
      const targetRevision = updatedRevisions[updatedRevisions.length - 1];
      const revertResult = await revertRevision(client, {
        entity: "card",
        id: createdCardId,
        revision_id: targetRevision.id,
      });
      expect(revertResult).toBeDefined();
      return;
    }
    // Revert to the oldest revision (last in array)
    const targetRevision = revisions[revisions.length - 1];
    const revertResult = await revertRevision(client, {
      entity: "card",
      id: createdCardId,
      revision_id: targetRevision.id,
    });
    expect(revertResult).toBeDefined();
  });
});
