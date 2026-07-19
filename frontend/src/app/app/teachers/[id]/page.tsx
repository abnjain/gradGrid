"use client";

import React, { useState } from "react";
import { DetailCard, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Timeline } from "@/components/ui/timeline";
import { Tabs, TabContent } from "@/components/ui/tabs";
import { ArrowLeft, Edit, MoreHorizontal, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TeacherDetailsDetailPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/teachers"><Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div>
            <h1 className="text-xl font-bold font-display text-ink">Teacher Details</h1>
            <p className="text-sm text-mid mt-0.5">View complete teacher information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={window.location.pathname + '/edit'}>
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-3">
          <Tabs tabs={[{id:"overview", label:"Overview"}, {id:"activity", label:"Activity"}, {id:"documents", label:"Documents"}]} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <TabContent activeTab={activeTab} id="overview">
        <DetailCard title="Information" className="max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-mid font-medium uppercase tracking-wide">Full Name</span>
              <p className="text-sm text-ink mt-0.5">Dr. Ananya Gupta</p>
            </div>
            <div>
              <span className="text-xs text-mid font-medium uppercase tracking-wide">Department</span>
              <p className="text-sm text-ink mt-0.5">Science</p>
            </div>
            <div>
              <span className="text-xs text-mid font-medium uppercase tracking-wide">Subjects</span>
              <p className="text-sm text-ink mt-0.5">Physics, Chemistry</p>
            </div>
            <div>
              <span className="text-xs text-mid font-medium uppercase tracking-wide">Email</span>
              <p className="text-sm text-ink mt-0.5">ananya.g@school.edu</p>
            </div>
            <div>
              <span className="text-xs text-mid font-medium uppercase tracking-wide">Phone</span>
              <p className="text-sm text-ink mt-0.5">+91 98765 12345</p>
            </div>
            <div>
              <span className="text-xs text-mid font-medium uppercase tracking-wide">Qualification</span>
              <p className="text-sm text-ink mt-0.5">Ph.D. in Physics, B.Ed</p>
            </div>
            <div>
              <span className="text-xs text-mid font-medium uppercase tracking-wide">Experience</span>
              <p className="text-sm text-ink mt-0.5">12 years</p>
            </div>
            <div>
              <span className="text-xs text-mid font-medium uppercase tracking-wide">Join Date</span>
              <p className="text-sm text-ink mt-0.5">01 Apr 2018</p>
            </div>
          </div>
        </DetailCard>
      </TabContent>

      <TabContent activeTab={activeTab} id="activity">
        <DetailCard title="Recent Activity">
          <Timeline
            items={[
              { id: "1", title: "Record created", description: "Entry added to the system", timestamp: "2 days ago", color: "brand" },
              { id: "2", title: "Profile updated", description: "Information was modified", timestamp: "1 week ago", color: "info" },
            ]}
          />
        </DetailCard>
      </TabContent>

      <TabContent activeTab={activeTab} id="documents">
        <Card className="p-12 flex flex-col items-center justify-center">
          <p className="text-sm text-mid">No documents attached yet.</p>
        </Card>
      </TabContent>
    </div>
  );
}
