"use client";

import React from "react";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function AddNewBookFormPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/app/library"><Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Add New Book</h1>
          <p className="text-sm text-mid mt-0.5">Add a new book to the library catalog</p>
        </div>
      </div>

      <Card className="p-6 max-w-2xl">
        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Book Title" placeholder="Enter book title" required />
          <Input label="Author" placeholder="Enter author name" required />
          <Input label="ISBN" placeholder="Enter ISBN number" required />
          <Input label="Publisher" placeholder="Enter publisher" required />
          <Select label="Category" required placeholder="Select category" options={[{"value":"","label":"Select category"},{"value":"fiction","label":"Fiction"},{"value":"non-fiction","label":"Non-Fiction"},{"value":"textbook","label":"Textbook"},{"value":"reference","label":"Reference"},{"value":"magazine","label":"Magazine"}]} />
          <Input label="Quantity" placeholder="Number of copies" required />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button type="submit">
              <Save className="w-4 h-4" />
              Add Book
            </Button>
            <Link href="/app/library"><Button variant="ghost">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
