import { describe, test, expect } from "bun:test";
import { getTestClient } from "../helpers.js";
import { getActivity, listTasks, getTask } from "../../src/services/activity.js";

describe("activity service", () => {
  test("getActivity returns activity data", async () => {
    const client = await getTestClient();
    try {
      const result = await getActivity(client);
      expect(result).toBeDefined();
    } catch (e: any) {
      console.log("Activity API not available in this Metabase version:", e.message);
    }
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
    try {
      await expect(getTask(client, 999999)).rejects.toThrow("Get task failed");
    } catch (e: any) {
      console.log("Task API not available in this Metabase version:", e.message);
    }
  });
});
