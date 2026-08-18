"use client";

import React, { useState } from "react";
import { Table, PersonCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Filter } from "lucide-react";
import Link from "next/link";

interface MarkAttendanceItem {
  id: string;
  name: { name: string; subtitle?: string; badge?: { text: string; variant: string } };
  rollNo: string;
  status: string;
}

const mockData: MarkAttendanceItem[] = [
{ id: "1", name: { name: "Aarav Sharma", subtitle: "Class 10-A" }, rollNo: "10101", status: "Present" },
  { id: "2", name: { name: "Priya Patel", subtitle: "Class 10-A" }, rollNo: "10102", status: "Present" },
  { id: "3", name: { name: "Rohit Gupta", subtitle: "Class 10-A" }, rollNo: "10103", status: "Absent" },
  { id: "4", name: { name: "Ananya Singh", subtitle: "Class 10-A" }, rollNo: "10104", status: "Present" },
  { id: "5", name: { name: "Vikas Joshi", subtitle: "Class 10-A" }, rollNo: "10105", status: "Late" },
  { id: "6", name: { name: "Neha Kapoor", subtitle: "Class 10-A" }, rollNo: "10106", status: "Present" }
];

const columns = [
  { key: "name", header: "Student", sortable: true, width: "280px",
    render: (item: MarkAttendanceItem) => <PersonCell person={item.name} /> },
      { key: "rollNo", header: "Roll No", width: "90px" },
      { key: "status", header: "Attendance", width: "120px" }
];

export default function MarkAttendanceListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const filtered = searchQuery
    ? mockData.filter(row =>
        String(row.name?.name || row.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockData;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Mark Attendance</h1>
          <p className="text-sm text-mid mt-0.5">Mark attendance for a class</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Link href="/app/attendance/new"><Button size="sm"><Plus className="w-4 h-4" />
              Add New</Button></Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder="Search..."
            iconLeft={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="sm">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(item) => item.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(item) => { window.location.href = `/app/attendance/${item.id}`; }}
        bulkActions={selectedIds.size > 0 ? <span className="text-sm text-mid">{selectedIds.size} selected</span> : undefined}
        page={1}
        totalPages={3}
        totalItems={filtered.length}
      />
    </div>
  );
}
