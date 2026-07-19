"use client";

import React from "react";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditStudentFormPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/app/students"><Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Edit Student</h1>
          <p className="text-sm text-mid mt-0.5">Update student information</p>
        </div>
      </div>

      <Card className="p-6 max-w-2xl">
        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" placeholder="Aarav" required />
          <Input label="Last Name" placeholder="Sharma" required />
          <Input label="Date of Birth" placeholder="2010-01-15" required />
          <Select label="Gender" required placeholder="Male" options={[{"value":"","label":"Male"},{"value":"male","label":"Male"},{"value":"female","label":"Female"},{"value":"other","label":"Other"}]} />
          <Select label="Class" required placeholder="10-A" options={[{"value":"","label":"10-A"},{"value":"8-a","label":"8-A"},{"value":"9-b","label":"9-B"},{"value":"10-a","label":"10-A"},{"value":"11-c","label":"11-C"},{"value":"12-a","label":"12-A"}]} />
          <Input label="Email" placeholder="aarav.sharma@school.edu" required type="email" />
          <Input label="Phone" placeholder="+91 98765 43210" required />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button type="submit">
              <Save className="w-4 h-4" />
              Update Student
            </Button>
            <Link href="/app/students"><Button variant="ghost">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
