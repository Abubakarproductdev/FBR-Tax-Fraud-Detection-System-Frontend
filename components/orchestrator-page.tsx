"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Play,
  TerminalSquare,
  UploadCloud
} from "lucide-react";
import { DragEvent, useEffect, useRef, useState } from "react";
import { API_BASE_URL, runPipeline, uploadFiles } from "@/lib/api";

type RunState = "idle" | "uploading" | "uploaded" | "running" | "complete" | "error";
type ToastState = { id: number; tone: "success" | "error"; message: string } | null;

const processingLogs = [
  "Initializing DuckDB in-memory evidence lake...",
  "Mounting CSV federation layer...",
  "Normalizing CNIC-adjacent identity fragments...",
  "Vectorizing Addresses with multilingual embeddings...",
  "Creating LSH candidate blocks...",
  "Resolving canonical taxpayer entities...",
  "Calculating declared-income baselines...",
  "Aggregating vehicle and property footprints...",
  "Extracting Subgraphs from asset network...",
  "Running Louvain modularity over household clusters...",
  "Computing PageRank and neighborhood centrality...",
  "Scoring Isolation Forest anomaly vectors...",
  "Generating Groq XAI Notices...",
  "Packaging Section 111 audit summaries...",
  "Refreshing intelligence matrix cache..."
];

export function OrchestratorPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState<RunState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "Command Center online. Awaiting CSV evidence bundle."
  ]);

  useEffect(() => {
    if (state !== "running") return;

    let index = 0;
    const interval = window.setInterval(() => {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      setTerminalLines((current) => [
        ...current.slice(-14),
        `[${timestamp}] ${processingLogs[index % processingLogs.length]}`
      ]);
      index += 1;
    }, 520);

    return () => window.clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function showToast(tone: "success" | "error", nextMessage: string) {
    setToast({ id: Date.now(), tone, message: nextMessage });
  }

  async function stageAndUpload(nextFiles: FileList | File[]) {
    const incoming = Array.from(nextFiles).filter((file) => file.name.toLowerCase().endsWith(".csv"));
    if (!incoming.length) {
      showToast("error", "Only .csv files are accepted by the evidence dropzone.");
      return;
    }

    setFiles((current) => {
      const seen = new Set(current.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
      return [
        ...current,
        ...incoming.filter((file) => {
          const key = `${file.name}-${file.size}-${file.lastModified}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
      ];
    });

    setState("uploading");
    setMessage(null);
    setTerminalLines((current) => [
      ...current.slice(-12),
      `Uploading ${incoming.length} CSV file(s) to FastAPI evidence intake...`
    ]);

    try {
      await uploadFiles(incoming);
      setState("uploaded");
      setMessage("Upload complete. Evidence bundle staged for pipeline execution.");
      setTerminalLines((current) => [...current.slice(-12), "Upload complete. Server acknowledged evidence files."]);
      showToast("success", "Upload Complete");
    } catch (err) {
      setState("error");
      const errorMessage = err instanceof Error ? err.message : "Upload failed.";
      setMessage(errorMessage);
      setTerminalLines((current) => [...current.slice(-12), `Upload failed: ${errorMessage}`]);
      showToast("error", errorMessage);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    stageAndUpload(event.dataTransfer.files);
  }

  async function initializeOrchestrator() {
    setMessage(null);
    setState("running");
    setTerminalLines([
      "Initialize Agentic Pipeline command accepted.",
      "Spawning orchestrator process against POST /api/run-pipeline..."
    ]);

    try {
      const response = await runPipeline();
      setState("complete");
      setMessage(response.message ?? "Pipeline executed successfully.");
      setTerminalLines((current) => [
        ...current.slice(-14),
        "Pipeline complete. Forensic profiles and XAI notices are ready for review."
      ]);
      showToast("success", "Pipeline execution complete");
    } catch (err) {
      setState("error");
      const errorMessage = err instanceof Error ? err.message : "Pipeline execution failed.";
      setMessage(errorMessage);
      setTerminalLines((current) => [...current.slice(-14), `Pipeline failed: ${errorMessage}`]);
      showToast("error", errorMessage);
    }
  }

  const busy = state === "uploading" || state === "running";

  return (
    <div className="mx-auto max-w-[1300px]">
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            className={`fixed right-5 top-5 z-50 flex items-center gap-3 border px-4 py-3 text-sm shadow-2xl backdrop-blur-md ${
              toast.tone === "success"
                ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
                : "border-rose-300/40 bg-rose-300/10 text-rose-100"
            }`}
          >
            {toast.tone === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mb-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300">Command Center</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-6xl">
          Evidence upload and agentic execution.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
          Upload CSV source records, then initialize the full FastAPI pipeline while the terminal streams live-style forensic processing telemetry.
        </p>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(460px,1.05fr)]">
        <motion.section
          whileHover={{ rotateX: 1.2, rotateY: -1.5, y: -4 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="border border-white/10 bg-white/5 p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur-md"
        >
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`grid min-h-[380px] cursor-pointer place-items-center border border-dashed p-8 text-center transition ${
              dragging
                ? "border-emerald-300 bg-emerald-300/10"
                : "border-white/15 bg-white/[0.03] hover:border-emerald-300/60"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                if (event.target.files) stageAndUpload(event.target.files);
              }}
            />
            <div>
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto grid h-20 w-20 place-items-center border border-emerald-300/40 bg-emerald-300/10 text-emerald-200 shadow-[0_0_44px_rgba(16,185,129,0.22)]"
              >
                {state === "uploading" ? <Loader2 className="h-8 w-8 animate-spin" /> : <UploadCloud className="h-8 w-8" />}
              </motion.div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight">Drop CSV evidence bundle</h3>
              <p className="mt-3 text-sm text-slate-400">Upload triggers immediately via POST /api/upload.</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setFiles([]);
                setTerminalLines(["Evidence queue cleared. Awaiting CSV evidence bundle."]);
              }}
              disabled={!files.length || busy}
              className="inline-flex flex-1 items-center justify-center gap-2 border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear Queue
            </button>
            <button
              type="button"
              onClick={initializeOrchestrator}
              disabled={busy}
              className="inline-flex flex-1 items-center justify-center gap-2 border border-emerald-300/50 bg-emerald-300/15 px-4 py-3 text-sm font-semibold text-emerald-50 shadow-[0_0_44px_rgba(16,185,129,0.2)] transition hover:bg-emerald-300/20 disabled:cursor-wait disabled:opacity-70"
            >
              {state === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Initialize Agentic Pipeline
            </button>
          </div>
        </motion.section>

        <aside className="space-y-4">
          <TerminalEmulator lines={terminalLines} active={state === "running" || state === "uploading"} />

          <section className="border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <TerminalSquare className="h-5 w-5 text-emerald-200" />
              <div>
                <h3 className="font-semibold text-white">Control Plane</h3>
                <p className="mt-1 text-xs text-slate-500">{API_BASE_URL}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <StatusLine label="Upload endpoint" value="POST /api/upload" />
              <StatusLine label="Pipeline endpoint" value="POST /api/run-pipeline" />
              <StatusLine label="Current state" value={state.toUpperCase()} />
            </div>
          </section>

          <section className="border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <h3 className="font-semibold text-white">Staged Evidence</h3>
            <div className="mt-4 space-y-2">
              {files.length ? (
                files.map((file) => (
                  <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-3 border border-white/10 bg-slate-950/45 px-3 py-3">
                    <span className="flex min-w-0 items-center gap-2 text-sm text-slate-200">
                      <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-200" />
                      <span className="truncate">{file.name}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))
              ) : (
                <p className="border border-white/10 bg-slate-950/45 px-3 py-3 text-sm text-slate-500">No local files staged.</p>
              )}
            </div>
          </section>

          <AnimatePresence>
            {message ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className={`flex items-start gap-3 border p-4 text-sm backdrop-blur-md ${
                  state === "error" ? "border-rose-300/40 bg-rose-300/10 text-rose-100" : "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
                }`}
              >
                {state === "error" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
                {message}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}

function TerminalEmulator({ lines, active }: { lines: string[]; active: boolean }) {
  return (
    <section className="overflow-hidden border border-emerald-300/20 bg-slate-950/70 shadow-2xl shadow-emerald-950/20 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-200">
          {active ? "Streaming" : "Standby"}
        </span>
      </div>
      <div className="scrollbar-command h-80 overflow-hidden p-4 font-mono text-xs leading-6 text-emerald-100">
        <AnimatePresence initial={false}>
          {lines.map((line, index) => (
            <motion.p
              key={`${line}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="whitespace-pre-wrap text-emerald-100/90"
            >
              <span className="text-slate-500">root@govtech-ai:~$ </span>
              {line}
            </motion.p>
          ))}
        </AnimatePresence>
        {active ? <span className="inline-block h-4 w-2 animate-pulse bg-emerald-300 align-middle" /> : null}
      </div>
    </section>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border border-white/10 bg-slate-950/45 px-3 py-3">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <span className="font-mono text-xs text-slate-200">{value}</span>
    </div>
  );
}
