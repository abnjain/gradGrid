"use client";

import React from "react";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function InviteUserFormPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/app/users"><Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Invite User</h1>
          <p className="text-sm text-mid mt-0.5">Send an invitation to a new user</p>
        </div>
      </div>

      <Card className="p-6 max-w-2xl">
        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Email" placeholder="user@school.edu" required type="email" />
          <Input label="Full Name" placeholder="Enter full name" required />
          <Select label="Role" required placeholder="Select role" options={[{"value":"","label":"Select role"},{"value":"admin","label":"Admin"},{"value":"teacher","label":"Teacher"},{"value":"accountant","label":"Accountant"},{"value":"hr","label":"HR"},{"value":"receptionist","label":"Receptionist"}]} />
          <Select label="Department" required placeholder="Select department" options={[{"value":"","label":"Select department"},{"value":"science","label":"Science"},{"value":"math","label":"Mathematics"},{"value":"english","label":"English"},{"value":"admin","label":"Administration"},{"value":"finance","label":"Finance"}]} />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button type="submit">
              <Save className="w-4 h-4" />
              Send Invitation
            </Button>
            <Link href="/app/users"><Button variant="ghost">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
