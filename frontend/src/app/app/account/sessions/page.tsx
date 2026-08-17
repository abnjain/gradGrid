"use client";

import React from "react";
import { SettingsPageLayout } from "@/components/shared/settings-page-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { api, type ApiResponse } from "@/lib/api-client";
import {
  Globe,
  Monitor,
  Smartphone,
  ShieldCheck,
  LogOut,
  RefreshCw,
} from "lucide-react";

interface Session {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
  loggedOutAt: string | null;
}

interface SessionsResponse {
  sessions: Session[];
}

function formatDevice(deviceInfo: string | null): string {
  if (!deviceInfo || deviceInfo === "unknown") return "Unknown device";
  // Browser UA → short label
  if (deviceInfo.includes("curl")) return "API client (curl)";
  if (deviceInfo.includes("Mozilla")) {
    const match = deviceInfo.match(/(Chrome|Firefox|Safari|Edg\/)/);
    if (match) {
      const name = match[1] === "Edg/" ? "Edge" : match[1].replace("/", "");
      return `Web browser (${name})`;
    }
    return "Web browser";
  }
  return deviceInfo.length > 48 ? deviceInfo.slice(0, 48) + "…" : deviceInfo;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function DeviceIcon({ deviceInfo }: { deviceInfo: string | null }) {
  if (!deviceInfo) return <Monitor className="w-4.5 h-4.5 text-mid" />;
  if (deviceInfo.includes("curl")) return <Globe className="w-4.5 h-4.5 text-mid" />;
  if (/Android|iPhone|iPad|Mobile/i.test(deviceInfo))
    return <Smartphone className="w-4.5 h-4.5 text-mid" />;
  return <Monitor className="w-4.5 h-4.5 text-mid" />;
}

export default function SessionsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [revoking, setRevoking] = React.useState<string | null>(null);

  const fetchSessions = React.useCallback(async () => {
    try {
      const res = await api.get<SessionsResponse>("/auth/sessions");
      if (res.success && res.data) {
        setSessions(res.data.sessions);
      } else {
        throw res;
      }
    } catch (err) {
      const apiError = err as Partial<ApiResponse>;
      const message = apiError?.error?.message || "Could not load sessions.";
      addToast({ variant: "error", title: "Failed to load sessions", description: message });
    }
  }, [addToast]);

  // Initial load — `loading` starts true, so no synchronous setState in the effect.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      await fetchSessions();
      if (cancelled) return;
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchSessions]);

  const reload = React.useCallback(
    async (opts?: { showSpinner?: boolean }) => {
      if (opts?.showSpinner) setLoading(true);
      try {
        await fetchSessions();
      } finally {
        setLoading(false);
      }
    },
    [fetchSessions]
  );

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const res = await api.delete(`/auth/sessions/${sessionId}`);
      if (!res.success) throw res;
      addToast({
        variant: "success",
        title: "Session revoked",
        description: "That device has been signed out.",
      });
      await reload();
    } catch (err) {
      const apiError = err as Partial<ApiResponse>;
      const message = apiError?.error?.message || "Could not revoke that session.";
      addToast({ variant: "error", title: "Revoke failed", description: message });
    } finally {
      setRevoking(null);
    }
  };

  // Current session id lives in the JWT — decode it from the access token
  // via the auth context user (the middleware attaches it, but the frontend
  // doesn't store it; we compare against the most recent active session as a
  // fallback below).
  const currentSessionId = user?.sessionId || null;

  const activeCount = sessions.filter((s) => s.isActive).length;

  return (
    <SettingsPageLayout
      title="Active Sessions"
      description="Devices where you're currently signed in. Revoke any you don't recognize."
      backHref="/app/account"
      backLabel="My Account"
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold font-display text-ink">
              Signed-in devices
            </h3>
            <p className="text-xs text-mid mt-0.5">
              {loading ? "Loading…" : `${activeCount} active session${activeCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => reload({ showSpinner: true })}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="w-10 h-10" />}
            title="No sessions"
            description="You don't have any active sessions right now."
          />
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {sessions.map((s) => {
              const isCurrent = currentSessionId === s.id;
              return (
                <div key={s.id} className="flex items-center gap-4 py-4">
                  <div className="w-10 h-10 rounded-lg bg-fog border border-border flex items-center justify-center flex-shrink-0">
                    <DeviceIcon deviceInfo={s.deviceInfo} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink truncate">
                        {formatDevice(s.deviceInfo)}
                      </span>
                      {isCurrent ? (
                        <Badge variant="status-active" dot>This device</Badge>
                      ) : s.isActive ? (
                        <Badge variant="status-active" dot>Active</Badge>
                      ) : (
                        <Badge variant="status-inactive">Signed out</Badge>
                      )}
                    </div>
                    <p className="text-xs text-mid mt-0.5">
                      {s.ipAddress ? `IP ${s.ipAddress} · ` : ""}
                      Signed in {formatDate(s.createdAt)}
                      {s.loggedOutAt ? ` · signed out ${formatDate(s.loggedOutAt)}` : ""}
                    </p>
                  </div>
                  {s.isActive && !isCurrent && (
                    <Button
                      variant="danger-outline"
                      size="sm"
                      loading={revoking === s.id}
                      onClick={() => handleRevoke(s.id)}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Revoke
                    </Button>
                  )}
                  {isCurrent && (
                    <span className="text-xs text-mid flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-success" />
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </SettingsPageLayout>
  );
}
