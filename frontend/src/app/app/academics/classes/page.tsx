"use client";

import React, { useState } from "react";
import { Table, PersonCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Filter } from "lucide-react";
import Link from "next/link";

interface ClassesItem {
  id: string;
  name: string;
  sections: string;
  students: string;
  teachers: string;
  status: string;
}

const mockData: ClassesItem[] = [
{ id: "1", name: "Class 8", sections: "A, B, C", students: "96", teachers: "8", status: "Active" },
  { id: "2", name: "Class 9", sections: "A, B", students: "64", teachers: "6", status: "Active" },
  { id: "3", name: "Class 10", sections: "A, B, C, D", students: "128", teachers: "10", status: "Active" },
  { id: "4", name: "Class 11", sections: "A, B", students: "48", teachers: "5", status: "Active" },
  { id: "5", name: "Class 12", sections: "A", students: "32", teachers: "4", status: "Active" }
];

const columns = [
  { key: "name", header: "Class", sortable: true, width: "120px" },
      { key: "sections", header: "Sections", width: "200px" },
      { key: "students", header: "Students", width: "100px" },
      { key: "teachers", header: "Teachers", width: "100px" },
      { key: "status", header: "Status", width: "100px" }
];

export default function ClassesListPage() {
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
          <h1 className="text-xl font-bold font-display text-ink">Classes</h1>
          <p className="text-sm text-mid mt-0.5">Manage academic classes and sections</p>
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
