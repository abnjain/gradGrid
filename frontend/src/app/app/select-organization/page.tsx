"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import type { WorkspaceOrganization } from "@/types";

export default function SelectOrganizationPage() {
  const router = useRouter();
  const { loadWorkspaces, isLoading, isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const [organizations, setOrganizations] = React.useState<WorkspaceOrganization[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.userType === "platform") {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function fetchWorkspaces() {
      setLoading(true);
      try {
        const orgs = await loadWorkspaces();
        if (cancelled) return;
        setOrganizations(orgs);
      } catch {
        if (!cancelled) {
          addToast({ variant: "error", title: "Failed to load organizations" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWorkspaces();
    return () => { cancelled = true; };
  }, [addToast, isAuthenticated, isLoading, loadWorkspaces, router, user?.userType]);

  function handleSelect(orgId: string) {
    router.push(`/app/select-campus?organizationId=${orgId}`);
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-display text-ink">Choose your organization</h1>
        <p className="text-sm text-mid mt-2">
          Select the organization you want to work with. You will choose a campus next.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-sm text-mid py-12">Loading organizations…</div>
      ) : organizations.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-mid">No organizations are linked to your account.</p>
          <p className="text-xs text-mid mt-2 mb-5">Register a new institution or contact your administrator for access.</p>
          <Button size="sm">
            <Link href="/signup" className="inline-flex items-center gap-2 no-underline text-inherit">
              <Plus className="w-4 h-4" />
              Register institution
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {organizations.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => handleSelect(org.id)}
              className="flex items-center gap-4 w-full rounded-xl border border-border bg-surface p-4 text-left hover:border-brand/40 hover:bg-brand/5 transition-colors"
            >
              <div className="w-11 h-11 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink truncate">{org.name}</p>
                <p className="text-xs text-mid mt-0.5">
                  {org.institutions.length} campus{org.institutions.length === 1 ? "" : "es"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-mid flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-dashed border-border bg-surface/60 p-5 text-center">
        <p className="text-sm font-medium text-ink">Need to add another institution?</p>
        <p className="text-xs text-mid mt-1 mb-4">
          Submit a new signup application. Once approved, it will appear here.
        </p>
        <Button variant="secondary" size="sm">
          <Link href="/signup" className="inline-flex items-center gap-2 no-underline text-inherit">
            <Plus className="w-4 h-4" />
            Register another institution
          </Link>
        </Button>
      </div>
    </div>
  );
}
