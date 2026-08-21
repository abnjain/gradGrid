"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, File, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface AdmissionDocument { id: string; documentType: string; originalName: string; mimeType: string; sizeBytes: number; createdAt: string; }
interface Enquiry { id: string; status: string; studentName: string; parentName: string; parentPhone: string; parentEmail: string | null; applyingForClass: string | null; documents: AdmissionDocument[]; }

function toBase64(file: File): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Could not read file")); reader.readAsDataURL(file); }); }

export default function ApplicationDetailsPage() {
  const params = useParams<{ id: string }>();
  const { addToast } = useToast();
  const [enquiry, setEnquiry] = React.useState<Enquiry | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [documentType, setDocumentType] = React.useState("identity");
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);

  const load = React.useCallback(async () => {
    try { const res = await api.get<{ enquiry: Enquiry }>(`/admissions/${params.id}`); setEnquiry(res.data?.enquiry || null); }
    catch (err) { addToast({ variant: "error", title: "Failed to load enquiry", description: getApiErrorMessage(err) }); }
    finally { setLoading(false); }
  }, [addToast, params.id]);
  React.useEffect(() => { void load(); }, [load]);

  async function uploadDocument() {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await api.post(`/admissions/${params.id}/documents`, { documentType, originalName: selectedFile.name, mimeType: selectedFile.type, contentBase64: await toBase64(selectedFile) });
      addToast({ variant: "success", title: "Document uploaded" }); setSelectedFile(null); await load();
    } catch (err) { addToast({ variant: "error", title: "Upload failed", description: getApiErrorMessage(err) }); }
    finally { setUploading(false); }
  }

  async function removeDocument(id: string) {
    try { await api.delete(`/admissions/${params.id}/documents/${id}`); addToast({ variant: "success", title: "Document deleted" }); await load(); }
    catch (err) { addToast({ variant: "error", title: "Delete failed", description: getApiErrorMessage(err) }); }
  }

  if (loading) return <p className="text-sm text-mid">Loading enquiry...</p>;
  if (!enquiry) return <p className="text-sm text-mid">Enquiry not found.</p>;
  return (
    <div className="flex flex-col gap-5"><div className="flex items-center gap-3"><Link href="/app/admissions/pipeline"><Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button></Link><div><h1 className="text-xl font-bold font-display text-ink">{enquiry.studentName}</h1><p className="text-sm text-mid mt-0.5">Admission enquiry · {enquiry.status}</p></div></div>
      <Card className="p-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm"><div><p className="text-mid">Parent or guardian</p><p className="text-ink">{enquiry.parentName}</p></div><div><p className="text-mid">Phone</p><p className="text-ink">{enquiry.parentPhone}</p></div><div><p className="text-mid">Email</p><p className="text-ink">{enquiry.parentEmail || "—"}</p></div><div><p className="text-mid">Applying for class</p><p className="text-ink">{enquiry.applyingForClass || "—"}</p></div></div></Card>
      <Card className="p-6"><div className="flex items-center justify-between mb-4"><div><h2 className="font-semibold text-ink">Documents</h2><p className="text-sm text-mid">Upload supporting documents for this enquiry.</p></div><File className="w-5 h-5 text-mid" /></div><div className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-3 items-end"><label className="flex flex-col gap-1 text-sm font-medium text-charcoal">Document type<select className="w-full h-[38px] px-3 text-sm text-ink bg-surface border-[1.5px] border-border-strong rounded-md" value={documentType} onChange={(e) => setDocumentType(e.target.value)}><option value="identity">Identity</option><option value="birth_certificate">Birth certificate</option><option value="address_proof">Address proof</option><option value="transfer_certificate">Transfer certificate</option><option value="other">Other</option></select></label><Dropzone onFilesSelected={(files) => setSelectedFile(files[0] || null)} accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx" maxSize={7} multiple={false} label="Choose a document" hint="Files are stored against this institution and enquiry." /><Button disabled={!selectedFile || uploading} onClick={() => void uploadDocument()}><Upload className="w-4 h-4" />{uploading ? "Uploading..." : "Upload"}</Button></div><div className="flex flex-col gap-2 mt-5">{enquiry.documents.length === 0 ? <p className="text-sm text-mid">No documents uploaded.</p> : enquiry.documents.map((document) => <div key={document.id} className="flex items-center gap-3 border border-border rounded-md px-3 py-2"><File className="w-4 h-4 text-mid" /><div className="flex-1"><p className="text-sm text-ink">{document.originalName}</p><p className="text-xs text-mid">{document.documentType} · {(document.sizeBytes / 1024).toFixed(0)} KB</p></div><Button variant="ghost" size="icon-sm" aria-label={`Delete ${document.originalName}`} onClick={() => void removeDocument(document.id)}><Trash2 className="w-4 h-4" /></Button></div>)}</div></Card>
    </div>
  );
}
