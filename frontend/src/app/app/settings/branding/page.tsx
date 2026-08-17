"use client";

import React from "react";
import { SettingsPageLayout } from "@/components/shared/settings-page-layout";
import { DetailCard } from "@/components/ui/card";
import { Input, type InputHandle } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Palette, Save, Check } from "lucide-react";

const BRAND_COLORS = [
  { key: "teal", label: "Teal", hex: "#0D9488" },
  { key: "sky", label: "Sky", hex: "#0284C7" },
  { key: "violet", label: "Violet", hex: "#7C3AED" },
  { key: "emerald", label: "Emerald", hex: "#059669" },
  { key: "amber", label: "Amber", hex: "#D97706" },
  { key: "rose", label: "Rose", hex: "#E11D48" },
] as const;

export default function BrandingPage() {
  const { addToast } = useToast();
  const portalNameRef = React.useRef<InputHandle>(null);
  const [portalName, setPortalName] = React.useState("GradGrid");
  const [brandColor, setBrandColor] = React.useState<string>("teal");
  const [logo, setLogo] = React.useState<{ name: string; size: number } | null>(null);
  const [saving, setSaving] = React.useState(false);

  const handleSave = () => {
    const valid = portalNameRef.current?.validate() ?? true;
    if (!valid) {
      addToast({
        variant: "error",
        title: "Please fix the highlighted fields",
        description: "Portal name is required.",
      });
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      addToast({
        variant: "success",
        title: "Branding updated",
        description: "Your portal look and feel has been updated.",
      });
    }, 600);
  };

  return (
    <SettingsPageLayout
      title="Branding"
      description="Logo, colors, and portal appearance."
    >
      <DetailCard
        title="Portal Identity"
        subtitle="The name and logo shown in the header and on sign-in screens."
        headerRight={
          <div className="w-9 h-9 rounded-lg bg-brand-dim flex items-center justify-center">
            <Palette className="w-4.5 h-4.5 text-brand" />
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            ref={portalNameRef}
            label="Portal name"
            required
            validation="name"
            requiredMessage="Portal name is required"
            placeholder="e.g. GradGrid"
            value={portalName}
            onChange={(e) => setPortalName(e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-charcoal">Logo</span>
            <Dropzone
              accept=".png,.jpg,.jpeg,.svg,.webp"
              multiple={false}
              maxSize={2}
              label="Click to upload a logo"
              hint="PNG or SVG, up to 2 MB"
              onFilesSelected={(files) => setLogo(files[0] ?? null)}
            />
          </div>
        </div>
      </DetailCard>

      <DetailCard
        title="Brand Color"
        subtitle="Used for buttons, links, and highlights across the portal."
      >
        <div className="flex flex-wrap gap-3">
          {BRAND_COLORS.map((c) => {
            const selected = brandColor === c.key;
            return (
              <button
                key={c.key}
                type="button"
                aria-label={`Select ${c.label} brand color`}
                aria-pressed={selected}
                onClick={() => setBrandColor(c.key)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all",
                  selected ? "bg-fog ring-2 ring-brand" : "hover:bg-fog"
                )}
              >
                <span
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border border-black/10",
                    selected && "scale-110"
                  )}
                  style={{ backgroundColor: c.hex }}
                >
                  {selected && <Check className="w-4 h-4 text-white" />}
                </span>
                <span className="text-[11px] text-mid font-medium">{c.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-3 p-3 rounded-lg bg-fog border border-border">
          <span className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-bold font-display" style={{ backgroundColor: BRAND_COLORS.find((c) => c.key === brandColor)?.hex }}>
            G
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-ink">{portalName}</span>
            <span className="text-xs text-mid">Preview of your portal branding</span>
          </div>
        </div>
      </DetailCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
