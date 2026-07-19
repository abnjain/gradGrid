"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function FormPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/institutions"><Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-xl font-bold font-display text-ink">New Institution</h1><p className="text-sm text-mid mt-0.5">Register a new institution on the platform</p></div>
      </div>
      <Card className="p-6 max-w-2xl">
        <form className="flex flex-col gap-5" onSubmit={e => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" placeholder="Enter institution name" />
          <select className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"><option value="">Select org</option><option value="edutrust">EduTrust</option>
<option value="learncorp">LearnCorp</option></select>
          <select className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"><option value="">Select plan</option><option value="starter">Starter</option>
<option value="professional">Professional</option>
<option value="enterprise">Enterprise</option></select>
          <input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" placeholder="admin@school.edu" />
          <input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" placeholder="Enter phone" />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button type="submit"><Save className="w-4 h-4" />Create Institution</Button>
            <Link href="/admin/institutions"><Button variant="ghost">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
