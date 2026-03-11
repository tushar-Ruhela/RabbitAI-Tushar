"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function UploadPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/jobs/${jobId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setStatus("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="border-4 border-foreground bg-white p-8 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
          <h2 className="mb-2 w-max mx-auto px-2 py-1 bg-secondary border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-2xl font-black tracking-tighter text-foreground uppercase">
            Upload Sales Data
          </h2>
          <p className="mb-8 mt-4 font-bold text-foreground/70">
            Drag and drop your .csv or .xlsx file to begin processing.
          </p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-xl border-4 transition-all ${
              isDragOver ? "border-solid border-primary bg-primary/10 scale-[1.02]" : "border-dashed border-foreground/30 bg-foreground/5 hover:bg-foreground/10 hover:border-foreground/50"
            }`}
          >
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
            />
            
            {status === "idle" && !file && (
              <motion.div className="flex flex-col items-center">
                <UploadCloud className="mb-4 h-14 w-14 text-foreground/40" />
                <p className="font-bold text-lg text-foreground">Click or drag file to this area</p>
                <p className="mt-2 text-sm font-medium text-foreground/50 border border-foreground/20 bg-white px-2 py-0.5 rounded">Supported formats: CSV, XLSX</p>
              </motion.div>
            )}

            {file && status === "idle" && (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                <FileSpreadsheet className="mb-4 h-14 w-14 text-primary" />
                <p className="font-black text-xl text-foreground bg-primary/10 px-3 py-1 border-2 border-primary">{file.name}</p>
                <p className="mt-2 font-bold text-sm text-foreground/60">{(file.size / 1024).toFixed(2)} KB</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    uploadFile();
                  }}
                  className="relative z-50 mt-8 rounded-full border-2 border-foreground bg-foreground px-8 py-3 text-base font-black text-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all hover:shadow-none active:scale-95"
                >
                  Upload & Analyze
                </button>
              </motion.div>
            )}

            {status === "uploading" && (
              <motion.div className="flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                <p className="font-black text-lg text-foreground uppercase tracking-widest">Uploading...</p>
                <p className="mt-2 text-sm font-bold text-foreground/60">Taking you back to the dashboard...</p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div className="flex flex-col items-center" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                <CheckCircle2 className="mb-4 h-14 w-14 text-green-600" />
                <p className="font-black text-2xl text-foreground uppercase">Success!</p>
                <p className="mt-2 text-sm font-bold text-foreground/60">Redirecting to dashboard...</p>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
