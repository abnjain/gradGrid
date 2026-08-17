"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  DollarSign,
  Plus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    label: "Mark Attendance",
    description: "Mark attendance for a class",
    href: "/app/attendance",
    icon: <ClipboardCheck className="w-4 h-4" />,
  },
  {
    label: "Add Student",
    description: "Enroll a new student",
    href: "/app/students",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Record Payment",
    description: "Record a fee payment",
    href: "/app/finance",
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    label: "Create Exam",
    description: "Schedule an examination",
    href: "/app/examination",
    icon: <BookOpen className="w-4 h-4" />,
  },
];

/**
 * "Quick Action" button with a dropdown menu of common tasks.
 * - Opens on click, closes on outside click, Escape, or after selecting an item
 */
export function QuickActionsMenu() {
  const [open, setOpen] = useState(false);
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

  return (
    <div className="relative" ref={containerRef}>
      <Button
        size="sm"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Plus className="w-4 h-4" />
        Quick Action
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50"
        >
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-mist">Quick Actions</p>
          </div>
          <div className="py-1">
            {quickActions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-raised transition-colors no-underline group"
              >
                <span className="w-8 h-8 rounded-lg bg-brand-dim text-brand flex items-center justify-center shrink-0 group-hover:bg-brand group-hover:text-white transition-colors duration-200">
                  {a.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-ink">{a.label}</span>
                  <span className="block text-[11px] text-mist truncate">{a.description}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-mist flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
