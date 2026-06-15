"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, DatabaseZap, Fingerprint, GitBranch, Scale } from "lucide-react";
import { useState } from "react";

const stages = [
  {
    title: "DuckDB",
    subtitle: "Ingestion",
    icon: DatabaseZap,
    body:
      "Layer 1 uses DuckDB to parse high-volume CSV evidence in memory, normalize names and addresses, and export a clean parquet master layer. The goal is fast relational parsing without committing noisy evidence into an operational database too early."
  },
  {
    title: "Entity Resolution",
    subtitle: "Canonical Mapping",
    icon: Fingerprint,
    body:
      "Layer 2 performs canonical identity mapping across FBR filings, vehicle registry rows, property deeds, and DISCO utility data. It combines embedding similarity, fuzzy name matching, locality-aware address comparisons, and graph clustering to collapse fragmented identities into a single canonical profile."
  },
  {
    title: "Financial Math",
    subtitle: "Wealth Gap",
    icon: Scale,
    body:
      "Layer 3 aggregates declared income, registered assets, vehicle values, property valuations, and utility consumption. The engine calculates the mismatch between declared filings and visible lifestyle footprint so investigators can see the financial gap behind each profile."
  },
  {
    title: "Memgraph MAGE",
    subtitle: "Graph Science",
    icon: GitBranch,
    body:
      "Layer 4 utilizes Memgraph Cloud for graph data science features including PageRank, Louvain Modularity, and relationship centrality analysis. These graph signals are combined with a Scikit-Learn Isolation Forest to detect abnormal asset networks and hidden clusters."
  },
  {
    title: "Groq AI",
    subtitle: "Explainability",
    icon: BrainCircuit,
    body:
      "Layer 5 sends the ranked forensic profile into an agentic Groq LLM prompt. The model produces a concise audit justification notice, translating numerical anomalies into a formal Section 111-style legal narrative suitable for review."
  }
];

export function ArchitecturePage() {
  const [activeStage, setActiveStage] = useState(0);
  const active = stages[activeStage];
  const Icon = active.icon;

  return (
    <div className="mx-auto max-w-[1500px]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mb-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300">Pipeline Deep Dive</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-6xl">
          Five forensic layers, one evidence path.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
          Click a stage to expand the technical story behind the intelligence pipeline.
        </p>
      </motion.div>

      <section className="border border-white/10 bg-white/5 p-5 backdrop-blur-md">
        <div className="relative grid gap-4 lg:grid-cols-5">
          <div className="absolute left-[10%] right-[10%] top-1/2 hidden h-px bg-gradient-to-r from-emerald-300/10 via-emerald-300/60 to-rose-300/30 lg:block" />
          {stages.map((stage, index) => {
            const StageIcon = stage.icon;
            const selected = index === activeStage;

            return (
              <motion.button
                key={stage.title}
                type="button"
                onClick={() => setActiveStage(index)}
                whileHover={{ y: -6, rotateX: 2 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className={`relative min-h-64 border p-5 text-left backdrop-blur-md transition ${
                  selected ? "border-emerald-300/60 bg-emerald-300/10" : "border-white/10 bg-slate-950/45 hover:border-white/20"
                }`}
              >
                {selected ? (
                  <motion.span
                    layoutId="stage-packet"
                    className="absolute -top-2 left-6 h-3 w-3 bg-emerald-300 shadow-[0_0_22px_rgba(16,185,129,0.8)]"
                  />
                ) : null}
                <div className="grid h-12 w-12 place-items-center border border-white/10 bg-slate-950/70 text-emerald-200">
                  <StageIcon className="h-5 w-5" />
                </div>
                <p className="mt-8 text-xs uppercase tracking-[0.24em] text-slate-500">Layer {index + 1}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">{stage.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{stage.subtitle}</p>
                <motion.div
                  animate={selected ? { opacity: [0.35, 1, 0.35] } : { opacity: 0.16 }}
                  transition={{ duration: 1.5, repeat: selected ? Infinity : 0 }}
                  className="absolute bottom-5 left-5 right-5 h-1 bg-gradient-to-r from-emerald-300 via-sky-300 to-rose-300"
                />
              </motion.button>
            );
          })}
        </div>
      </section>

      <AnimatePresence mode="wait">
        <motion.section
          key={active.title}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.35 }}
          className="mt-6 border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center border border-emerald-300/40 bg-emerald-300/10 text-emerald-200">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Expanded Layer Analysis</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {active.title}: {active.subtitle}
              </h3>
              <p className="mt-5 max-w-5xl text-base leading-8 text-slate-300">{active.body}</p>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
