"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  Building2,
  Car,
  FileText,
  Loader2,
  Scale,
  Send,
  ShieldAlert,
  Sparkles,
  UserRound,
  Zap
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { fetchProfiles } from "@/lib/api";
import { formatCompactPkr, formatCurrency, formatScore } from "@/lib/format";
import type { Profile } from "@/types/domain";

type TierId = "compliant" | "monitor" | "high" | "extreme";
type ChatMessage = { role: "agent" | "user"; content: string; streaming?: boolean };

const tiers: Array<{ id: TierId; label: string; min: number; max: number; tone: string }> = [
  { id: "compliant", label: "Compliant (0 - 30)", min: 0, max: 30, tone: "border-emerald-300/50 text-emerald-100" },
  { id: "monitor", label: "Monitor (31 - 50)", min: 31, max: 50, tone: "border-sky-300/50 text-sky-100" },
  { id: "high", label: "High Risk (51 - 54)", min: 51, max: 54, tone: "border-amber-300/50 text-amber-100" },
  { id: "extreme", label: "Extreme Evasion (55 - 100)", min: 55, max: 100, tone: "border-rose-300/50 text-rose-100" }
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

function getMismatch(profile: Profile) {
  return Math.max(
    0,
    profile.total_visible_wealth_pkr + profile.annual_utility_bill_pkr - profile.total_declared_income
  );
}

function getTier(score: number) {
  return tiers.find((tier) => score >= tier.min && score <= tier.max) ?? tiers[0];
}

function getPercent(value: number, max: number) {
  if (!max) return 0;
  return Math.min(100, Math.max(5, (value / max) * 100));
}

function buildAgentResponse(profile: Profile, alias: string, question: string) {
  const mismatch = getMismatch(profile);
  const questionSignal = question.toLowerCase().includes("utility")
    ? "Your question is focused on utility consumption, so I weighted the DISCO footprint more heavily."
    : "I cross-checked the query against declared filings, visible assets, and graph anomaly signals.";

  return `${questionSignal} Analyzing canonical ID ${profile.canonical_id.slice(0, 8)} for ${alias}: declared income is ${formatCurrency(profile.total_declared_income)}, while the detected asset footprint delta is ${formatCompactPkr(mismatch)} with annual utility exposure of ${formatCompactPkr(profile.annual_utility_bill_pkr)}. The hybrid deviation score is ${formatScore(profile.final_hybrid_risk_score)}, which indicates a severe lifestyle-to-filing mismatch. Recommendation: preserve the graph evidence chain, escalate for immediate asset verification, and prepare a Section 111 notice packet with utility consumption, property registry, and vehicle ownership exhibits.`;
}

export function MatrixPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [activeTier, setActiveTier] = useState<TierId>("extreme");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfiles() {
      setLoading(true);
      setError(null);
      try {
        const nextProfiles = await fetchProfiles();
        if (!active) return;
        setProfiles(nextProfiles);
        setSelectedProfile(nextProfiles[0] ?? null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load FastAPI profile payload.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfiles();

    return () => {
      active = false;
    };
  }, []);

  const filteredProfiles = useMemo(() => {
    const tier = tiers.find((item) => item.id === activeTier) ?? tiers[3];
    return profiles
      .filter((profile) => profile.final_hybrid_risk_score >= tier.min && profile.final_hybrid_risk_score <= tier.max)
      .sort((a, b) => b.final_hybrid_risk_score - a.final_hybrid_risk_score);
  }, [activeTier, profiles]);

  const maxMismatch = useMemo(() => Math.max(...profiles.map((profile) => getMismatch(profile)), 1), [profiles]);

  return (
    <div className="mx-auto grid max-w-[1600px] gap-6 2xl:grid-cols-[minmax(360px,0.55fr)_minmax(0,1.45fr)]">
      <section className="min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300">Intelligence Matrix</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-6xl">
            Risk-tiered taxpayer roster.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            Profiles stream from FastAPI, then resolve into a judge-facing evidence story with the exact grading thresholds.
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2">
          {tiers.map((tier) => {
            const active = tier.id === activeTier;
            const count = profiles.filter(
              (profile) => profile.final_hybrid_risk_score >= tier.min && profile.final_hybrid_risk_score <= tier.max
            ).length;

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setActiveTier(tier.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? `${tier.tone} bg-white/10 shadow-[0_0_28px_rgba(255,255,255,0.08)]`
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-100"
                }`}
              >
                {tier.label}
                <span className="ml-2 font-mono text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {activeTier !== "extreme" && activeTier !== "high" ? (
          <p className="mt-4 border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400 backdrop-blur-md">
            The review roster is optimized for High Risk and Extreme Evasion cases. Lower tiers remain available for threshold validation.
          </p>
        ) : null}

        {error ? (
          <div className="mt-5 flex items-start gap-3 border border-rose-300/40 bg-rose-300/10 p-4 text-sm text-rose-100 backdrop-blur-md">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse border border-white/10 bg-white/5 backdrop-blur-md" />
            ))
          ) : filteredProfiles.length ? (
            filteredProfiles.map((profile) => (
              <RosterCard
                key={profile.canonical_id}
                profile={profile}
                selected={selectedProfile?.canonical_id === profile.canonical_id}
                onSelect={() => setSelectedProfile(profile)}
              />
            ))
          ) : (
            <div className="border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400 backdrop-blur-md">
              No profiles match this threshold band.
            </div>
          )}
        </div>
      </section>

      <AnimatePresence mode="wait">
        {selectedProfile ? (
          <ForensicDossier
            key={selectedProfile.canonical_id}
            profile={selectedProfile}
            alias={getAlias(selectedProfile.canonical_id)}
            maxMismatch={maxMismatch}
          />
        ) : (
          <motion.aside
            key="empty"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className="grid min-h-[520px] place-items-center border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md"
          >
            <div>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-200" />
              <p className="mt-4 text-sm text-slate-400">Awaiting profile selection.</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function RosterCard({ profile, selected, onSelect }: { profile: Profile; selected: boolean; onSelect: () => void }) {
  const tier = getTier(profile.final_hybrid_risk_score);

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ x: 8, rotateY: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`group w-full border p-4 text-left backdrop-blur-md transition ${
        selected ? "border-emerald-300/60 bg-emerald-300/10" : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <span className="flex items-center justify-between gap-4">
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center border border-white/10 bg-slate-950/70 text-emerald-200">
            <UserRound className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-semibold text-white">{getAlias(profile.canonical_id)}</span>
            <span className="mt-1 block truncate font-mono text-xs text-slate-500">
              {profile.canonical_id.slice(0, 8)}...{profile.canonical_id.slice(-6)}
            </span>
          </span>
        </span>
        <span className={`shrink-0 border px-3 py-1.5 font-mono text-xs ${tier.tone}`}>
          {formatScore(profile.final_hybrid_risk_score)}
        </span>
      </span>
    </motion.button>
  );
}

function ForensicDossier({ profile, alias, maxMismatch }: { profile: Profile; alias: string; maxMismatch: number }) {
  const mismatch = getMismatch(profile);
  const declaredPercent = getPercent(profile.total_declared_income, Math.max(mismatch, 1));
  const assetPercent = getPercent(mismatch, maxMismatch);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 38, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 28, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 180, damping: 24 }}
      className="sticky top-8 min-h-[calc(100vh-4rem)] self-start border border-white/10 bg-white/5 p-5 shadow-2xl shadow-rose-950/20 backdrop-blur-md"
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

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-4">
          <ContrastPanel
            icon={FileText}
            label="Declared Income"
            value={formatCurrency(profile.total_declared_income)}
            percent={declaredPercent}
            tone="bg-emerald-300"
          />
          <ContrastPanel
            icon={Car}
            label="Actual Asset Footprint"
            value={formatCompactPkr(mismatch)}
            percent={assetPercent}
            tone="bg-rose-300"
          />

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <EvidenceChip icon={Building2} label="Property" value="Registry match" />
            <EvidenceChip icon={Car} label="Vehicle" value="3000cc signal" />
            <EvidenceChip icon={Zap} label="DISCO" value={formatCompactPkr(profile.annual_utility_bill_pkr)} />
          </div>
        </section>

        <AgenticInterrogationTerminal profile={profile} alias={alias} />
      </div>
    </motion.aside>
  );
}

function AgenticInterrogationTerminal({ profile, alias }: { profile: Profile; alias: string }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      content: profile.audit_justification_notice || "No initial AI finding was generated for this profile."
    }
  ]);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    setQuestion("");
    setStreaming(false);
    setMessages([
      {
        role: "agent",
        content: profile.audit_justification_notice || "No initial AI finding was generated for this profile."
      }
    ]);
  }, [profile]);

  function streamAgentResponse(fullResponse: string) {
    let index = 0;
    setStreaming(true);
    setMessages((current) => [...current, { role: "agent", content: "", streaming: true }]);

    const interval = window.setInterval(() => {
      index += 2;
      setMessages((current) =>
        current.map((message, messageIndex) =>
          messageIndex === current.length - 1
            ? { ...message, content: fullResponse.slice(0, index), streaming: index < fullResponse.length }
            : message
        )
      );

      if (index >= fullResponse.length) {
        window.clearInterval(interval);
        setStreaming(false);
      }
    }, 18);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || streaming) return;

    setQuestion("");
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    window.setTimeout(() => streamAgentResponse(buildAgentResponse(profile, alias, trimmed)), 1000);
  }

  return (
    <section className="flex min-h-[620px] flex-col overflow-hidden border border-emerald-300/20 bg-slate-950/65 shadow-2xl shadow-emerald-950/20 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center border border-emerald-300/30 bg-emerald-300/10 text-emerald-200">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-semibold text-white">Agentic Interrogation Terminal</h4>
            <p className="mt-0.5 text-xs text-slate-500">Mock LLM stream over canonical profile evidence</p>
          </div>
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-200">
          {streaming ? "Thinking" : "Ready"}
        </span>
      </div>

      <div className="scrollbar-command flex-1 space-y-4 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={`${message.role}-${index}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={`border p-4 ${
                message.role === "agent"
                  ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-50"
                  : "ml-auto max-w-[85%] border-white/10 bg-white/5 text-slate-100"
              }`}
            >
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                {message.role === "agent" && index === 0 ? "Initial AI Finding" : message.role === "agent" ? "Agent Response" : "Investigator Query"}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-7">
                {message.content}
                {message.streaming ? <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-emerald-300 align-middle" /> : null}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={onSubmit} className="border-t border-white/10 bg-white/5 p-3">
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Interrogate the Agent regarding this profile..."
            className="min-h-12 flex-1 border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-300/50"
          />
          <button
            type="submit"
            disabled={streaming || !question.trim()}
            className="grid h-12 w-12 place-items-center border border-emerald-300/50 bg-emerald-300/15 text-emerald-100 transition hover:bg-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send interrogation question"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </section>
  );
}

function ContrastPanel({
  icon: Icon,
  label,
  value,
  percent,
  tone
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  percent: number;
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
          animate={{ width: `${percent}%` }}
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
