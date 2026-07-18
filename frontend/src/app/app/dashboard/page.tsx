"use client";

import React from "react";
import { StatCard, DetailCard } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  DollarSign,
  ClipboardCheck,
  Calendar,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/ui/timeline";
import { ProgressBar } from "@/components/ui/progress";
import { ArrowRight, Plus } from "lucide-react";

export default function InstitutionDashboard() {
  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Dashboard</h1>
          <p className="text-sm text-mid mt-0.5">Welcome back! Here&apos;s your institution overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Calendar className="w-4 h-4" />
            Today
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value="1,248"
          icon={<Users className="w-4.5 h-4.5" />}
          color="brand"
          trend={{ value: 12, direction: "up", label: "vs last month" }}
        />
        <StatCard
          title="Teachers"
          value="64"
          icon={<GraduationCap className="w-4.5 h-4.5" />}
          color="amber"
          trend={{ value: 4, direction: "up", label: "new this month" }}
        />
        <StatCard
          title="Attendance Today"
          value="94.2%"
          icon={<ClipboardCheck className="w-4.5 h-4.5" />}
          color="success"
          trend={{ value: 2.1, direction: "up", label: "vs yesterday" }}
        />
        <StatCard
          title="Fee Collection"
          value="₹84.2L"
          icon={<DollarSign className="w-4.5 h-4.5" />}
          color="info"
          trend={{ value: 5.7, direction: "down", label: "vs target" }}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Recent activity */}
          <DetailCard title="Recent Activity" subtitle="Latest actions across your institution">
            <Timeline
              items={[
                {
                  id: "1",
                  title: "New admission completed",
                  description: "Sarah Johnson enrolled in Class 10-A",
                  timestamp: "2 min ago",
                  color: "success",
                },
                {
                  id: "2",
                  title: "Fee payment received",
                  description: "₹15,000 received from Rahul Sharma (Class 8-B)",
                  timestamp: "1 hour ago",
                  color: "brand",
                },
                {
                  id: "3",
                  title: "Attendance marked",
                  description: "Class 9-C attendance submitted by Mr. Kumar (98% present)",
                  timestamp: "3 hours ago",
                  color: "info",
                },
                {
                  id: "4",
                  title: "Exam results published",
                  description: "Unit Test 2 results published for Class 12 Science",
                  timestamp: "5 hours ago",
                  color: "amber",
                },
                {
                  id: "5",
                  title: "New teacher account created",
                  description: "Dr. Priya Singh added to Mathematics department",
                  timestamp: "1 day ago",
                  color: "violet",
                },
              ]}
            />
            <Button variant="ghost" size="sm" className="mt-2">
              View all activity
              <ArrowRight className="w-4 h-4" />
            </Button>
          </DetailCard>

          {/* Class attendance summary */}
          <DetailCard title="Class Attendance" subtitle="Today's attendance by class">
            <div className="flex flex-col gap-3">
              {[
                { class: "Class 10-A", present: 38, total: 42 },
                { class: "Class 10-B", present: 36, total: 40 },
                { class: "Class 9-A", present: 41, total: 43 },
                { class: "Class 9-B", present: 35, total: 38 },
                { class: "Class 8-A", present: 39, total: 39 },
              ].map((item) => (
                <div key={item.class} className="flex items-center gap-3">
                  <span className="text-sm text-charcoal font-medium w-24 flex-shrink-0">{item.class}</span>
                  <div className="flex-1">
                    <ProgressBar value={Math.round((item.present / item.total) * 100)} size="sm" showLabel />
                  </div>
                </div>
              ))}
            </div>
          </DetailCard>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Upcoming events */}
          <DetailCard title="Upcoming" subtitle="Scheduled events and deadlines">
            <div className="flex flex-col gap-3">
              {[
                { title: "Unit Test 3 begins", date: "Mar 20", type: "exam" },
                { title: "Parent-Teacher Meeting", date: "Mar 22", type: "event" },
                { title: "Fee submission deadline", date: "Mar 25", type: "finance" },
                { title: "Sports Day", date: "Mar 30", type: "event" },
                { title: "Summer Break starts", date: "Apr 5", type: "holiday" },
              ].map((event, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-surface-raised flex flex-col items-center justify-center text-center leading-tight">
                    <span className="text-[10px] font-bold text-brand">{event.date.split(" ")[0]}</span>
                    <span className="text-[8px] text-mid">{event.date.split(" ")[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink font-medium truncate">{event.title}</p>
                  </div>
                  <Badge variant="category">{event.type}</Badge>
                </div>
              ))}
            </div>
          </DetailCard>

          {/* Quick actions */}
          <DetailCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" className="justify-start">
                <ClipboardCheck className="w-4 h-4" />
                Mark Attendance
              </Button>
              <Button variant="secondary" size="sm" className="justify-start">
                <Users className="w-4 h-4" />
                Add Student
              </Button>
              <Button variant="secondary" size="sm" className="justify-start">
                <DollarSign className="w-4 h-4" />
                Record Payment
              </Button>
              <Button variant="secondary" size="sm" className="justify-start">
                <BookOpen className="w-4 h-4" />
                Create Exam
              </Button>
            </div>
          </DetailCard>

          {/* Notifications */}
          <DetailCard title="Notifications">
            <div className="flex flex-col gap-2">
              {[
                { text: "3 pending admission approvals", time: "1h", type: "danger" as const },
                { text: "Salary sheet due for approval", time: "3h", type: "warning" as const },
                { text: "New support ticket received", time: "5h", type: "info" as const },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-2.5 py-1">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", {
                    "bg-danger": n.type === "danger",
                    "bg-accent": n.type === "warning",
                    "bg-info": n.type === "info",
                  })} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink">{n.text}</p>
                    <span className="text-[11px] text-mist">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </DetailCard>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | Record<string, boolean | undefined>)[]): string {
  return classes
    .flatMap((c) => {
      if (typeof c === "string") return c;
      if (typeof c === "object" && c) {
        return Object.entries(c)
          .filter(([, v]) => v)
          .map(([k]) => k);
      }
      return [];
    })
    .join(" ");
}
