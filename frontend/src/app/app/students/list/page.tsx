"use client";

import React, { useState } from "react";
import { Table, PersonCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Filter } from "lucide-react";
import Link from "next/link";

interface StudentsItem {
  id: string;
  name: { name: string; subtitle?: string; badge?: { text: string; variant: string } };
  class: string;
  rollNo: string;
  gender: string;
  status: string;
}

const mockData: StudentsItem[] = [
{ id: "1", name: { name: "Aarav Sharma", subtitle: "aarav.sharma@school.edu", badge: { text: "Active", variant: "status-active" } }, class: "10-A", rollNo: "10101", gender: "Male", status: "Active" },
  { id: "2", name: { name: "Priya Patel", subtitle: "priya.p@school.edu", badge: { text: "Active", variant: "status-active" } }, class: "10-A", rollNo: "10102", gender: "Female", status: "Active" },
  { id: "3", name: { name: "Rahul Verma", subtitle: "rahul.v@school.edu", badge: { text: "Active", variant: "status-active" } }, class: "9-B", rollNo: "9021", gender: "Male", status: "Active" },
  { id: "4", name: { name: "Sneha Reddy", subtitle: "sneha.r@school.edu", badge: { text: "Active", variant: "status-active" } }, class: "11-C", rollNo: "11015", gender: "Female", status: "Active" },
  { id: "5", name: { name: "Arjun Singh", subtitle: "arjun.s@school.edu", badge: { text: "Inactive", variant: "status-inactive" } }, class: "12-A", rollNo: "12003", gender: "Male", status: "Inactive" },
  { id: "6", name: { name: "Kavya Nair", subtitle: "kavya.n@school.edu", badge: { text: "Active", variant: "status-active" } }, class: "8-A", rollNo: "8012", gender: "Female", status: "Active" }
];

const columns = [
  { key: "name", header: "Student", sortable: true, width: "280px",
    render: (item: any) => <PersonCell person={item.name} /> },
      { key: "class", header: "Class", sortable: true, width: "100px" },
      { key: "rollNo", header: "Roll No", width: "100px" },
      { key: "gender", header: "Gender", width: "90px" },
      { key: "status", header: "Status", width: "100px" }
];

export default function StudentsListPage() {
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
          <h1 className="text-xl font-bold font-display text-ink">Students</h1>
          <p className="text-sm text-mid mt-0.5">View and manage all enrolled students</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Link href="/app/students/new"><Button size="sm"><Plus className="w-4 h-4" />
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
        onRowClick={(item) => { window.location.href = `/app/students/${item.id}`; }}
        bulkActions={selectedIds.size > 0 ? <span className="text-sm text-mid">{selectedIds.size} selected</span> : undefined}
        page={1}
        totalPages={3}
        totalItems={filtered.length}
      />
    </div>
  );
}
