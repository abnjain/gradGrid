"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "./button";
import { Badge, type BadgeProps } from "./badge";
import { Avatar } from "./avatar";
import { Skeleton } from "./skeleton";

/* ─── Types ─── */
export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
  render?: (item: T) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  loading?: boolean;
  skeletonRows?: number;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (item: T) => void;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (ids: Set<string | number>) => void;
  selectable?: boolean;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  className?: string;
  rowClassName?: string;
  bulkActions?: React.ReactNode;
}

/* ─── Sort Icon ─── */
function SortIcon({ active, direction }: { active: boolean; direction?: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="w-3.5 h-3.5 text-mist flex-shrink-0" />;
  if (direction === "asc") return <ArrowUp className="w-3.5 h-3.5 text-brand flex-shrink-0" />;
  return <ArrowDown className="w-3.5 h-3.5 text-brand flex-shrink-0" />;
}

/* ─── Helper: Person Cell ─── */
export interface PersonCellData {
  name: string;
  subtitle?: string;
  avatarSrc?: string;
  avatarColor?: "teal" | "amber" | "rose" | "violet" | "sky" | "lime" | "orange" | "slate";
  badge?: { text: string; variant: string };
}

export function PersonCell({ person }: { person: PersonCellData }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={person.name} src={person.avatarSrc} color={person.avatarColor} size="sm" />
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-ink truncate">{person.name}</span>
        {person.subtitle && <span className="text-xs text-mid truncate">{person.subtitle}</span>}
      </div>
      {person.badge && (
        <Badge variant={person.badge.variant as NonNullable<BadgeProps["variant"]>}>
          {person.badge.text}
        </Badge>
      )}
    </div>
  );
}

/* ─── Table Component ─── */
function Table<T>({
  columns,
  data,
  keyExtractor,
  loading,
  skeletonRows = 5,
  emptyMessage = "No data found",
  emptyIcon,
  onRowClick,
  selectedIds,
  onSelectionChange,
  selectable,
  page,
  totalPages,
  totalItems,
  onPageChange,
  pageSize,
  sortKey,
  sortDirection,
  onSort,
  className,
  rowClassName,
  bulkActions,
}: TableProps<T>) {
  const allSelected = selectedIds && data.length > 0 && data.every((item) => selectedIds.has(keyExtractor(item)));
  const someSelected = selectedIds && selectedIds.size > 0 && !allSelected;

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((item) => keyExtractor(item))));
    }
  };

  const toggleOne = (id: string | number) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Bulk actions bar */}
      {bulkActions && selectedIds && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-brand-dim/60 border-b border-border animate-fade-in">
          <span className="text-xs font-medium text-brand-text">{selectedIds.size} selected</span>
          {bulkActions}
        </div>
      )}

      {/* Table wrapper */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full border-collapse">
          {/* ── HEADER ── */}
          <thead>
            <tr className="bg-fog">
              {selectable && (
                <th className="w-[44px] px-3 py-3 border-b border-border text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = !!someSelected; }}
                    onChange={toggleAll}
                    className="accent-brand w-3.5 h-3.5 rounded cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold text-mid uppercase tracking-wider border-b border-border whitespace-nowrap select-none",
                    col.sortable && "cursor-pointer hover:text-charcoal transition-colors",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right"
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5",
                      col.align === "right" && "flex-row-reverse"
                    )}
                  >
                    {col.renderHeader ? col.renderHeader() : col.header}
                    {col.sortable && (
                      <SortIcon active={sortKey === col.key} direction={sortKey === col.key ? sortDirection : undefined} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* ── BODY ── */}
          <tbody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-border last:border-b-0">
                  {selectable && (
                    <td className="px-3 py-3"><Skeleton className="w-3.5 h-3.5 rounded" /></td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12">
                  <div className="flex flex-col items-center justify-center gap-2 text-mid">
                    {emptyIcon}
                    <span className="text-sm">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const id = keyExtractor(item);
                const isSelected = selectedIds?.has(id);

                return (
                  <tr
                    key={id}
                    className={cn(
                      "border-b border-border last:border-b-0 transition-colors duration-[0.1s]",
                      onRowClick && "cursor-pointer hover:bg-fog/60",
                      isSelected && "bg-brand-dim/20 hover:bg-brand-dim/30",
                      rowClassName
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selectable && (
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(id)}
                          className="accent-brand w-3.5 h-3.5 rounded cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3 text-sm text-ink",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right"
                        )}
                      >
                        {col.render
                          ? col.render(item)
                          : String((item as Record<string, unknown>)[col.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages && totalPages > 0 && onPageChange && (
        <div className="flex items-center justify-between px-1 mt-3">
          <span className="text-xs text-mid">
            {page || 1} of {totalPages} pages
            {totalItems !== undefined && ` · ${totalItems} total`}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={page === 1 || !page}
              onClick={() => onPageChange((page || 1) - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min((page || 1) - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <Button
                  key={p}
                  variant={p === (page || 1) ? "primary" : "ghost"}
                  size="xs"
                  className={cn(p !== (page || 1) && "text-mid")}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={page === totalPages}
              onClick={() => onPageChange((page || 1) + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { Table };
