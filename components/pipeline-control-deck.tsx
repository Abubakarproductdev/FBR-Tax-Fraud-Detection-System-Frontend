"use client";

import {
  AlertTriangle,
  CheckCircle2,
  DatabaseZap,
  FileSpreadsheet,
  Loader2,
  Network,
  Play,
  RefreshCw,
  UploadCloud,
  Waypoints
} from "lucide-react";
import { DragEvent, useRef, useState } from "react";
import { fetchMetrics, runPipeline, uploadFiles } from "@/lib/api";
import { formatCompactPkr, formatScore } from "@/lib/format";
import type { SystemMetrics } from "@/types/domain";

const layers = [
  {
    title: "Layer 1: In-Memory Ingestion",
    detail: "DuckDB",
    icon: DatabaseZap
  },
  {
    title: "Layer 2: Entity Resolution & Canonical Mapping",
    detail: "Pinecone LSH",
    icon: Network
  },
  {
    title: "Layer 3: Relational Wealth Aggregation & Deviation Engine",
    detail: "Variance modeling",
    icon: Waypoints
  },
  {
    title: "Layer 4: Heterogeneous Graph Convolution Modeling",
    detail: "PyTorch Geometric",
    icon: RefreshCw
  },
  {
    title: "Layer 5: Explainable AI Forensic Case Formulation",
    detail: "Groq Llama 3",
    icon: CheckCircle2
  }
];

export function PipelineControlDeck() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metricsSnapshot, setMetricsSnapshot] = useState<SystemMetrics | null>(null);

  function mergeFiles(nextFiles: FileList | File[]) {
    const incoming = Array.from(nextFiles);
    setFiles((current) => {
      const seen = new Set(current.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
      const uniqueIncoming = incoming.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return [...current, ...uniqueIncoming];
    });
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    mergeFiles(event.dataTransfer.files);
  }

  async function handleUpload() {
    if (!files.length) {
      setError("Select one or more CSV files before uploading.");
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await uploadFiles(files);
      setMessage(response.message ?? `${files.length} file(s) saved on the server.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRunPipeline() {
    setRunning(true);
    setCompleted(false);
    setActiveStep(0);
    setError(null);
    setMessage("Pipeline execution submitted.");

    let animationStep = 0;
    const interval = window.setInterval(() => {
      animationStep += 1;
      setActiveStep(Math.min(animationStep, layers.length - 1));
    }, 950);

    try {
      const response = await runPipeline();
      window.clearInterval(interval);

      for (let index = animationStep + 1; index < layers.length; index += 1) {
        setActiveStep(index);
        await new Promise((resolve) => window.setTimeout(() => resolve(undefined), 420));
      }

      setCompleted(true);
      setMessage(response.message ?? response.status ?? "Intelligence pipeline completed.");

      try {
        const nextMetrics = await fetchMetrics();
        setMetricsSnapshot(nextMetrics);
      } catch {
        setMetricsSnapshot(null);
      }
    } catch (err) {
      window.clearInterval(interval);
      setError(err instanceof Error ? err.message : "Pipeline execution failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-[1600px] gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="xl:col-span-2">
        <div className="flex flex-col justify-between gap-4 border-b border-zinc-800 pb-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-300">Pipeline Control Deck</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Evidence intake and intelligence execution
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Upload CSV evidence, trigger the FastAPI processing chain, and watch each AI layer advance.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunPipeline}
            disabled={running}
            className="inline-flex min-h-12 items-center justify-center gap-3 border border-emerald-400/50 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-100 shadow-emerald-glow transition hover:bg-emerald-400/15 disabled:cursor-wait disabled:opacity-60"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Intelligence Pipeline
          </button>
        </div>
      </section>

      <section className="border border-zinc-800 bg-command-900/80">
        <div className="border-b border-zinc-800 px-5 py-4">
          <h3 className="text-base font-semibold text-white">Drag-and-Drop Ingestion Card</h3>
          <p className="mt-1 text-sm text-zinc-400">Multiple CSV files are stored locally until uploaded.</p>
        </div>

        <div className="p-5">
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
            className={`grid min-h-64 cursor-pointer place-items-center border border-dashed p-6 text-center transition ${
              dragging
                ? "border-emerald-300 bg-emerald-400/10"
                : "border-zinc-700 bg-zinc-950/50 hover:border-emerald-400/60 hover:bg-emerald-400/[0.04]"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                if (event.target.files) mergeFiles(event.target.files);
              }}
            />
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center border border-emerald-400/40 bg-emerald-400/10 text-emerald-200">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="mt-4 text-lg font-semibold text-white">Drop CSV evidence files</p>
              <p className="mt-2 text-sm text-zinc-400">or click to select files from the workstation.</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {files.length ? (
              files.map((file) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex items-center justify-between gap-3 border border-zinc-800 bg-zinc-950/60 px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm text-zinc-200">
                    <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-300" />
                    <span className="truncate">{file.name}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-zinc-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))
            ) : (
              <div className="border border-zinc-800 bg-zinc-950/40 px-3 py-3 text-sm text-zinc-500">
                No local files selected.
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !files.length}
              className="inline-flex items-center justify-center gap-2 border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-emerald-400/60 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Upload to Server
            </button>
            <button
              type="button"
              onClick={() => setFiles([])}
              disabled={!files.length || uploading}
              className="border border-zinc-800 px-4 py-2.5 text-sm text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear Queue
            </button>
          </div>

          {message ? (
            <div className="mt-4 flex items-center gap-2 border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="mt-4 flex items-start gap-2 border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}
        </div>
      </section>

      <section className="border border-zinc-800 bg-command-900/80">
        <div className="border-b border-zinc-800 px-5 py-4">
          <h3 className="text-base font-semibold text-white">Sequential Pipeline Timeline</h3>
          <p className="mt-1 text-sm text-zinc-400">Five-layer forensic AI chain with live execution state.</p>
        </div>

        <div className="p-5">
          <div className="space-y-3">
            {layers.map((layer, index) => {
              const Icon = layer.icon;
              const active = index <= activeStep;
              const current = index === activeStep && running;

              return (
                <div
                  key={layer.title}
                  className={`relative border p-4 transition ${
                    active
                      ? "border-emerald-400/50 bg-emerald-400/10"
                      : "border-zinc-800 bg-zinc-950/45"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center border ${
                        active
                          ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
                          : "border-zinc-700 text-zinc-500"
                      }`}
                    >
                      {current ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white">{layer.title}</h4>
                      <p className="mt-1 text-sm text-zinc-400">{layer.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <RunMetric label="Pipeline State" value={completed ? "Complete" : running ? "Executing" : "Standby"} />
            <RunMetric
              label="Max Risk"
              value={metricsSnapshot ? formatScore(metricsSnapshot.maximum_hybrid_risk_score) : "--"}
            />
            <RunMetric
              label="Unexplained Wealth"
              value={metricsSnapshot ? formatCompactPkr(metricsSnapshot.aggregate_unexplained_wealth_pkr) : "--"}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function RunMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/60 p-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 break-words font-mono text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}
