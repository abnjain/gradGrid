"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { X, AlertTriangle } from "lucide-react";
import type { ModalSize } from "@/types";
import { Button } from "./button";

/* ─── Types ─── */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showClose?: boolean;
  warn?: boolean;
  warnTitle?: string;
  warnMessage?: string;
  icon?: React.ReactNode;
  className?: string;
}

/* ─── Size Map ─── */
const sizeMap: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-64px)]",
};

/* ─── Modal ─── */
function Modal({
  open,
  onClose,
  title,
  size = "md",
  children,
  footer,
  showClose = true,
  warn,
  warnTitle,
  warnMessage,
  icon,
  className,
}: ModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      const timer = setTimeout(() => setVisible(false), 150);
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-150",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          "relative bg-surface rounded-xl shadow-xl w-full transition-all duration-150",
          sizeMap[size],
          open ? "animate-modal-in" : "opacity-0 scale-96 translate-y-2",
          className
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 min-w-0">
              {icon && <div className="flex-shrink-0">{icon}</div>}
              {title && (
                <h2 className="text-[17px] font-bold font-display text-ink truncate">{title}</h2>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-mist hover:bg-surface-raised hover:text-charcoal transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Warning box */}
        {warn && (
          <div className="mx-6 mb-4 p-3 bg-accent-dim border border-accent-mid rounded-lg flex gap-3">
            <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              {warnTitle && <p className="text-sm font-semibold text-accent-text">{warnTitle}</p>}
              {warnMessage && <p className="text-xs text-accent-text mt-0.5 leading-[1.6]">{warnMessage}</p>}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-6 pb-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Confirm Modal ─── */
export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

const confirmVariants = {
  danger: { icon: <AlertTriangle className="w-6 h-6 text-danger" />, bg: "bg-danger-dim", btn: "danger" as const },
  warning: { icon: <AlertTriangle className="w-6 h-6 text-accent" />, bg: "bg-accent-dim", btn: "warning" as const },
  info: { icon: <AlertTriangle className="w-6 h-6 text-info" />, bg: "bg-info-dim", btn: "primary" as const },
};

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading,
}: ConfirmModalProps) {
  const v = confirmVariants[variant];
  return (
    <Modal open={open} onClose={onClose} size="sm" showClose={false}>
      <div className="flex flex-col items-center text-center py-4">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-4", v.bg)}>
          {v.icon}
        </div>
        <h3 className="text-[17px] font-bold font-display text-ink mb-2">{title}</h3>
        <p className="text-sm text-mid leading-[1.6] max-w-[280px]">{message}</p>
      </div>
      <div className="flex gap-2 pt-4 border-t border-border">
        <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={v.btn} className="flex-1" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export { Modal, ConfirmModal };
