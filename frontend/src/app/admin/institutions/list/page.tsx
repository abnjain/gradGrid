"use client";

import React, { useState } from "react";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Filter } from "lucide-react";
import Link from "next/link";

interface Item { id: string; name: string; org: string; plan: string; students: string; status: string; }

const mockData: Item[] = [{ id: "1", name: "Springfield High School", org: "EduTrust", plan: "Enterprise", students: "1,248", status: "Active" },
  { id: "2", name: "Riverside Academy", org: "EduTrust", plan: "Professional", students: "856", status: "Active" },
  { id: "3", name: "Mountain View School", org: "LearnCorp", plan: "Starter", students: "342", status: "Active" },
  { id: "4", name: "Sunrise International", org: "LearnCorp", plan: "Enterprise", students: "2,100", status: "Suspended" }];

const columns = [{ key: "name", header: "Institution", sortable: true, width: "260px" },
      { key: "org", header: "Organization", width: "160px" },
      { key: "plan", header: "Plan", width: "100px" },
      { key: "students", header: "Students", width: "90px" },
      { key: "status", header: "Status", width: "100px" }];

export default function ListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const filtered = searchQuery ? mockData.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase()))) : mockData;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-ink">All Institutions</h1>
          <p className="text-sm text-mid mt-0.5">View and manage all registered institutions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm"><Download className="w-4 h-4" />Export</Button>
          <Link href="/admin/institutions/new"><Button size="sm"><Plus className="w-4 h-4" />Add New</Button></Link>
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
