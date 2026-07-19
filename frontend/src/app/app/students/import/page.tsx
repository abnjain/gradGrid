"use client";

import React from "react";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function ImportStudentsFormPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/app/students"><Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Import Students</h1>
          <p className="text-sm text-mid mt-0.5">Bulk import students via CSV or Excel file</p>
        </div>
      </div>

      <Card className="p-6 max-w-2xl">
        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Import Method" required placeholder="Select method" options={[{"value":"","label":"Select method"},{"value":"csv","label":"CSV File"},{"value":"excel","label":"Excel File"}]} />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button type="submit">
              <Save className="w-4 h-4" />
              Upload & Import
            </Button>
            <Link href="/app/students"><Button variant="ghost">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
