"use client";

import React, { useEffect, useState, createContext, useContext, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import type { ToastVariant } from "@/types";

/* ─── Types ─── */
export interface ToastData {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

/* ─── Context ─── */
interface ToastContextType {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* ─── Provider ─── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[360px] pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ─── Icons ─── */
const iconMap: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-success" />,
  error: <AlertCircle className="w-5 h-5 text-danger" />,
  warning: <AlertTriangle className="w-5 h-5 text-accent" />,
  info: <Info className="w-5 h-5 text-info" />,
};

const toastStyles: Record<ToastVariant, string> = {
  success: "border-l-success-mid",
  error: "border-l-danger-mid",
  warning: "border-l-accent-mid",
  info: "border-l-info-mid",
};

/* ─── Toast Item ─── */
function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 200);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto bg-surface border border-border rounded-lg shadow-lg p-4 flex gap-3 items-start transition-all duration-200",
        "border-l-[3px]",
        toastStyles[toast.variant],
        exiting ? "opacity-0 translate-x-4" : "animate-slide-in-right"
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{iconMap[toast.variant]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-mid mt-0.5 leading-[1.6]">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 200); }}
        className="flex-shrink-0 text-mist hover:text-charcoal transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── Standalone Toast (for page-level use without provider) ─── */
export interface ToastProps {
  variant: ToastVariant;
  title: string;
  description?: string;
  onDismiss?: () => void;
  className?: string;
}

function Toast({ variant, title, description, onDismiss, className }: ToastProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-lg shadow-lg p-4 flex gap-3 items-start border-l-[3px] w-[360px] animate-slide-in-right",
        toastStyles[variant],
        className
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{iconMap[variant]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {description && <p className="text-xs text-mid mt-0.5 leading-[1.6]">{description}</p>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="flex-shrink-0 text-mist hover:text-charcoal transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export { Toast };
