"use client";

import React, { useState } from "react";
import { Table, PersonCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Filter } from "lucide-react";
import Link from "next/link";

interface ExaminationResultsItem {
  id: string;
  name: { name: string; subtitle?: string; badge?: { text: string; variant: string } };
  exam: string;
  class: string;
  total: string;
  percentage: string;
  grade: string;
  status: string;
}

const mockData: ExaminationResultsItem[] = [
{ id: "1", name: { name: "Aarav Sharma", subtitle: "10-A" }, exam: "Mid-Term 2026", class: "10-A", total: "468/500", percentage: "93.6%", grade: "A+", status: "Pass" },
  { id: "2", name: { name: "Priya Patel", subtitle: "10-A" }, exam: "Mid-Term 2026", class: "10-A", total: "445/500", percentage: "89.0%", grade: "A", status: "Pass" },
  { id: "3", name: { name: "Rahul Verma", subtitle: "9-B" }, exam: "Mid-Term 2026", class: "9-B", total: "382/500", percentage: "76.4%", grade: "B+", status: "Pass" },
  { id: "4", name: { name: "Sneha Reddy", subtitle: "11-C" }, exam: "Mid-Term 2026", class: "11-C", total: "410/500", percentage: "82.0%", grade: "A", status: "Pass" },
  { id: "5", name: { name: "Vikas Joshi", subtitle: "10-A" }, exam: "Mid-Term 2026", class: "10-A", total: "312/500", percentage: "62.4%", grade: "C", status: "Pass" }
];

const columns = [
  { key: "name", header: "Student", sortable: true, width: "240px",
    render: (item: any) => <PersonCell person={item.name} /> },
      { key: "exam", header: "Examination", width: "160px" },
      { key: "class", header: "Class", width: "80px" },
      { key: "total", header: "Total Marks", width: "100px" },
      { key: "percentage", header: "Percentage", width: "100px" },
      { key: "grade", header: "Grade", width: "80px" },
      { key: "status", header: "Status", width: "100px" }
];

export default function ExaminationResultsListPage() {
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
          <h1 className="text-xl font-bold font-display text-ink">Examination Results</h1>
          <p className="text-sm text-mid mt-0.5">View and manage student examination results</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Link href="/app/examination/new"><Button size="sm"><Plus className="w-4 h-4" />
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
        onRowClick={(item) => { window.location.href = `/app/examination/${item.id}`; }}
        bulkActions={selectedIds.size > 0 ? <span className="text-sm text-mid">{selectedIds.size} selected</span> : undefined}
        page={1}
        totalPages={3}
        totalItems={filtered.length}
      />
    </div>
  );
}
