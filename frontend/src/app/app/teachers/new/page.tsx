"use client";

import React from "react";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function AddNewTeacherFormPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/app/teachers"><Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Add New Teacher</h1>
          <p className="text-sm text-mid mt-0.5">Add a new teacher to the institution</p>
        </div>
      </div>

      <Card className="p-6 max-w-2xl">
        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" placeholder="Enter first name" required />
          <Input label="Last Name" placeholder="Enter last name" required />
          <Select label="Department" required placeholder="Select department" options={[{"value":"","label":"Select department"},{"value":"science","label":"Science"},{"value":"math","label":"Mathematics"},{"value":"english","label":"English"},{"value":"social","label":"Social Studies"},{"value":"arts","label":"Arts"}]} />
          <Input label="Email" placeholder="teacher@school.edu" required type="email" />
          <Input label="Phone" placeholder="Enter phone number" required />
          <Input label="Qualification" placeholder="e.g., M.Sc., B.Ed" required />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button type="submit">
              <Save className="w-4 h-4" />
              Add Teacher
            </Button>
            <Link href="/app/teachers"><Button variant="ghost">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
