/**
 * GradGrid — Notifications
 *
 * Single source of truth for the current user's notifications.
 * Used by the header bell dropdown and the dashboard Notifications card.
 */

export type NotificationTone = "danger" | "warning" | "info" | "success";

export interface AppNotification {
  id: string;
  text: string;
  time: string;
  tone: NotificationTone;
}

export const notifications: AppNotification[] = [
  { id: "notif-1", text: "3 pending admission approvals", time: "1h", tone: "danger" },
  { id: "notif-2", text: "Salary sheet due for approval", time: "3h", tone: "warning" },
  { id: "notif-3", text: "New support ticket received", time: "5h", tone: "info" },
];
