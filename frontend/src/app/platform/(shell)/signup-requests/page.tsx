"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { CheckCircle2, XCircle, Clock, ArrowLeft } from "lucide-react";

interface SignupRequest {
  id: string;
  status: string;
  organizationName: string;
  institutionName: string;
  institutionCode: string;
  city: string | null;
  state: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  rejectionReason: string | null;
  submittedAt: string;
}

export default function AdminSignupRequestsPage() {
  const { addToast } = useToast();
  const [requests, setRequests] = React.useState<SignupRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionId, setActionId] = React.useState<string | null>(null);
  const [rejectId, setRejectId] = React.useState<string | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ requests: SignupRequest[] }>(
        "/platform/signup-requests?status=pending"
      );
      if (res.success && res.data) {
        setRequests(res.data.requests);
      }
    } catch {
      addToast({ variant: "error", title: "Failed to load signup requests" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function approve(id: string) {
    setActionId(id);
    try {
      const res = await api.post(`/platform/signup-requests/${id}/approve`);
      if (res.success) {
        addToast({ variant: "success", title: "Application approved", description: "Institution provisioned successfully." });
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      addToast({ variant: "error", title: "Approval failed" });
    } finally {
      setActionId(null);
    }
  }

  async function reject(id: string) {
    setActionId(id);
    try {
      const res = await api.post(`/platform/signup-requests/${id}/reject`, {
        reason: rejectReason.trim() || undefined,
      });
      if (res.success) {
        addToast({ variant: "success", title: "Application rejected" });
        setRequests((prev) => prev.filter((r) => r.id !== id));
        setRejectId(null);
        setRejectReason("");
      }
    } catch {
      addToast({ variant: "error", title: "Rejection failed" });
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/platform/dashboard">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Signup requests</h1>
          <p className="text-sm text-mid mt-0.5">Review and approve institution registration applications</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-mid">Loading pending applications…</p>
      ) : requests.length === 0 ? (
        <Card className="p-8 text-center">
          <Clock className="w-10 h-10 text-mist mx-auto mb-3" />
          <p className="text-sm text-mid">No pending signup applications.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((req) => (
            <Card key={req.id} className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-semibold text-ink">{req.institutionName}</h2>
                    <Badge variant={req.emailVerified ? "status-active" : "status-pending"}>
                      {req.emailVerified ? "Email verified" : "Email pending"}
                    </Badge>
                  </div>
                  <p className="text-sm text-mid mb-1">
                    <strong>{req.organizationName}</strong> · Code: {req.institutionCode}
                  </p>
                  <p className="text-sm text-mid">
                    Owner: {req.firstName} {req.lastName} · {req.email}
                    {req.phone ? ` · ${req.phone}` : ""}
                  </p>
                  {(req.city || req.state) && (
                    <p className="text-xs text-mist mt-1">
                      {[req.city, req.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-mist mt-2">
                    Submitted {new Date(req.submittedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <Button
                    size="sm"
                    loading={actionId === req.id && rejectId !== req.id}
                    disabled={actionId === req.id}
                    onClick={() => approve(req.id)}
                    title={req.emailVerified ? undefined : "Email not verified — platform admin can still approve"}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger-outline"
                    disabled={actionId === req.id}
                    onClick={() => setRejectId(req.id)}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </div>

              {rejectId === req.id && (
                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
                  <textarea
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                    placeholder="Optional rejection reason"
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="danger" loading={actionId === req.id} onClick={() => reject(req.id)}>
                      Confirm reject
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setRejectId(null); setRejectReason(""); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
