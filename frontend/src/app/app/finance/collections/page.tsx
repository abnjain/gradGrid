"use client";

import React, { useState } from "react";
import { Table, PersonCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Filter } from "lucide-react";
import Link from "next/link";

interface FeeCollectionsItem {
  id: string;
  name: { name: string; subtitle?: string; badge?: { text: string; variant: string } };
  class: string;
  feeType: string;
  amount: string;
  date: string;
  status: string;
}

const mockData: FeeCollectionsItem[] = [
{ id: "1", name: { name: "Aarav Sharma", subtitle: "10-A" }, class: "10-A", feeType: "Tuition Fee", amount: "₹15,000", date: "05 Jul 2026", status: "Paid" },
  { id: "2", name: { name: "Priya Patel", subtitle: "10-A" }, class: "10-A", feeType: "Annual Fee", amount: "₹25,000", date: "03 Jul 2026", status: "Paid" },
  { id: "3", name: { name: "Rahul Verma", subtitle: "9-B" }, class: "9-B", feeType: "Tuition Fee", amount: "₹12,000", date: "01 Jul 2026", status: "Paid" },
  { id: "4", name: { name: "Sneha Reddy", subtitle: "11-C" }, class: "11-C", feeType: "Tuition Fee", amount: "₹18,000", date: "Pending", status: "Pending" },
  { id: "5", name: { name: "Rohit Gupta", subtitle: "10-A" }, class: "10-A", feeType: "Transport Fee", amount: "₹5,000", date: "Overdue", status: "Overdue" }
];

const columns = [
  { key: "name", header: "Student", sortable: true, width: "240px",
    render: (item: FeeCollectionsItem) => <PersonCell person={item.name} /> },
      { key: "class", header: "Class", width: "80px" },
      { key: "feeType", header: "Fee Type", width: "140px" },
      { key: "amount", header: "Amount", width: "120px" },
      { key: "date", header: "Payment Date", width: "120px" },
      { key: "status", header: "Status", width: "100px" }
];

export default function FeeCollectionsListPage() {
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
          <h1 className="text-xl font-bold font-display text-ink">Fee Collections</h1>
          <p className="text-sm text-mid mt-0.5">Track fee payments and collections</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Link href="/app/finance/new"><Button size="sm"><Plus className="w-4 h-4" />
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
        onRowClick={(item) => { window.location.href = `/app/finance/${item.id}`; }}
        bulkActions={selectedIds.size > 0 ? <span className="text-sm text-mid">{selectedIds.size} selected</span> : undefined}
        page={1}
        totalPages={3}
        totalItems={filtered.length}
      />
    </div>
  );
}
