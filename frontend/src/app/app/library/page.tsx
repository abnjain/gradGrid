"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { BookOpen, BookPlus, BookUp, BookCheck, Library, BarChart3 } from "lucide-react";

export default function LibraryPage() {
  return (
    <ModuleHub
      title="Library"
      description="Manage books, catalogue, and library operations."
      features={[
        { title: "Catalogue", href: "/app/library/catalogue", icon: BookOpen, description: "Browse and search the book catalogue.", color: "info" },
        { title: "Add Book", href: "/app/library/books/new", icon: BookPlus, description: "Add a new book to the catalogue.", color: "info" },
        { title: "Issue Book", href: "/app/library/issue", icon: BookUp, description: "Issue books to students or staff.", color: "brand" },
        { title: "Return & Fines", href: "/app/library/return", icon: BookCheck, description: "Manage book returns and fine collection.", color: "amber" },
        { title: "Library Cards", href: "/app/library/cards", icon: Library, description: "Generate and download library cards.", color: "violet" },
        { title: "Library Reports", href: "/app/library/reports", icon: BarChart3, description: "View and export library reports.", color: "success" },
      ]}
    />
  );
}
