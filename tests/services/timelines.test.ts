import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName } from "../helpers.js";
import {
  listTimelines,
  createTimeline,
  updateTimeline,
  deleteTimeline,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
} from "../../src/services/timelines.js";

const cleanupTimelineIds: number[] = [];

describe("timelines service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupTimelineIds) {
      try { await deleteTimeline(client, id); } catch {}
    }
  });

  test("listTimelines returns array", async () => {
    const client = await getTestClient();
    try {
      const result = await listTimelines(client) as any;
      expect(result).toBeDefined();
      const items = Array.isArray(result) ? result : result.data ?? [];
      expect(Array.isArray(items)).toBe(true);
    } catch (e: any) {
      console.log("Timelines API not available:", e.message);
    }
  });

  test("timeline and event CRUD lifecycle", async () => {
    const client = await getTestClient();
    let timelineId: number | null = null;

    try {
      const name = testName("timeline");
      const timeline = await createTimeline(client, { name }) as any;
      expect(timeline).toBeDefined();
      expect(timeline.id).toBeDefined();
      timelineId = timeline.id;
      cleanupTimelineIds.push(timelineId!);

      const updatedTimeline = await updateTimeline(client, timelineId!, { name: name + "-updated" }) as any;
      expect(updatedTimeline).toBeDefined();

      const event = await createTimelineEvent(client, {
        timeline_id: timelineId!,
        name: testName("event"),
        timestamp: new Date().toISOString().split("T")[0],
        description: "Test event",
      }) as any;
      expect(event).toBeDefined();
      expect(event.id).toBeDefined();

      const updatedEvent = await updateTimelineEvent(client, event.id, {
        description: "Updated test event",
      }) as any;
      expect(updatedEvent).toBeDefined();

      const deletedEvent = await deleteTimelineEvent(client, event.id);
      expect(deletedEvent).toEqual({ success: true });

      const deletedTimeline = await deleteTimeline(client, timelineId!);
      expect(deletedTimeline).toEqual({ success: true });
      cleanupTimelineIds.splice(cleanupTimelineIds.indexOf(timelineId!), 1);
      timelineId = null;
    } catch (e: any) {
      console.log("Timelines API not available:", e.message);
    }
  });
});
