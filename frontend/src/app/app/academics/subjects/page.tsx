"use client";

import React, { useState } from "react";
import { Table, PersonCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Filter } from "lucide-react";
import Link from "next/link";

interface SubjectsItem {
  id: string;
  name: string;
  code: string;
  department: string;
  classes: string;
  status: string;
}

const mockData: SubjectsItem[] = [
{ id: "1", name: "Mathematics", code: "MTH", department: "Mathematics", classes: "8-12", status: "Active" },
  { id: "2", name: "Physics", code: "PHY", department: "Science", classes: "10-12", status: "Active" },
  { id: "3", name: "Chemistry", code: "CHM", department: "Science", classes: "10-12", status: "Active" },
  { id: "4", name: "English Literature", code: "ENG-LIT", department: "English", classes: "8-12", status: "Active" },
  { id: "5", name: "History", code: "HIS", department: "Social Studies", classes: "8-10", status: "Active" }
];

const columns = [
  { key: "name", header: "Subject", sortable: true, width: "160px" },
      { key: "code", header: "Code", width: "100px" },
      { key: "department", header: "Department", width: "140px" },
      { key: "classes", header: "Classes", width: "120px" },
      { key: "status", header: "Status", width: "100px" }
];

export default function SubjectsListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const filtered = searchQuery
    ? mockData.filter(row =>
        Object.values(row).some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : mockData;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Subjects</h1>
          <p className="text-sm text-mid mt-0.5">Configure subjects offered across classes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Link href="/app/academics/new"><Button size="sm"><Plus className="w-4 h-4" />
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
        onRowClick={(item) => { window.location.href = `/app/academics/${item.id}`; }}
        bulkActions={selectedIds.size > 0 ? <span className="text-sm text-mid">{selectedIds.size} selected</span> : undefined}
        page={1}
        totalPages={3}
        totalItems={filtered.length}
      />
    </div>
  );
}
