"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileSpreadsheet, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/lib/use-permissions";

export default function ExportStudentsPage() {
  const { can } = usePermissions();
  const [downloading, setDownloading] = React.useState(false);

  function downloadCsv() {
    setDownloading(true);
    // Same endpoint used by the Students hub export button.
    window.open("/api/v1/students/export/csv", "_blank");
    window.setTimeout(() => setDownloading(false), 1200);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/app/students">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Export Students</h1>
          <p className="text-sm text-mid mt-0.5">
            Download institution-scoped student records.
          </p>
        </div>
      </div>

      {!can("students.view") ? (
        <Card className="p-6">
          <p className="text-sm text-mid">
            You don&apos;t have permission to export student records.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-semibold text-ink">CSV export</h2>
                <p className="text-sm text-mid mt-0.5">
                  All active students in this institution, with admission number,
                  name, email, phone, roll number, and status.
                </p>
              </div>
              <FileSpreadsheet className="w-5 h-5 text-brand" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="category">CSV</Badge>
              <Badge variant="category-teal">students.csv</Badge>
            </div>
            <Button onClick={() => void downloadCsv()} disabled={downloading}>
              <Download className="w-4 h-4" />
              {downloading ? "Opening..." : "Download CSV"}
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-semibold text-ink">What&apos;s included</h2>
                <p className="text-sm text-mid mt-0.5">
                  The export is scoped to the current institution only.
                </p>
              </div>
              <Users className="w-5 h-5 text-mid" />
            </div>
            <ul className="flex flex-col gap-1.5 text-sm text-charcoal list-disc pl-5">
              <li>Admission number</li>
              <li>First &amp; last name</li>
              <li>Email and phone</li>
              <li>Roll number</li>
              <li>Status (active / inactive)</li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
