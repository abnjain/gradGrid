"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

export default function PortalHomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function handleLogout() {
    await logout();
    router.replace("/portal/login");
  }

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get<Record<string, unknown>>("/portal/me");
        if (!cancelled) setData(res.data || null);
      } catch (err) {
        if (!cancelled) {
          addToast({
            variant: "error",
            title: "Could not load portal",
            description: getApiErrorMessage(err),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [addToast]);

  if (loading) {
    return <p className="text-sm text-mid">Loading your institution portal…</p>;
  }

  const role = data?.role as string | undefined;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Welcome{user?.name ? `, ${user.name}` : ""}</h1>
          <p className="text-sm text-mid mt-0.5">
            Access is limited to your registered institution only.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void handleLogout()}>
          Sign out
        </Button>
      </div>

      {role === "student" && (
        <div className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-3">
          <h2 className="font-display font-semibold text-ink">Your student profile</h2>
          <p className="text-sm text-mid">
            {(data?.student as { name?: string; className?: string; sectionName?: string; institutionName?: string })
              ?.name || "Student"}{" "}
            ·{" "}
            {(data?.student as { institutionName?: string })?.institutionName || "Institution"}
          </p>
          <p className="text-sm text-ink">
            Class: {(data?.student as { className?: string })?.className || "—"} /{" "}
            {(data?.student as { sectionName?: string })?.sectionName || "—"}
          </p>
          <Link href="/portal/id-card" className="text-sm text-brand no-underline hover:underline">
            View ID card
          </Link>
        </div>
      )}

      {role === "parent" && (
        <div className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-3">
          <h2 className="font-display font-semibold text-ink">Your children</h2>
          <p className="text-sm text-mid">
            Only students linked to your parent profile at this institution are shown.
          </p>
          <Link href="/portal/children" className="text-sm text-brand no-underline hover:underline">
            View children
          </Link>
        </div>
      )}

      {!role && (
        <p className="text-sm text-mid">No portal profile is linked to this account yet.</p>
      )}
    </div>
  );
}
