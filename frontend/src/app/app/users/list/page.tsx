"use client";

import React, { useState } from "react";
import { Table, PersonCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Filter } from "lucide-react";
import Link from "next/link";

interface UsersItem {
  id: string;
  name: { name: string; subtitle?: string; badge?: { text: string; variant: string } };
  role: string;
  email: string;
  lastActive: string;
  status: string;
}

const mockData: UsersItem[] = [
{ id: "1", name: { name: "Dr. Ananya Gupta", subtitle: "Science HOD", badge: { text: "Admin", variant: "role-admin" } }, role: "Admin", email: "ananya.g@school.edu", lastActive: "2 min ago", status: "Active" },
  { id: "2", name: { name: "Mr. Rajesh Kumar", subtitle: "Math Teacher", badge: { text: "Teacher", variant: "role-teacher" } }, role: "Teacher", email: "rajesh.k@school.edu", lastActive: "15 min ago", status: "Active" },
  { id: "3", name: { name: "Ms. Meera Iyer", subtitle: "English Teacher", badge: { text: "Teacher", variant: "role-teacher" } }, role: "Teacher", email: "meera.i@school.edu", lastActive: "1 hour ago", status: "Active" },
  { id: "4", name: { name: "Mr. Amit Kumar", subtitle: "Accountant", badge: { text: "Accountant", variant: "role-accountant" } }, role: "Accountant", email: "amit.k@school.edu", lastActive: "3 hours ago", status: "Active" },
  { id: "5", name: { name: "Ms. Sunita Verma", subtitle: "HR Manager", badge: { text: "HR", variant: "role-hr" } }, role: "HR", email: "sunita.v@school.edu", lastActive: "Yesterday", status: "Active" }
];

const columns = [
  { key: "name", header: "User", sortable: true, width: "280px",
    render: (item: {name: any}) => <PersonCell person={item.name} /> },
      { key: "role", header: "Role", width: "120px" },
      { key: "email", header: "Email", width: "220px" },
      { key: "lastActive", header: "Last Active", width: "140px" },
      { key: "status", header: "Status", width: "100px" }
];

export default function UsersListPage() {
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
          <h1 className="text-xl font-bold font-display text-ink">Users</h1>
          <p className="text-sm text-mid mt-0.5">Manage all system users and their access</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Link href="/app/users/new"><Button size="sm"><Plus className="w-4 h-4" />
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
        onRowClick={(item) => { window.location.href = `/app/users/${item.id}`; }}
        bulkActions={selectedIds.size > 0 ? <span className="text-sm text-mid">{selectedIds.size} selected</span> : undefined}
        page={1}
        totalPages={3}
        totalItems={filtered.length}
      />
    </div>
  );
}
