"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { DollarSign, ReceiptText, PiggyBank, Wallet, Users, BarChart3 } from "lucide-react";

export default function FinancePage() {
  return (
    <ModuleHub
      title="Finance"
      description="Manage fee structures, collections, and salary."
      features={[
        { title: "Fee Structures", href: "/app/finance/fee-structures", icon: ReceiptText, description: "Create and manage fee structures by class.", color: "amber" },
        { title: "Scholarships", href: "/app/finance/scholarships", icon: PiggyBank, description: "Manage scholarships and discounts.", color: "brand" },
        { title: "Fee Collection", href: "/app/finance/collections", icon: Wallet, description: "Record and manage fee collections.", color: "amber" },
        { title: "Salary Management", href: "/app/finance/salary", icon: Users, description: "Manage staff salary and disbursements.", color: "info" },
        { title: "Fee Reports", href: "/app/finance/reports/fees", icon: BarChart3, description: "Collection summaries, outstanding reports, and exports.", color: "success" },
        { title: "Salary Reports", href: "/app/finance/reports/salary", icon: DollarSign, description: "Monthly salary summaries and exports.", color: "info" },
      ]}
    />
  );
}
