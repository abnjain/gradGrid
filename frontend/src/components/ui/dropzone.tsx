"use client";

import React, { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, File, X } from "lucide-react";

/* ─── Dropzone ─── */
export interface DropzoneProps {
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  label?: string;
  hint?: string;
  className?: string;
}

function Dropzone({
  onFilesSelected,
  accept,
  multiple = true,
  maxSize,
  label = "Drop files here or click to upload",
  hint,
  className,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = Array.from(e.dataTransfer.files);
      setFiles(dropped.map((f) => ({ name: f.name, size: f.size })));
      onFilesSelected?.(dropped);
    },
    [onFilesSelected]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) {
      setFiles(selected.map((f) => ({ name: f.name, size: f.size })));
      onFilesSelected?.(selected);
    }
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed border-border-strong rounded-lg p-8 text-center cursor-pointer transition-all duration-[0.14s]",
          "hover:border-brand-mid hover:bg-brand-dim/30",
          isDragOver && "border-brand bg-brand-dim/40 scale-[1.01]",
          "focus-visible:outline-2 focus-visible:outline-brand"
        )}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="sr-only"
        />
        <Upload className={cn("w-8 h-8 mx-auto mb-3 transition-colors", isDragOver ? "text-brand" : "text-mist")} />
        <p className="text-sm text-charcoal font-medium">{isDragOver ? "Release to upload" : label}</p>
        {(accept || maxSize) && (
          <p className="text-xs text-mid mt-1">
            {accept && `Accepts ${accept.split(",").join(", ")}`}
            {accept && maxSize && " · "}
            {maxSize && `Max ${maxSize} MB`}
          </p>
        )}
        {hint && <p className="text-xs text-mist mt-2">{hint}</p>}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-1">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2.5 px-3 py-2 bg-surface border border-border rounded-md"
            >
              <File className="w-4 h-4 text-mist flex-shrink-0" />
              <span className="text-sm text-charcoal flex-1 truncate">{file.name}</span>
              <span className="text-[11px] text-mist flex-shrink-0">{formatSize(file.size)}</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                className="text-mist hover:text-danger transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { Dropzone };
