"use client";

import React from "react";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface IdCard {
  institutionName?: string;
  institutionCode?: string;
  studentName?: string;
  admissionNumber?: string;
  rollNumber?: string | null;
  className?: string | null;
  sectionName?: string | null;
  academicSessionName?: string | null;
  status?: string;
}

export default function PortalIdCardPage() {
  const { addToast } = useToast();
  const [card, setCard] = React.useState<IdCard | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get<{ idCard: IdCard }>("/portal/me/id-card");
        if (!cancelled) setCard(res.data?.idCard || null);
      } catch (err) {
        if (!cancelled) {
          addToast({
            variant: "error",
            title: "ID card unavailable",
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

  if (loading) return <p className="text-sm text-mid">Loading ID card…</p>;
  if (!card) {
    return (
      <p className="text-sm text-mid">
        ID cards are available for student accounts only. Parents can open Children to view linked students.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold font-display text-ink">Student ID card</h1>
        <p className="text-sm text-mid mt-0.5">Issued for your institution only</p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-6 max-w-md shadow-sm">
        <p className="text-xs uppercase tracking-wide text-mid mb-2">{card.institutionName}</p>
        <p className="text-2xl font-display font-bold text-ink mb-4">{card.studentName}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-mid">Admission no.</dt>
            <dd className="text-ink font-medium">{card.admissionNumber}</dd>
          </div>
          <div>
            <dt className="text-mid">Roll no.</dt>
            <dd className="text-ink font-medium">{card.rollNumber || "—"}</dd>
          </div>
          <div>
            <dt className="text-mid">Class</dt>
            <dd className="text-ink font-medium">
              {[card.className, card.sectionName].filter(Boolean).join(" / ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-mid">Session</dt>
            <dd className="text-ink font-medium">{card.academicSessionName || "—"}</dd>
          </div>
        </dl>
        <p className="text-xs text-mid mt-4">Status: {card.status}</p>
      </div>
    </div>
  );
}
