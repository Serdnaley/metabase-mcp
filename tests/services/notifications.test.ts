import { describe, test, expect, afterAll } from "bun:test";
import { getTestClient, testName, SAMPLE_DB_ID, skipOnEnvError } from "../helpers.js";
import {
  listNotifications,
  sendNotificationNow,
  listAlerts,
  getAlert,
  createAlert,
  updateAlert,
  deleteAlert,
  listDashboardSubscriptions,
  createDashboardSubscription,
  updateDashboardSubscription,
  deleteDashboardSubscription,
} from "../../src/services/notifications.js";
import { createDashboard, deleteDashboard, updateDashboardCards } from "../../src/services/dashboards.js";
import { createCard, deleteCard } from "../../src/services/cards.js";
import { getCurrentUser } from "../../src/services/users.js";

const cleanupDashboardIds: number[] = [];
const cleanupCardIds: number[] = [];

const asArray = (r: any) => (Array.isArray(r) ? r : r?.data ?? r);

describe("notifications service", () => {
  afterAll(async () => {
    const client = await getTestClient();
    for (const id of cleanupDashboardIds) { try { await deleteDashboard(client, id); } catch {} }
    for (const id of cleanupCardIds) { try { await deleteCard(client, id); } catch {} }
  });

  let cardId: number;
  let userId: number;
  let alertId: number;

  test("setup: card + current user", async () => {
    const client = await getTestClient();
    const card = (await createCard(client, {
      name: testName("alert-card"),
      display: "table",
      dataset_query: { type: "native", native: { query: "SELECT 1" }, database: SAMPLE_DB_ID },
    })) as any;
    cardId = card.id;
    cleanupCardIds.push(cardId);
    userId = ((await getCurrentUser(client)) as any).id;
  });

  test("listAlerts returns an array", async () => {
    const client = await getTestClient();
    expect(Array.isArray(asArray(await listAlerts(client)))).toBe(true);
  });

  test("createAlert creates a card notification", async () => {
    const client = await getTestClient();
    const result = (await createAlert(client, {
      card_id: cardId,
      channels: [{ type: "email", user_ids: [userId] }],
    })) as any;
    expect(result.id).toBeDefined();
    expect(result.payload_type).toBe("notification/card");
    expect(result.payload.card_id).toBe(cardId);
    alertId = result.id;
  });

  test("listNotifications filters by payload type and card", async () => {
    const client = await getTestClient();
    const all = asArray(await listNotifications(client, { payload_type: "notification/card", card_id: cardId }));
    expect(all.some((n: any) => n.id === alertId)).toBe(true);
  });

  test("sendNotificationNow sends (or reports missing email setup)", async () => {
    const client = await getTestClient();
    await skipOnEnvError("send notification", [/email|smtp|channel/i], async () => {
      expect(await sendNotificationNow(client, alertId)).toEqual({ success: true });
    });
  });

  test("listAlerts filters by card", async () => {
    const client = await getTestClient();
    const alerts = asArray(await listAlerts(client, { card_id: cardId }));
    expect(alerts.map((a: any) => a.id)).toContain(alertId);
  });

  test("getAlert returns the alert", async () => {
    const client = await getTestClient();
    const result = (await getAlert(client, alertId)) as any;
    expect(result.id).toBe(alertId);
  });

  test("updateAlert changes condition and schedule", async () => {
    const client = await getTestClient();
    const result = (await updateAlert(client, alertId, {
      send_condition: "goal_above",
      cron_schedule: "0 0 * * * ? *",
    })) as any;
    expect(result.payload.send_condition).toBe("goal_above");
    expect(result.subscriptions[0].cron_schedule).toBe("0 0 * * * ? *");
  });

  test("deleteAlert deactivates the alert", async () => {
    const client = await getTestClient();
    expect(await deleteAlert(client, alertId)).toEqual({ success: true });
    const active = asArray(await listAlerts(client, { card_id: cardId }));
    expect(active.map((a: any) => a.id)).not.toContain(alertId);
    const all = asArray(await listAlerts(client, { card_id: cardId, include_inactive: true }));
    expect(all.find((a: any) => a.id === alertId)?.active).toBe(false);
  });

  test("getAlert throws for non-existent alert", async () => {
    const client = await getTestClient();
    await expect(getAlert(client, 999999)).rejects.toThrow();
  });

  test("dashboard subscription lifecycle", async () => {
    const client = await getTestClient();
    const dashboard = (await createDashboard(client, { name: testName("sub-dash") })) as any;
    cleanupDashboardIds.push(dashboard.id);
    await updateDashboardCards(client, dashboard.id, [
      { card_id: cardId, row: 0, col: 0, size_x: 6, size_y: 4 },
    ]);

    expect(asArray(await listDashboardSubscriptions(client, dashboard.id))).toEqual([]);

    const sub = (await createDashboardSubscription(client, dashboard.id, {
      channels: [
        { channel_type: "email", enabled: true, recipients: [{ id: userId }], schedule_type: "daily", schedule_hour: 9 },
      ],
    })) as any;
    expect(sub.id).toBeDefined();
    expect(sub.dashboard_id).toBe(dashboard.id);
    expect(sub.cards.length).toBe(1);

    const listed = asArray(await listDashboardSubscriptions(client, dashboard.id));
    expect(listed.map((s: any) => s.id)).toContain(sub.id);

    const renamed = (await updateDashboardSubscription(client, sub.id, { name: "renamed" })) as any;
    expect(renamed.name).toBe("renamed");

    expect(await deleteDashboardSubscription(client, sub.id)).toEqual({ success: true });
    const after = asArray(await listDashboardSubscriptions(client, dashboard.id));
    expect(after.map((s: any) => s.id)).not.toContain(sub.id);
  });
});
