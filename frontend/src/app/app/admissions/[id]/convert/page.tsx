"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { usePermissions } from "@/lib/use-permissions";

interface Enquiry {
  id: string;
  status: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string | null;
  applyingForClass: string | null;
}

export default function ConvertApplicationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const { can } = usePermissions();
  const [enquiry, setEnquiry] = React.useState<Enquiry | null>(null);
  const [admissionNumber, setAdmissionNumber] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [converting, setConverting] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await api.get<{ enquiry: Enquiry }>(`/admissions/${params.id}`);
      setEnquiry(res.data?.enquiry || null);
      if (res.data?.enquiry?.status === "converted") {
        addToast({ variant: "error", title: "Already converted" });
      }
    } catch (err) {
      addToast({
        variant: "error",
        title: "Failed to load enquiry",
        description: getApiErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }, [addToast, params.id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function convert() {
    if (!enquiry || !admissionNumber.trim()) return;
    setConverting(true);
    try {
      const res = await api.post<{ studentId: string }>(`/admissions/${enquiry.id}/convert`, {
        admissionNumber: admissionNumber.trim(),
      });
      addToast({
        variant: "success",
        title: "Converted to student",
        description: "Student record and parent link created.",
      });
      router.push(`/app/students/${res.data?.studentId}`);
    } catch (err) {
      addToast({
        variant: "error",
        title: "Convert failed",
        description: getApiErrorMessage(err),
      });
    } finally {
      setConverting(false);
    }
  }

  if (loading) return <p className="text-sm text-mid">Loading enquiry...</p>;
  if (!enquiry) return <p className="text-sm text-mid">Enquiry not found.</p>;

  const alreadyConverted = enquiry.status === "converted";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href={`/app/admissions/${enquiry.id}`}>
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Convert application</h1>
          <p className="text-sm text-mid mt-0.5">
            {enquiry.studentName} · applying for {enquiry.applyingForClass || "—"}
          </p>
        </div>
      </div>

      <Card className="p-6 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-ink">Convert to student</h2>
            <p className="text-sm text-mid">
              Creates a student record and links {enquiry.parentName} as the parent.
            </p>
          </div>
          <Badge variant={alreadyConverted ? "status-inactive" : "status-active"}>
            {alreadyConverted ? "Converted" : "Pending"}
          </Badge>
        </div>

        {!can("admissions.convert") ? (
          <p className="text-sm text-mid">
            You don&apos;t have permission to convert admissions.
          </p>
        ) : alreadyConverted ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-mid">This enquiry has already been converted.</p>
            <div>
              <Link href={`/app/admissions/${enquiry.id}`}>
                <Button variant="secondary" size="sm">Back to enquiry</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Input
              label="Admission number"
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
              placeholder="e.g. ADM-2026-001"
            />
            <div className="flex gap-2">
              <Button disabled={!admissionNumber.trim() || converting} onClick={() => void convert()}>
                <UserPlus className="w-4 h-4" />
                {converting ? "Converting..." : "Convert to student"}
              </Button>
              <Link href={`/app/admissions/${enquiry.id}`}>
                <Button variant="ghost">Cancel</Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
