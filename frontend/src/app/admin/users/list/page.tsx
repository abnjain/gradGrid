"use client";

import React, { useState } from "react";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Filter } from "lucide-react";
import Link from "next/link";

interface Item { id: string; name: string; email: string; role: string; institution: string; status: string; }

const mockData: Item[] = [{ id: "1", name: "John Admin", email: "john@gradgrid.io", role: "Super Admin", institution: "Platform", status: "Active" },
  { id: "2", name: "Sarah Support", email: "sarah@gradgrid.io", role: "Support", institution: "Platform", status: "Active" },
  { id: "3", name: "Mike Billing", email: "mike@gradgrid.io", role: "Billing", institution: "Platform", status: "Active" },
  { id: "4", name: "Alice Review", email: "alice@gradgrid.io", role: "Reviewer", institution: "Platform", status: "Inactive" }];

const columns = [{ key: "name", header: "User", sortable: true, width: "240px" },
      { key: "email", header: "Email", width: "240px" },
      { key: "role", header: "Role", width: "100px" },
      { key: "institution", header: "Institution", width: "180px" },
      { key: "status", header: "Status", width: "100px" }];

export default function ListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const filtered = searchQuery ? mockData.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase()))) : mockData;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Platform Users</h1>
          <p className="text-sm text-mid mt-0.5">Manage all users across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm"><Download className="w-4 h-4" />Export</Button>
          <Link href="/admin/users/new"><Button size="sm"><Plus className="w-4 h-4" />Add New</Button></Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-72"><Input placeholder="Search..." iconLeft={<Search className="w-4 h-4" />} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
        <Button variant="ghost" size="sm"><Filter className="w-4 h-4" />Filters</Button>
      </div>
      <Table columns={columns} data={filtered} keyExtractor={i => i.id} selectable selectedIds={selectedIds} onSelectionChange={setSelectedIds} page={1} totalPages={2} totalItems={filtered.length} />
    </div>
  );
}
