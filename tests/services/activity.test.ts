import { describe, test, expect } from "bun:test";
import { getTestClient } from "../helpers.js";
import { getActivity, getRecentItems, getPopularItems, listTasks, getTask } from "../../src/services/activity.js";

describe("activity service", () => {
  test("getRecentItems returns recents", async () => {
    const client = await getTestClient();
    const result = (await getRecentItems(client, ["views", "selections"])) as any;
    expect(Array.isArray(result.recents)).toBe(true);
  });

  test("getPopularItems returns popular items", async () => {
    const client = await getTestClient();
    const result = (await getPopularItems(client)) as any;
    expect(Array.isArray(result.popular_items)).toBe(true);
  });

  test("getActivity combines recents and popular items", async () => {
    const client = await getTestClient();
    const result = (await getActivity(client)) as any;
    expect(Array.isArray(result.recents)).toBe(true);
    expect(Array.isArray(result.popular_items)).toBe(true);
  });

  test("listTasks returns tasks array", async () => {
    const client = await getTestClient();
    const result = await listTasks(client) as any;
    expect(result).toBeDefined();
  });

  test("getTask returns task details for a valid ID", async () => {
    const client = await getTestClient();
    const tasks = await listTasks(client) as any;
    // Skip if no tasks exist
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) return;
    const firstTask = tasks[0];
    const taskId = firstTask.id;
    const result = await getTask(client, taskId) as any;
    expect(result).toBeDefined();
    expect(result.id).toBe(taskId);
  });

  test("getTask throws for non-existent task", async () => {
    const client = await getTestClient();
    await expect(getTask(client, 999999)).rejects.toThrow("Get task failed");
  });
});
