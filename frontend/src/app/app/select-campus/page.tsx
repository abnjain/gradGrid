"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { School, ChevronRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import type { WorkspaceOrganization } from "@/types";

function SelectCampusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId");
  const { loadWorkspaces, selectContext, isLoading, isAuthenticated, user } = useAuth();
  const { addToast } = useToast();

  const [organization, setOrganization] = React.useState<WorkspaceOrganization | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectingId, setSelectingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.userType === "platform") {
      router.replace("/login");
      return;
    }
    if (!organizationId) {
      router.replace("/app/select-organization");
      return;
    }

    let cancelled = false;

    async function fetchWorkspaces() {
      setLoading(true);
      try {
        const orgs = await loadWorkspaces();
        if (cancelled) return;
        const match = orgs.find((org) => org.id === organizationId) || null;
        setOrganization(match);
        if (!match) {
          addToast({ variant: "error", title: "Organization not found" });
          router.replace("/app/select-organization");
        }
      } catch {
        if (!cancelled) {
          addToast({ variant: "error", title: "Failed to load campuses" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWorkspaces();
    return () => { cancelled = true; };
  }, [
    addToast,
    isAuthenticated,
    isLoading,
    loadWorkspaces,
    organizationId,
    router,
    user?.userType,
  ]);

  async function handleSelect(institutionId: string) {
    if (!organizationId || !organization) return;
    setSelectingId(institutionId);
    try {
      await selectContext(organizationId, institutionId);
      router.push("/app/dashboard");
    } catch {
      addToast({ variant: "error", title: "Could not select campus. Please try again." });
    } finally {
      setSelectingId(null);
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <Link
        href="/app/select-organization"
        className="inline-flex items-center gap-1.5 text-sm text-mid hover:text-ink mb-6 no-underline hover:no-underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to organizations
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-display text-ink">Choose your campus</h1>
        <p className="text-sm text-mid mt-2">
          {organization
            ? `Select a campus under ${organization.name}.`
            : "Select the campus you want to work in."}
        </p>
      </div>

      {loading ? (
        <div className="text-center text-sm text-mid py-12">Loading campuses…</div>
      ) : !organization || organization.institutions.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-mid">No campuses are available for this organization.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {organization.institutions.map((campus) => (
            <button
              key={campus.id}
              type="button"
              disabled={selectingId === campus.id}
              onClick={() => handleSelect(campus.id)}
              className="flex items-center gap-4 w-full rounded-xl border border-border bg-surface p-4 text-left hover:border-brand/40 hover:bg-brand/5 transition-colors disabled:opacity-60"
            >
              <div className="w-11 h-11 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                <School className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink truncate">{campus.name}</p>
                <p className="text-xs text-mid mt-0.5">Code: {campus.code}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-mid flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SelectCampusPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-sm text-mid py-12">Loading campuses…</div>
      }
    >
      <SelectCampusContent />
    </Suspense>
  );
}
