"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { notifications, type AppNotification } from "@/lib/notifications";

const dotClasses: Record<AppNotification["tone"], string> = {
  danger: "bg-danger",
  warning: "bg-accent",
  info: "bg-info",
  success: "bg-success",
};

/**
 * Header bell button with a notifications dropdown.
 * - Opens on click, closes on outside click or Escape
 * - Shows an unread badge until "Mark all read" is pressed
 */
export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(notifications.length);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const toggle = () => setOpen((o) => !o);
  const markAllRead = () => setUnread(0);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggle}
        aria-label={open ? "Close notifications" : "Open notifications"}
        aria-expanded={open}
        aria-haspopup="true"
        className="w-8 h-8 flex items-center justify-center rounded-md text-mid hover:bg-surface-raised transition-colors relative"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[320px] max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold font-display text-ink">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-brand hover:underline no-underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[320px] overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-surface-raised transition-colors cursor-pointer"
              >
                <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", dotClasses[n.tone])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink leading-snug">{n.text}</p>
                  <span className="text-[11px] text-mist">{n.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <button className="w-full flex items-center justify-center gap-1 px-4 py-2.5 text-xs text-brand hover:bg-surface-raised transition-colors border-t border-border">
            View all notifications
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
