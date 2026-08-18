"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Table, PersonCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import {
  Plus,
  Search,
  Download,
  Upload,
  Filter,
  Users,
  FileSpreadsheet,
  FileText,
  RotateCcw,
} from "lucide-react";

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
  { id: "6", name: { name: "Kavya Nair", subtitle: "kavya.n@school.edu", badge: { text: "Active", variant: "status-active" } }, class: "8-A", rollNo: "8012", gender: "Female", status: "Active" },
];

const columns = [
  { key: "name", header: "Student", sortable: true, width: "280px",
    render: (item: StudentsItem) => <PersonCell person={item.name} /> },
  { key: "class", header: "Class", sortable: true, width: "100px" },
  { key: "rollNo", header: "Roll No", width: "100px" },
  { key: "gender", header: "Gender", width: "90px" },
  { key: "status", header: "Status", width: "100px" },
];

const allClasses = [...new Set(mockData.map((s) => s.class))];
const allStatuses = [...new Set(mockData.map((s) => s.status))];
const allGenders = [...new Set(mockData.map((s) => s.gender))];

interface StudentFilters {
  status: string;
  class: string;
  gender: string;
}

const defaultFilters: StudentFilters = { status: "all", class: "all", gender: "all" };

/* ─── Click-outside / Escape helper ─── */
function useDismiss(
  open: boolean,
  close: () => void,
  ref: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close, ref]);
}

/* ─── Add Student List dropdown (CSV / Excel upload) ─── */
function AddStudentListMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const csvInput = useRef<HTMLInputElement>(null);
  const excelInput = useRef<HTMLInputElement>(null);
  const close = () => setOpen(false);
  useDismiss(open, close, ref);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Upload className="w-4 h-4" />
        Add Student List
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50"
        >
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-mist">Add Student List</p>
          </div>
          <div className="py-1">
            <button
              role="menuitem"
              onClick={() => { close(); csvInput.current?.click(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-surface-raised transition-colors text-sm text-ink"
            >
              <FileSpreadsheet className="w-4 h-4 text-success flex-shrink-0" />
              Upload CSV file
            </button>
            <button
              role="menuitem"
              onClick={() => { close(); excelInput.current?.click(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-surface-raised transition-colors text-sm text-ink"
            >
              <FileText className="w-4 h-4 text-info flex-shrink-0" />
              Upload Excel file
            </button>
          </div>
          <input ref={csvInput} type="file" accept=".csv,text/csv" className="hidden" />
          <input ref={excelInput} type="file" accept=".xlsx,.xls" className="hidden" />
        </div>
      )}
    </div>
  );
}

/* ─── Filters dropdown ─── */
interface FiltersMenuProps {
  filters: StudentFilters;
  onChange: (filters: StudentFilters) => void;
}

function FiltersMenu({ filters, onChange }: FiltersMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useDismiss(open, close, ref);

  const set = (key: keyof StudentFilters, value: string) => onChange({ ...filters, [key]: value });
  const reset = () => onChange(defaultFilters);

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Filter className="w-4 h-4" />
        Filters
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-mist mb-3">Filters</p>
          <div className="space-y-3">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => set("status", e.target.value)}
              options={[
                { value: "all", label: "All statuses" },
                ...allStatuses.map((s) => ({ value: s, label: s })),
              ]}
            />
            <Select
              label="Class"
              value={filters.class}
              onChange={(e) => set("class", e.target.value)}
              options={[
                { value: "all", label: "All classes" },
                ...allClasses.map((c) => ({ value: c, label: c })),
              ]}
            />
            <Select
              label="Gender"
              value={filters.gender}
              onChange={(e) => set("gender", e.target.value)}
              options={[
                { value: "all", label: "All genders" },
                ...allGenders.map((g) => ({ value: g, label: g })),
              ]}
            />
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
            <Button size="sm" onClick={close}>Apply</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [filters, setFilters] = useState<StudentFilters>(defaultFilters);

  const filtered = mockData.filter((row) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q || String(row.name?.name || row.name || "").toLowerCase().includes(q);
    const matchesStatus = filters.status === "all" || row.status === filters.status;
    const matchesClass = filters.class === "all" || row.class === filters.class;
    const matchesGender = filters.gender === "all" || row.gender === filters.gender;
    return matchesQuery && matchesStatus && matchesClass && matchesGender;
  });

  const activeFilterCount =
    (filters.status !== "all" ? 1 : 0) +
    (filters.class !== "all" ? 1 : 0) +
    (filters.gender !== "all" ? 1 : 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Page header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Students</h1>
          <p className="text-sm text-mid mt-0.5">View and manage all enrolled students</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/app/students/export" className="no-underline hover:no-underline">
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </Link>
          <AddStudentListMenu />
          <Link href="/app/students/new" className="no-underline hover:no-underline">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary + toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-mid">
          <Users className="w-4 h-4" />
          <span>
            <strong className="text-ink font-semibold">{filtered.length}</strong> students
          </span>
          {selectedIds.size > 0 && (
            <span className="text-brand font-medium">{selectedIds.size} selected</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-72 max-w-full">
            <Input
              placeholder="Search students..."
              iconLeft={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <FiltersMenu filters={filters} onChange={setFilters} />
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters(defaultFilters)}
              className="text-xs text-brand hover:underline"
            >
              Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>

      {/* Student list */}
      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(item) => item.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(item) => { window.location.href = `/app/students/${item.id}`; }}
        bulkActions={
          selectedIds.size > 0 ? (
            <span className="text-sm text-mid">{selectedIds.size} selected</span>
          ) : undefined
        }
        page={1}
        totalPages={3}
        totalItems={filtered.length}
      />
    </div>
  );
}
