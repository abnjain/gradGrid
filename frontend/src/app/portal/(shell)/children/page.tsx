"use client";

import React from "react";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface ChildRow {
  id: string;
  name: string;
  admissionNumber: string;
  className?: string | null;
  sectionName?: string | null;
  status: string;
  isPrimary?: boolean;
}

export default function PortalChildrenPage() {
  const { addToast } = useToast();
  const [children, setChildren] = React.useState<ChildRow[]>([]);
  const [parentName, setParentName] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get<{
          parent: { name: string };
          children: ChildRow[];
        }>("/portal/me/children");
        if (!cancelled) {
          setChildren(res.data?.children || []);
          setParentName(res.data?.parent?.name || "");
        }
      } catch (err) {
        if (!cancelled) {
          addToast({
            variant: "error",
            title: "Children list unavailable",
            description: getApiErrorMessage(err),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [addToast]);

  if (loading) return <p className="text-sm text-mid">Loading children…</p>;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold font-display text-ink">Linked children</h1>
        <p className="text-sm text-mid mt-0.5">
          {parentName ? `${parentName} — ` : ""}
          Only students registered and linked to you at this institution.
        </p>
      </div>
      {children.length === 0 ? (
        <p className="text-sm text-mid">No linked children found for this institution.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {children.map((child) => (
            <li
              key={child.id}
              className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-1"
            >
              <p className="font-medium text-ink">
                {child.name}
                {child.isPrimary ? (
                  <span className="ml-2 text-xs text-mid">Primary</span>
                ) : null}
              </p>
              <p className="text-sm text-mid">
                Admission {child.admissionNumber} ·{" "}
                {[child.className, child.sectionName].filter(Boolean).join(" / ") || "Class TBD"} ·{" "}
                {child.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
