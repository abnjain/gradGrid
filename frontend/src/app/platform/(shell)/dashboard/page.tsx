"use client";

import React from "react";
import { StatCard, DetailCard } from "@/components/ui/card";
import { Building2, School, Users, Activity } from "lucide-react";
import { Timeline } from "@/components/ui/timeline";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold font-display text-ink">Platform Dashboard</h1>
        <p className="text-sm text-mid mt-0.5">Platform-wide health, metrics, and activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Organizations"
          value="24"
          icon={<Building2 className="w-4.5 h-4.5" />}
          color="brand"
          trend={{ value: 2, direction: "up", label: "this month" }}
        />
        <StatCard
          title="Active Institutions"
          value="156"
          icon={<School className="w-4.5 h-4.5" />}
          color="success"
          trend={{ value: 8, direction: "up", label: "this month" }}
        />
        <StatCard
          title="Platform Users"
          value="1,892"
          icon={<Users className="w-4.5 h-4.5" />}
          color="info"
          trend={{ value: 5.3, direction: "up", label: "vs last month" }}
        />
        <StatCard
          title="System Health"
          value="98.7%"
          icon={<Activity className="w-4.5 h-4.5" />}
          color="amber"
          trend={{ value: 0.3, direction: "down", label: "vs last week" }}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Recent activity */}
          <DetailCard title="Platform Activity" subtitle="Recent actions across the platform">
            <Timeline
              items={[
                {
                  id: "1",
                  title: "New institution provisioned",
                  description: "Sunrise International School added to EduOrg",
                  timestamp: "10 min ago",
                  color: "success",
                },
                {
                  id: "2",
                  title: "Organization subscription updated",
                  description: "EduOrg upgraded to Enterprise plan",
                  timestamp: "1 hour ago",
                  color: "brand",
                },
                {
                  id: "3",
                  title: "System backup completed",
                  description: "Weekly backup: 4.2 GB, 0 failures",
                  timestamp: "2 hours ago",
                  color: "info",
                },
                {
                  id: "4",
                  title: "New admin user created",
                  description: "Support Executive: Ananya Verma",
                  timestamp: "4 hours ago",
                  color: "violet",
                },
                {
                  id: "5",
                  title: "Security audit initiated",
                  description: "Q1 2026 audit started by Security Auditor",
                  timestamp: "1 day ago",
                  color: "amber",
                },
              ]}
            />
            <Button variant="ghost" size="sm" className="mt-2">
              View all activity <ArrowRight className="w-4 h-4" />
            </Button>
          </DetailCard>
        </div>

        <div className="flex flex-col gap-5">
          {/* System alerts */}
          <DetailCard title="System Alerts">
            <div className="flex flex-col gap-2">
              {[
                { text: "3 institutions with expired backups", type: "danger" as const },
                { text: "Storage usage at 78%", type: "warning" as const },
                { text: "2 pending support tickets", type: "info" as const },
                { text: "SSL certificate renewal in 15 days", type: "warning" as const },
              ].map((alert, i) => (
                <div key={i} className="flex items-start gap-2.5 py-1">
                  <div
                    className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", {
                      "bg-danger": alert.type === "danger",
                      "bg-accent": alert.type === "warning",
                      "bg-info": alert.type === "info",
                    })}
                  />
                  <span className="text-sm text-ink">{alert.text}</span>
                </div>
              ))}
            </div>
          </DetailCard>

          {/* Quick stats */}
          <DetailCard title="Quick Stats">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-fog rounded-lg text-center">
                <p className="text-lg font-bold font-display text-ink">12</p>
                <p className="text-[10px] text-mid">Pending approvals</p>
              </div>
              <div className="p-3 bg-fog rounded-lg text-center">
                <p className="text-lg font-bold font-display text-ink">1.2K</p>
                <p className="text-[10px] text-mid">API calls/min</p>
              </div>
              <div className="p-3 bg-fog rounded-lg text-center">
                <p className="text-lg font-bold font-display text-ink">99.2%</p>
                <p className="text-[10px] text-mid">Uptime (30d)</p>
              </div>
              <div className="p-3 bg-fog rounded-lg text-center">
                <p className="text-lg font-bold font-display text-ink">2</p>
                <p className="text-[10px] text-mid">Active issues</p>
              </div>
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
