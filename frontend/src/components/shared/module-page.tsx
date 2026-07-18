"use client";

import React from "react";
import { ComingSoon } from "@/components/ui/empty-state";

/* Module pages are auto-generated placeholders. They'll be implemented as feature
   development progresses. Each page uses the ComingSoon component for now. */

interface ModulePageProps {
  title: string;
  description?: string;
  icon?: string;
}

function ModulePage({ title, description, icon }: ModulePageProps) {
  return <ComingSoon title={title} description={description} icon={icon} />;
}

export { ModulePage };
