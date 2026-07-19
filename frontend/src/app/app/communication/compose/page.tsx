"use client";

import React from "react";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function ComposeMessageFormPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/app/communication"><Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Compose Message</h1>
          <p className="text-sm text-mid mt-0.5">Send a message or notification to recipients</p>
        </div>
      </div>

      <Card className="p-6 max-w-2xl">
        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Recipients" required placeholder="Select recipients" options={[{"value":"","label":"Select recipients"},{"value":"all-students","label":"All Students"},{"value":"all-parents","label":"All Parents"},{"value":"all-teachers","label":"All Teachers"},{"value":"class-10","label":"Class 10 Only"},{"value":"custom","label":"Custom Selection"}]} />
          <Input label="Subject" placeholder="Enter message subject" required />
          <Textarea label="Message" placeholder="Type your message here..." rows={3} />
          <Select label="Priority" required placeholder="Select priority" options={[{"value":"","label":"Select priority"},{"value":"normal","label":"Normal"},{"value":"important","label":"Important"},{"value":"urgent","label":"Urgent"}]} />
          <Select label="Channel" required placeholder="Select channel" options={[{"value":"","label":"Select channel"},{"value":"email","label":"Email"},{"value":"sms","label":"SMS"},{"value":"both","label":"Email & SMS"},{"value":"in-app","label":"In-App Only"}]} />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button type="submit">
              <Save className="w-4 h-4" />
              Send Message
            </Button>
            <Link href="/app/communication"><Button variant="ghost">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
