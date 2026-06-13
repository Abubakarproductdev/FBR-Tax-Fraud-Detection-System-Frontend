"use client";

import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Building2,
  Car,
  CheckCircle2,
  ChevronDown,
  DatabaseZap,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  Gauge,
  GitBranch,
  Loader2,
  Network,
  Play,
  Scale,
  ShieldAlert,
  Sparkles,
  UploadCloud,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { fetchProfiles, runPipeline, uploadFiles } from "@/lib/api";
import { formatCompactPkr, formatCurrency, formatScore } from "@/lib/format";
import type { Profile } from "@/types/domain";

type TierId = "compliant" | "moderate" | "high" | "extreme";
type PipelineState = "idle" | "running" | "complete" | "error";

const tiers: Array<{ id: TierId; label: string; min: number; max: number; tone: string }> = [
  { id: "compliant", label: "Compliant (0-20)", min: 0, max: 20, tone: "border-emerald-300/40 text-emerald-200" },
  { id: "moderate", label: "Moderate (21-40)", min: 21, max: 40, tone: "border-sky-300/40 text-sky-200" },
  { id: "high", label: "High Risk (41-80)", min: 41, max: 80, tone: "border-amber-300/40 text-amber-100" },
  { id: "extreme", label: "Extreme Evasion (81-100)", min: 81, max: 100, tone: "border-rose-300/50 text-rose-100" }
];

const pipelineStages = [
  { title: "DuckDB Ingestion", detail: "Relational parsing", icon: DatabaseZap },
  { title: "Entity Resolution Engine", detail: "Canonical mapping", icon: Fingerprint },
  { title: "Financial Math Engine", detail: "Wealth gap calculation", icon: Scale },
  { title: "Memgraph MAGE", detail: "Louvain, PageRank, Isolation Forest", icon: GitBranch },
  { title: "Explainable AI", detail: "Agentic LLM audit narrative", icon: BrainCircuit }
];

const sampleRows = [
  ["FBR-1029", "Hashir A.", "reported income: 0", "address field missing"],
  ["EX-77L", "H. Ahmed", "3000cc vehicle", "owner address: partial match"],
  ["PROP-431", "Hashir Ahmed", "residential asset", "registry typo detected"],
  ["DISCO-998", "H Ahmed", "PKR 774,948 annual utility", "meter linked by locality"]
];

const aliases = [
  "Hashir Ahmed",
  "Shahzad Monthly Profile",
  "Nadia Property Cluster",
  "Imran Utility Ledger",
  "Sana Vehicle Network",
  "Farhan Asset Profile",
  "Ayesha Tax Return Link",
  "Bilal Holding Pattern"
];

function getAlias(canonicalId: string) {
  const checksum = canonicalId.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
  return aliases[checksum % aliases.length];
}

function getTier(score: number) {
  return tiers.find((tier) => score >= tier.min && score <= tier.max) ?? tiers[0];
}

function getMismatch(profile: Profile) {
  return Math.max(
    0,
    profile.total_visible_wealth_pkr + profile.annual_utility_bill_pkr - profile.total_declared_income
  );
}

function clampPercent(value: number, max: number) {
  if (!max) return 0;
  return Math.min(100, Math.max(6, (value / max) * 100));
}

export function CinematicIntelligenceHub() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [activeTier, setActiveTier] = useState<TierId>("extreme");
  const [pipelineState, setPipelineState] = useState<PipelineState>("idle");
  const [activeStage, setActiveStage] = useState(-1);
  const [message, setMessage] = useState<string | null>(null);

  async function loadProfiles() {
    try {
      const nextProfiles = await fetchProfiles();
      setProfiles(nextProfiles);
      setSelectedProfile((current) => current ?? nextProfiles[0] ?? null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "FastAPI profile service is not reachable.");
    }
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  function mergeFiles(nextFiles: FileList | File[]) {
    const incoming = Array.from(nextFiles);
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
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    mergeFiles(event.dataTransfer.files);
  }

  async function initializeOrchestrator() {
    setPipelineState("running");
    setMessage(null);
    setActiveStage(0);

    let stage = 0;
    const interval = window.setInterval(() => {
      stage = Math.min(stage + 1, pipelineStages.length - 1);
      setActiveStage(stage);
    }, 1100);

    try {
      if (files.length) {
        await uploadFiles(files);
      }
      await runPipeline();
      window.clearInterval(interval);
      setActiveStage(pipelineStages.length - 1);
      setPipelineState("complete");
      setMessage("AI Orchestrator completed. Intelligence matrix refreshed.");
      await loadProfiles();
      document.getElementById("intelligence")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      window.clearInterval(interval);
      setPipelineState("error");
      setMessage(err instanceof Error ? err.message : "Pipeline execution failed.");
    }
  }

  const filteredProfiles = useMemo(() => {
    const tier = tiers.find((item) => item.id === activeTier) ?? tiers[3];
    return profiles
      .filter((profile) => profile.final_hybrid_risk_score >= tier.min && profile.final_hybrid_risk_score <= tier.max)
      .sort((a, b) => b.final_hybrid_risk_score - a.final_hybrid_risk_score);
  }, [activeTier, profiles]);

  const maxMismatch = useMemo(
    () => Math.max(...profiles.map((profile) => getMismatch(profile)), 1),
    [profiles]
  );

  return (
    <main className="relative overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_15%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_78%_8%,rgba(244,63,94,0.12),transparent_26%),linear-gradient(135deg,#020617,#18181b_46%,#0f172a)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <PresentationSection id="ingestion" eyebrow="01 / Raw Evidence Intake" title="Synthetic CSVs become forensic signal.">
        <div className="grid min-h-[calc(100vh-9rem)] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
          >
            <p className="max-w-xl text-lg leading-8 text-slate-300">
              Upload raw FBR, Excise, Property, and Utility evidence. The interface keeps the source chaos visible before the orchestrator converts it into a ranked intelligence matrix.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["FBR Returns", "Excise", "Property", "Utility"].map((label, index) => (
                <FloatingFile key={label} label={label} delay={index * 0.12} />
              ))}
            </div>
          </motion.div>

          <TiltCard>
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
              className={`grid min-h-[340px] cursor-pointer place-items-center border border-dashed p-8 text-center transition ${
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
                  if (event.target.files) mergeFiles(event.target.files);
                }}
              />
              <div>
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="mx-auto grid h-20 w-20 place-items-center border border-emerald-300/40 bg-emerald-300/10 text-emerald-200 shadow-[0_0_44px_rgba(16,185,129,0.22)]"
                >
                  <UploadCloud className="h-8 w-8" />
                </motion.div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">Drop raw CSV evidence</h3>
                <p className="mt-3 text-sm text-slate-400">or click to select the synthetic source files.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
                  {files.length ? files.map((file) => <span key={`${file.name}-${file.size}`} className="border border-white/10 bg-white/5 px-3 py-1.5">{file.name}</span>) : <span>No local files staged</span>}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setPreviewOpen((current) => !current)}
                className="inline-flex flex-1 items-center justify-center gap-2 border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/50 hover:bg-sky-300/10"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Preview Messy Data
                <ChevronDown className={`h-4 w-4 transition ${previewOpen ? "rotate-180" : ""}`} />
              </button>
              <button
                type="button"
                onClick={initializeOrchestrator}
                disabled={pipelineState === "running"}
                className="inline-flex flex-1 items-center justify-center gap-2 border border-emerald-300/50 bg-emerald-300/15 px-4 py-3 text-sm font-semibold text-emerald-50 shadow-[0_0_44px_rgba(16,185,129,0.2)] transition hover:bg-emerald-300/20 disabled:cursor-wait disabled:opacity-70"
              >
                {pipelineState === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Initialize AI Orchestrator
              </button>
            </div>

            <AnimatePresence>
              {previewOpen ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 overflow-x-auto border border-white/10 bg-slate-950/50">
                    <table className="w-full min-w-[620px] text-left text-xs">
                      <thead className="text-slate-500">
                        <tr>
                          {["source_id", "name_fragment", "raw_value", "data_quality_note"].map((header) => (
                            <th key={header} className="border-b border-white/10 px-3 py-3 font-medium uppercase tracking-[0.16em]">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sampleRows.map((row) => (
                          <tr key={row.join("-")} className="border-b border-white/5 text-slate-300">
                            {row.map((cell) => <td key={cell} className="px-3 py-3">{cell}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </TiltCard>
        </div>
      </PresentationSection>

      <PresentationSection id="pipeline" eyebrow="02 / Neural Execution Pipeline" title="Watch the evidence move through the machine.">
        <div className="min-h-[calc(100vh-9rem)] content-center">
          <div className="relative grid gap-4 lg:grid-cols-5">
            <div className="absolute left-[10%] right-[10%] top-1/2 hidden h-px bg-gradient-to-r from-emerald-300/10 via-emerald-300/60 to-rose-300/30 lg:block" />
            {pipelineStages.map((stage, index) => {
              const Icon = stage.icon;
              const active = pipelineState === "running" ? index <= activeStage : pipelineState === "complete";

              return (
                <motion.div
                  key={stage.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className={`relative min-h-72 border p-5 backdrop-blur-md transition ${
                    active ? "border-emerald-300/50 bg-emerald-300/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  {pipelineState === "running" && index === activeStage ? (
                    <motion.span
                      layoutId="packet"
                      className="absolute -top-2 left-6 h-3 w-3 bg-emerald-300 shadow-[0_0_22px_rgba(16,185,129,0.8)]"
                    />
                  ) : null}
                  <div className="grid h-12 w-12 place-items-center border border-white/10 bg-slate-950/70 text-emerald-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-8 text-xs uppercase tracking-[0.24em] text-slate-500">Stage {index + 1}</p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight">{stage.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{stage.detail}</p>
                  <motion.div
                    animate={active ? { opacity: [0.25, 1, 0.25] } : { opacity: 0.18 }}
                    transition={{ duration: 1.4, repeat: active ? Infinity : 0 }}
                    className="absolute bottom-5 left-5 right-5 h-1 bg-gradient-to-r from-emerald-300 via-sky-300 to-rose-300"
                  />
                </motion.div>
              );
            })}
          </div>
          {message ? (
            <div className={`mt-8 flex items-start gap-3 border p-4 text-sm ${
              pipelineState === "error"
                ? "border-rose-300/40 bg-rose-300/10 text-rose-100"
                : "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
            }`}>
              {pipelineState === "error" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
              {message}
            </div>
          ) : null}
        </div>
      </PresentationSection>

      <PresentationSection id="intelligence" eyebrow="03 / Intelligence Matrix" title="Judges see the risk tiers, then the legal story.">
        <div className="grid min-h-[calc(100vh-9rem)] gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              {tiers.map((tier) => {
                const active = tier.id === activeTier;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setActiveTier(tier.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold tracking-tight transition ${
                      active
                        ? `${tier.tone} bg-white/10 shadow-[0_0_24px_rgba(255,255,255,0.08)]`
                        : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-100"
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 space-y-3">
              {filteredProfiles.length ? filteredProfiles.map((profile) => {
                const selected = selectedProfile?.canonical_id === profile.canonical_id;
                const tier = getTier(profile.final_hybrid_risk_score);

                return (
                  <motion.button
                    key={profile.canonical_id}
                    type="button"
                    onClick={() => setSelectedProfile(profile)}
                    whileHover={{ x: 8, rotateY: -2 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className={`group w-full border p-4 text-left backdrop-blur-md transition ${
                      selected
                        ? "border-emerald-300/60 bg-emerald-300/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-4">
                      <span>
                        <span className="block text-lg font-semibold text-white">{getAlias(profile.canonical_id)}</span>
                        <span className="mt-1 block font-mono text-xs text-slate-500">{profile.canonical_id.slice(0, 8)}...{profile.canonical_id.slice(-6)}</span>
                      </span>
                      <span className={`shrink-0 border px-3 py-1.5 font-mono text-xs ${tier.tone}`}>
                        {formatScore(profile.final_hybrid_risk_score)}
                      </span>
                    </span>
                    <span className="mt-4 block h-1 overflow-hidden bg-white/10">
                      <span
                        className="block h-full bg-gradient-to-r from-emerald-300 via-amber-300 to-rose-300"
                        style={{ width: `${Math.min(100, profile.final_hybrid_risk_score)}%` }}
                      />
                    </span>
                  </motion.button>
                );
              }) : (
                <div className="border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
                  No profiles in this tier yet. Run the orchestrator or select another score band.
                </div>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedProfile ? (
              <ForensicDossier
                key={selectedProfile.canonical_id}
                profile={selectedProfile}
                alias={getAlias(selectedProfile.canonical_id)}
                maxMismatch={maxMismatch}
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                className="grid min-h-96 place-items-center border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md"
              >
                <div>
                  <Network className="mx-auto h-10 w-10 text-emerald-200" />
                  <p className="mt-4 text-lg font-semibold">Select an individual to open the forensic dossier.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PresentationSection>
    </main>
  );
}

function PresentationSection({
  id,
  eyebrow,
  title,
  children
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative z-10 min-h-screen scroll-mt-24 px-4 py-24 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7 }}
          className="mb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-300">{eyebrow}</p>
          <h2 className="mt-4 max-w-5xl text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl lg:text-7xl">
            {title}
          </h2>
        </motion.div>
        {children}
      </div>
    </section>
  );
}

function TiltCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ rotateX: 1.8, rotateY: -2.2, y: -6 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      className="border border-white/10 bg-white/5 p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur-md [transform-style:preserve-3d]"
    >
      {children}
    </motion.div>
  );
}

function FloatingFile({ label, delay }: { label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: [0, -10, 0] }}
      transition={{ opacity: { delay }, y: { duration: 4, repeat: Infinity, delay, ease: "easeInOut" } }}
      className="flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
    >
      <FileSpreadsheet className="h-5 w-5 text-emerald-200" />
      <span className="text-sm font-medium text-slate-200">{label}</span>
    </motion.div>
  );
}

function ForensicDossier({
  profile,
  alias,
  maxMismatch
}: {
  profile: Profile;
  alias: string;
  maxMismatch: number;
}) {
  const mismatch = getMismatch(profile);
  const declaredPercent = clampPercent(profile.total_declared_income, Math.max(mismatch, 1));
  const assetPercent = clampPercent(mismatch, maxMismatch);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 42, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 28, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 180, damping: 24 }}
      className="border border-white/10 bg-white/5 p-5 shadow-2xl shadow-rose-950/20 backdrop-blur-md"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-rose-200">Forensic Dossier</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">{alias}</h3>
          <p className="mt-2 font-mono text-xs text-slate-500">{profile.canonical_id}</p>
        </div>
        <span className="inline-flex items-center gap-2 border border-rose-300/50 bg-rose-300/10 px-3 py-2 text-sm font-semibold text-rose-100">
          <ShieldAlert className="h-4 w-4" />
          {formatScore(profile.final_hybrid_risk_score)}
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ContrastPanel
          icon={FileText}
          label="Declared FBR Filings"
          value={formatCurrency(profile.total_declared_income)}
          bar={declaredPercent}
          tone="bg-emerald-300"
        />
        <ContrastPanel
          icon={Car}
          label="Detected Graph Assets"
          value={formatCompactPkr(mismatch)}
          bar={assetPercent}
          tone="bg-rose-300"
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <EvidenceChip icon={Building2} label="Property" value="Registry linked" />
        <EvidenceChip icon={Car} label="Vehicle" value="3000cc signal" />
        <EvidenceChip icon={Zap} label="Utility" value={formatCompactPkr(profile.annual_utility_bill_pkr)} />
      </div>

      <div className="mt-6 border border-rose-300/40 bg-rose-300/[0.07] p-5">
        <div className="flex items-center gap-3 text-rose-100">
          <Sparkles className="h-5 w-5" />
          <h4 className="text-lg font-semibold tracking-tight">AI Audit: Section 111 Legal Narrative</h4>
        </div>
        <p className="mt-5 border-l-2 border-rose-200/70 bg-slate-950/60 px-5 py-4 text-base leading-8 text-slate-100">
          {profile.audit_justification_notice || "No Groq audit justification notice is available for this profile yet."}
        </p>
      </div>

      <a
        href="#ingestion"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:text-emerald-100"
      >
        Return to evidence intake
        <ArrowRight className="h-4 w-4" />
      </a>
    </motion.aside>
  );
}

function ContrastPanel({
  icon: Icon,
  label,
  value,
  bar,
  tone
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  bar: number;
  tone: string;
}) {
  return (
    <div className="border border-white/10 bg-slate-950/50 p-4">
      <div className="flex items-center justify-between gap-3 text-slate-400">
        <p className="text-xs uppercase tracking-[0.18em]">{label}</p>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-5 break-words text-2xl font-semibold text-white">{value}</p>
      <div className="mt-4 h-2 bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${bar}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${tone}`}
        />
      </div>
    </div>
  );
}

function EvidenceChip({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-slate-950/45 p-3">
      <Icon className="h-4 w-4 text-emerald-200" />
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}
