"use client";

import React, { useState } from "react";
import { Table, PersonCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Filter } from "lucide-react";
import Link from "next/link";

interface TeachersItem {
  id: string;
  name: { name: string; subtitle?: string; badge?: { text: string; variant: string } };
  department: string;
  subjects: string;
  classes: string;
  status: string;
}

const mockData: TeachersItem[] = [
{ id: "1", name: { name: "Dr. Ananya Gupta", subtitle: "ananya.g@school.edu", badge: { text: "Active", variant: "status-active" } }, department: "Science", subjects: "Physics, Chemistry", classes: "11, 12", status: "Active" },
  { id: "2", name: { name: "Mr. Rajesh Kumar", subtitle: "rajesh.k@school.edu", badge: { text: "Active", variant: "status-active" } }, department: "Mathematics", subjects: "Algebra, Calculus", classes: "10, 11, 12", status: "Active" },
  { id: "3", name: { name: "Ms. Meera Iyer", subtitle: "meera.i@school.edu", badge: { text: "Active", variant: "status-active" } }, department: "English", subjects: "Literature, Grammar", classes: "9, 10", status: "Active" },
  { id: "4", name: { name: "Mr. Sunil Rao", subtitle: "sunil.r@school.edu", badge: { text: "On Leave", variant: "status-pending" } }, department: "Social Studies", subjects: "History, Geography", classes: "8, 9, 10", status: "On Leave" },
  { id: "5", name: { name: "Ms. Pooja Singh", subtitle: "pooja.s@school.edu", badge: { text: "Active", variant: "status-active" } }, department: "Science", subjects: "Biology", classes: "10, 11", status: "Active" }
];

const columns = [
  { key: "name", header: "Teacher", sortable: true, width: "280px",
    render: (item: TeachersItem) => <PersonCell person={item.name} /> },
      { key: "department", header: "Department", sortable: true, width: "140px" },
      { key: "subjects", header: "Subjects", width: "180px" },
      { key: "classes", header: "Classes", width: "100px" },
      { key: "status", header: "Status", width: "100px" }
];

export default function TeachersListPage() {
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
          <h1 className="text-xl font-bold font-display text-ink">Teachers</h1>
          <p className="text-sm text-mid mt-0.5">View and manage all teaching staff</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Link href="/app/teachers/new"><Button size="sm"><Plus className="w-4 h-4" />
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
        onRowClick={(item) => { window.location.href = `/app/teachers/${item.id}`; }}
        bulkActions={selectedIds.size > 0 ? <span className="text-sm text-mid">{selectedIds.size} selected</span> : undefined}
        page={1}
        totalPages={3}
        totalItems={filtered.length}
      />
    </div>
  );
}
