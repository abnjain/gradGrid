"use client";

import React, { useState } from "react";
import { Table, PersonCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Filter } from "lucide-react";
import Link from "next/link";

interface IssueBooksItem {
  id: string;
  name: { name: string; subtitle?: string; badge?: { text: string; variant: string } };
  book: string;
  issueDate: string;
  dueDate: string;
  status: string;
}

const mockData: IssueBooksItem[] = [
{ id: "1", name: { name: "Aarav Sharma", subtitle: "10-A" }, book: "The Great Gatsby", issueDate: "10 Jul 2026", dueDate: "24 Jul 2026", status: "Issued" },
  { id: "2", name: { name: "Priya Patel", subtitle: "10-A" }, book: "To Kill a Mockingbird", issueDate: "08 Jul 2026", dueDate: "22 Jul 2026", status: "Issued" },
  { id: "3", name: { name: "Mr. Rajesh Kumar", subtitle: "Teacher" }, book: "Advanced Mathematics", issueDate: "01 Jul 2026", dueDate: "15 Jul 2026", status: "Overdue" },
  { id: "4", name: { name: "Sneha Reddy", subtitle: "11-C" }, book: "The Origin of Species", issueDate: "12 Jul 2026", dueDate: "26 Jul 2026", status: "Issued" }
];

const columns = [
  { key: "name", header: "Borrower", sortable: true, width: "240px",
    render: (item: IssueBooksItem) => <PersonCell person={item.name as any} />
  },
      { key: "book", header: "Book", width: "200px" },
      { key: "issueDate", header: "Issue Date", width: "120px" },
      { key: "dueDate", header: "Due Date", width: "120px" },
      { key: "status", header: "Status", width: "100px" }
];

export default function IssueBooksListPage() {
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
          <h1 className="text-xl font-bold font-display text-ink">Issue Books</h1>
          <p className="text-sm text-mid mt-0.5">Issue library books to students and staff</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Link href="/app/library/new"><Button size="sm"><Plus className="w-4 h-4" />
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
        onRowClick={(item) => { window.location.href = `/app/library/${item.id}`; }}
        bulkActions={selectedIds.size > 0 ? <span className="text-sm text-mid">{selectedIds.size} selected</span> : undefined}
        page={1}
        totalPages={3}
        totalItems={filtered.length}
      />
    </div>
  );
}
