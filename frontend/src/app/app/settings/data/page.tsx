"use client";

import React from "react";
import { SettingsPageLayout } from "@/components/shared/settings-page-layout";
import { DetailCard } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { Database, Download, Trash2, CloudUpload } from "lucide-react";

export default function DataManagementPage() {
  const { addToast } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [retention, setRetention] = React.useState("3years");
  const [backup, setBackup] = React.useState("weekly");
  const [autoArchive, setAutoArchive] = React.useState(true);

  const handleSave = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      addToast({
        variant: "success",
        title: "Data settings saved",
        description: "Retention and backup preferences have been updated.",
      });
    }, 600);
  };

  const handleExport = () => {
    setExporting(true);
    window.setTimeout(() => {
      setExporting(false);
      addToast({
        variant: "success",
        title: "Export started",
        description: "Your data export will be ready for download shortly.",
      });
    }, 900);
  };

  const handleDelete = () => {
    addToast({
      variant: "error",
      title: "Action cancelled",
      description: "Deleting all data requires additional confirmation from an administrator.",
    });
  };

  return (
    <SettingsPageLayout
      title="Data Management"
      description="Data retention and export settings."
    >
      <DetailCard
        title="Retention & Backup"
        subtitle="How long data is kept and how often it is backed up."
        headerRight={
          <div className="w-9 h-9 rounded-lg bg-accent-dim flex items-center justify-center">
            <Database className="w-4.5 h-4.5 text-accent" />
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Data retention"
            options={[
              { value: "1year", label: "Keep for 1 year" },
              { value: "3years", label: "Keep for 3 years" },
              { value: "5years", label: "Keep for 5 years" },
              { value: "forever", label: "Keep forever" },
            ]}
            value={retention}
            onChange={(e) => setRetention(e.target.value)}
          />
          <Select
            label="Backup schedule"
            options={[
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
            ]}
            value={backup}
            onChange={(e) => setBackup(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between py-3 mt-2 border-t border-border">
          <div>
            <p className="text-sm font-medium text-ink">Auto-archive old records</p>
            <p className="text-xs text-mid mt-0.5">Move inactive student records to archive automatically.</p>
          </div>
          <Toggle
            checked={autoArchive}
            onChange={() => setAutoArchive((v) => !v)}
            aria-label="Auto-archive old records"
          />
        </div>
      </DetailCard>

      <DetailCard
        title="Export Data"
        subtitle="Download a full copy of your institution's data."
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">Full data export</p>
            <p className="text-xs text-mid mt-0.5">Students, staff, finance, and attendance records.</p>
          </div>
          <Button variant="secondary" onClick={handleExport} loading={exporting}>
            <Download className="w-4 h-4" />
            Download Export
          </Button>
        </div>
      </DetailCard>

      <DetailCard
        title="Danger Zone"
        subtitle="Irreversible actions. Proceed with caution."
        className="border-danger-mid"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">Delete all institution data</p>
            <p className="text-xs text-mid mt-0.5">Permanently removes all records. This cannot be undone.</p>
          </div>
          <Button variant="danger-outline" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
            Delete Data
          </Button>
        </div>
      </DetailCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          <CloudUpload className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
