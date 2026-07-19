"use client";

import React from "react";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditTeacherFormPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/app/teachers"><Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Edit Teacher</h1>
          <p className="text-sm text-mid mt-0.5">Update teacher information</p>
        </div>
      </div>

      <Card className="p-6 max-w-2xl">
        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" placeholder="Ananya" required />
          <Input label="Last Name" placeholder="Gupta" required />
          <Select label="Department" required placeholder="Science" options={[{"value":"","label":"Science"},{"value":"science","label":"Science"},{"value":"math","label":"Mathematics"},{"value":"english","label":"English"},{"value":"social","label":"Social Studies"}]} />
          <Input label="Email" placeholder="ananya.g@school.edu" required type="email" />
          <Input label="Phone" placeholder="+91 98765 12345" required />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button type="submit">
              <Save className="w-4 h-4" />
              Update Teacher
            </Button>
            <Link href="/app/teachers"><Button variant="ghost">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
