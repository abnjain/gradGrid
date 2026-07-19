"use client";

import React from "react";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewAdmissionFormPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/app/admissions"><Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">New Admission</h1>
          <p className="text-sm text-mid mt-0.5">Register a new student admission application</p>
        </div>
      </div>

      <Card className="p-6 max-w-2xl">
        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Student Name" placeholder="Enter full name" required />
          <Input label="Date of Birth" placeholder="YYYY-MM-DD" required />
          <Select label="Gender" required placeholder="Select gender" options={[{"value":"","label":"Select gender"},{"value":"male","label":"Male"},{"value":"female","label":"Female"},{"value":"other","label":"Other"}]} />
          <Select label="Applying for Class" required placeholder="Select class" options={[{"value":"","label":"Select class"},{"value":"nursery","label":"Nursery"},{"value":"kg","label":"KG"},{"value":"1","label":"Class 1"},{"value":"2","label":"Class 2"},{"value":"3","label":"Class 3"}]} />
          <Input label="Parent Name" placeholder="Enter parent/guardian name" required />
          <Input label="Parent Email" placeholder="parent@email.com" required type="email" />
          <Input label="Phone" placeholder="Enter contact number" required />
          <Textarea label="Address" placeholder="Enter full address" rows={3} />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button type="submit">
              <Save className="w-4 h-4" />
              Submit Application
            </Button>
            <Link href="/app/admissions"><Button variant="ghost">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
